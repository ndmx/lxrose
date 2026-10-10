const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } = require('firebase/firestore');
const { ref, get, set } = require('firebase/database');

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_DATABASE_EMULATOR_HOST) throw new Error('Run through the demo Firebase emulators only.');
process.env.GCLOUD_PROJECT = 'demo-lxrose';
process.env.JWT_SECRET = 'local-regression-test-secret-only';
process.env.ADMIN_API_KEY = 'local-regression-service-key';
const admin = require('firebase-admin');
const app = require('../server');
const db = admin.firestore();
let env, server, base, hash;
function token(userId, tokenVersion = 0) {
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ userId, tokenVersion, exp: Math.floor(Date.now()/1000)+3600 })}`;
  return `${body}.${crypto.createHmac('sha256', process.env.JWT_SECRET).update(body).digest('base64url')}`;
}
async function request(path, { user = 'staff', method = 'GET', body, key = false, authToken } = {}) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(key ? { 'X-API-Key': process.env.ADMIN_API_KEY } : user ? { Authorization: `Bearer ${authToken || token(user)}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: response.status, data };
}
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-lxrose', firestore: { rules: fs.readFileSync('../lxroseinc/firestore.rules','utf8') }, database: { rules: fs.readFileSync('../lxroseinc/database.rules.json','utf8') } });
  hash = await require('bcrypt').hash('OriginalPass123', 4);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
beforeEach(async () => {
  await env.clearFirestore();
  await Promise.all(['admin','staff','viewer','partner','outsider','legacy'].map(id => db.collection('users').doc(id).set({ username: id, email: `${id}@example.test`, password: hash, tokenVersion: 0, ...(id === 'legacy' ? {} : { role: ['admin','viewer'].includes(id) ? id : 'staff' }), mailbox: [{ message: 'private legacy note', fromName: 'partner', fromEmail: 'partner@example.test' }], sentMessages: [{ message: 'private sent note' }] })));
  await db.collection('contactForms').doc('request').set({ name: 'Care Request', email: 'care@example.test', message: 'Please contact me', timestamp: admin.firestore.Timestamp.now() });
});
after(async () => { if (server) await new Promise(resolve => server.close(resolve)); if (env) await env.cleanup(); await Promise.all(admin.apps.map(app => app.delete())); });

