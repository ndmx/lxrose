import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';

let database;
async function getDatabase() {
  if (database) return database;
  database = (async () => {
    const env = import.meta.env;
    let config = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };
    if (!config.apiKey || !config.projectId || !config.appId) {
      // Firebase Hosting serves public web configuration for the current project.
      const response = await fetch('/__/firebase/init.json');
      if (!response.ok) throw new Error('Firebase configuration is unavailable');
      config = await response.json();
      if (!config.apiKey || !config.projectId || !config.appId) throw new Error('Invalid Firebase configuration');
    }
    return getFirestore(getApps()[0] || initializeApp(config));
  })();
  try { return await database; }
  catch (error) { database = undefined; throw error; }
}

export async function submitPublicForm(collectionName, fields) {
  const db = await getDatabase();
  const result = await addDoc(collection(db, collectionName), { ...fields, timestamp: serverTimestamp() });
  return result.id;
}
