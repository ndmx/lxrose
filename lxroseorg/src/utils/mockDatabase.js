import { doc, getDoc, updateDoc } from "firebase/firestore";  // Removed unused imports
import { db } from "../firebase";

export const sendMessage = async (fromId, toId, messageObj) => {
  try {
    const fromUser = await getUser(fromId);
    const toUser = await getUser(toId);

    if (!fromUser || !toUser) {
      console.log("User does not exist");
      return false;
    }

    messageObj.timestamp = new Date().toISOString();  // Using local timestamp

    // Update sent messages for fromUser
    const fromUserRef = doc(db, "users", fromId);
    await updateDoc(fromUserRef, {
      sentMessages: [...(fromUser.sentMessages || []), messageObj],
    });

    // Update mailbox for toUser
    const toUserRef = doc(db, "users", toId);
    await updateDoc(toUserRef, {
      mailbox: [...(toUser.mailbox || []), messageObj],
    });

    return true;
  } catch (error) {
    console.error("Error sending message: ", error);
    return false;
  }
};

export const getUser = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userSnap = await getDoc(userDocRef);
  return userSnap.exists() ? userSnap.data() : null;
};