const contact = () => ({ name: 'Example Person', email: 'person@example.test', message: 'A question about your services', timestamp: serverTimestamp() });
const booking = () => ({ name:'Example Person', email:'person@example.test', phone:'', serviceType:'Consultation', serviceCategory:'Care', notes:'', timestamp:serverTimestamp() });
test('anonymous valid submissions succeed for every collection, but cannot be read or updated', async () => {
  const client = env.unauthenticatedContext().firestore();
  const forms = { contactForms: contact(), joinForms: { name:'A Person',email:'a@example.test',timestamp:serverTimestamp() }, mentalServicesBookings:booking(), nursingServiceBookings:booking(), nutritionServiceBookings:booking(), nurseRegistrations:{name:'A Person',email:'a@example.test',qualifications:'RN',yearsOfExperience:'5',availability:'',timestamp:serverTimestamp()} };
  for (const [collection, payload] of Object.entries(forms)) {
    const target=doc(client,collection,'valid');
    await assertSucceeds(setDoc(target,payload));
    await assertFails(getDoc(target));
    await assertFails(updateDoc(target,{name:'Changed'}));
  }
});
test('rules reject poisoned text, oversized fields, forged times and workflow metadata', async () => {
  const client=env.unauthenticatedContext().firestore();
  for (const patch of [{name:{toString:'broken'}},{message:['array']},{email:5},{name:'x'.repeat(121)},{message:'x'.repeat(4001)},{timestamp:Timestamp.fromMillis(Date.now()+86400000)},{timestamp:Timestamp.fromMillis(1)},{status:'closed'},{assignedTo:'attacker'},{internalNotes:'injected'}]) {
    await assertFails(setDoc(doc(client,'contactForms',crypto.randomUUID()),{...contact(),...patch}));
  }
  for (const collection of ['mentalServicesBookings','nursingServiceBookings','nutritionServiceBookings']) {
    await assertFails(setDoc(doc(client,collection,'bad'),{...booking(),notes:{toString:'broken'}}));
    await assertFails(setDoc(doc(client,collection,'status'),{...booking(),status:'new'}));
  }
  await assertFails(setDoc(doc(client,'users','attacker'),{role:'admin'}));
});
test('Realtime Database denies anonymous reads and writes', async () => {
  const client=env.unauthenticatedContext().database();
  await assertFails(get(ref(client,'/'))); await assertFails(set(ref(client,'test'),{public:true}));
});
test('all viewer operational mutation aliases are denied, while staff can update', async () => {
  for (const path of ['/api/forms/contact/request/mark-read','/api/forms/contact/request/archive','/api/forms/contact/request/reply','/api/forms/join/request/mark-welcomed','/api/forms/mental-bookings/request/mark-contacted','/api/forms/nursing-bookings/request/mark-contacted','/api/forms/nurse-registrations/request/mark-reviewed','/api/forms/nutrition-bookings/request/mark-contacted']) assert.equal((await request(path,{user:'viewer',method:'POST',body:{replyMessage:'hello'}})).status,403,path);
  assert.equal((await request('/api/submissions/contact/request',{user:'viewer',method:'PATCH',body:{status:'closed'}})).status,403);
  assert.equal((await request('/api/submissions/contact/request',{method:'PATCH',body:{status:'reviewed',internalNotes:'Follow up'}})).status,200);
  for (const status of ['made-up',{},['closed']]) assert.equal((await request('/api/submissions/contact/request',{method:'PATCH',body:{status}})).status,400);
});
test('malformed legacy records do not break inbox, analytics or CSV exports', async () => {
  await db.collection('contactForms').doc('poison').set({name:{toString:'bad'},message:['bad'],status:{toString:'bad'},timestamp:admin.firestore.Timestamp.now(),updatedAt:{toDate:'bad'}});
  await db.collection('joinForms').doc('bad-time').set({name:'Legacy',timestamp:{toDate:'bad'}});
  const inbox=await request('/api/submissions'); assert.equal(inbox.status,200); assert(inbox.data.submissions.some(row=>row.id==='request'));
  const poison=inbox.data.submissions.find(row=>row.id==='poison'); assert.equal(typeof poison.title,'string');assert.equal(poison.status,'new');assert(poison.invalidFields.includes('name'));assert(poison.invalidFields.includes('status'));
  assert.equal((await request('/api/analytics/dashboard')).status,200);
  assert.equal((await request('/api/forms/contact/export')).status,200);
});
test('pagination preserves older requests with tied timestamps across collections', async () => {
  const time=admin.firestore.Timestamp.fromMillis(Date.now()-10000);
  for(const collection of ['contactForms','joinForms']) for(const id of ['a','B','c','A-','Z_']) await db.collection(collection).doc(id).set({name:id,email:'a@example.test',timestamp:time});
  const ids=[]; let cursor; let pages=0;
  do { const result=await request(`/api/submissions?limit=2${cursor ? `&cursor=${cursor}`:''}`); assert.equal(result.status,200); ids.push(...result.data.submissions.map(row=>row.type+'/'+row.id)); cursor=result.data.nextCursor; assert(++pages<15); } while(cursor);
  assert.equal(ids.length,11);assert.equal(new Set(ids).size,11);
  assert.equal((await request('/api/submissions?cursor=bad')).status,400);
});
test('messages bind sender and participant checks on current and legacy routes', async () => {
  assert.equal((await request('/api/messages/send',{method:'POST',body:{fromUserId:'admin',toUserId:'partner',message:'Spoof'}})).status,403);
  assert.equal((await request('/sendMessage',{method:'POST',body:{fromId:'admin',toId:'partner',messageObj:{message:'Spoof'}}})).status,403);
  const sent=await request('/api/messages/send',{method:'POST',body:{fromUserId:'staff',toUserId:'partner',message:'Hello'}});assert.equal(sent.status,200);
  const stored=(await db.collection('messages').doc(sent.data.messageId).get()).data();assert.equal(stored.fromUserId,'staff');
  assert.equal((await request('/api/messages/conversations/partner')).status,403);
  assert.equal((await request('/api/messages/conversation/staff/partner',{user:'outsider'})).status,403);
  assert.equal((await request('/api/messages/conversation/staff/partner',{user:'admin'})).status,403);
  assert.equal((await request('/api/messages/conversation/staff/partner')).status,200);
  assert.equal((await request(`/api/messages/${sent.data.messageId}/mark-read`,{method:'PUT'})).status,403);
  assert.equal((await request(`/api/messages/${sent.data.messageId}/mark-read`,{user:'partner',method:'PUT'})).status,200);
  assert.equal((await request('/api/messages/conversation/partner/staff/mark-read',{method:'PUT'})).status,403);
  assert.equal((await request('/api/messages/conversation/partner/staff/mark-read',{user:'partner',method:'PUT'})).status,200);
  assert.equal((await request('/api/messages/send',{key:true,method:'POST',body:{toUserId:'partner',message:'No actor'}})).status,403);
  const legacy=await request('/sendMessage',{method:'POST',body:{fromId:'staff',toId:'partner',messageObj:{fromName:'admin',message:'Legacy control'}}});assert.equal(legacy.status,200);
  assert.equal((await db.collection('messages').doc(legacy.data.messageId).get()).data().fromUserId,'staff');
});
test('directory is allowlisted and user details require self or administrator', async () => {
  const result=await request('/api/users/all');assert.equal(result.status,200);
  for (const user of result.data) assert.deepEqual(Object.keys(user).sort(),['email','id','mustChangePassword','role','username']);
  assert.equal((await request('/getUser/partner')).status,403);
  assert.equal((await request('/getUser/staff')).status,200);
  assert.equal((await request('/getUser/partner',{user:'admin'})).status,200);
});
test('password reset and own change revoke all prior tokens; fresh login works', async () => {
  const old=token('partner');
  assert.equal((await request('/api/users/partner/password',{user:'admin',method:'PATCH',body:{newPassword:'NewPassword123'}})).status,200);
  assert.equal((await request('/getUser/partner',{user:'partner',authToken:old})).status,401);
  const login=await request('/login',{user:null,method:'POST',body:{username:'partner',password:'NewPassword123'}});assert.equal(login.status,200);
  assert.equal((await request('/getUser/partner',{user:'partner',authToken:login.data.token})).status,200);
  assert.equal((await request('/api/users/me/password',{user:'partner',authToken:login.data.token,method:'POST',body:{currentPassword:'NewPassword123',newPassword:'AnotherPassword123'}})).status,200);
  assert.equal((await request('/getUser/partner',{user:'partner',authToken:login.data.token})).status,401);
});
test('missing accounts and disabled accounts fail closed; legacy roles cannot administer', async () => {
  assert.equal((await request('/api/submissions',{user:'missing'})).status,401);
  await db.collection('users').doc('staff').update({disabled:true});
  assert.equal((await request('/api/submissions')).status,401);
  assert.equal((await request('/register',{user:'legacy',method:'POST',body:{username:'new',email:'new@example.test',password:'OriginalPass123',role:'admin'}})).status,403);
  assert.equal((await request('/api/submissions/contact/request',{user:'legacy',method:'PATCH',body:{status:'closed'}})).status,403);
  assert.equal((await request('/api/submissions?apiKey='+process.env.ADMIN_API_KEY,{user:null})).status,401);
});
test('unused upload and debug reader are removed', async () => {
  assert.equal((await request('/uploadImage',{user:null,method:'POST',body:{}})).status,404);
  assert.equal((await request('/testFirebase',{user:null})).status,404);
});
test('booking exports preserve service, contact and notes from the canonical form schema', async () => {
  for (const [collection, route] of [['mentalServicesBookings','mental-bookings'],['nursingServiceBookings','nursing-bookings'],['nutritionServiceBookings','nutrition-bookings']]) {
    await db.collection(collection).doc('new').set({name:'Example Person',email:'person@example.test',phone:'123456',serviceType:'Personal consultation',serviceCategory:'Care',notes:'Follow up in the afternoon',timestamp:admin.firestore.Timestamp.now()});
    const result=await request(`/api/forms/${route}/export`);assert.equal(result.status,200);
    for(const expected of ['Personal consultation','person@example.test','Follow up in the afternoon']) assert(result.data.includes(expected),`${route}: missing ${expected}`);
  }
});
test('legacy plaintext password migration cannot overwrite a concurrent reset', async () => {
  await db.collection('users').doc('legacy').update({password:'OldPlaintext123'});
  const bcrypt=require('bcrypt'), original=bcrypt.hash;
  let entered, release;
  const paused=new Promise(resolve=>{entered=resolve;});const gate=new Promise(resolve=>{release=resolve;});
  bcrypt.hash=async (password,...args)=>{ if(password==='OldPlaintext123') {entered();await gate;} return original(password,...args); };
  try {
    const pending=request('/login',{user:null,method:'POST',body:{username:'legacy',password:'OldPlaintext123'}});
    await paused;
    assert.equal((await request('/api/users/legacy/password',{user:'admin',method:'PATCH',body:{newPassword:'ResetPassword123'}})).status,200);
    release();assert.equal((await pending).status,401);
    assert.equal((await request('/login',{user:null,method:'POST',body:{username:'legacy',password:'OldPlaintext123'}})).status,401);
    assert.equal((await request('/login',{user:null,method:'POST',body:{username:'legacy',password:'ResetPassword123'}})).status,200);
  } finally {release();bcrypt.hash=original;}
});
