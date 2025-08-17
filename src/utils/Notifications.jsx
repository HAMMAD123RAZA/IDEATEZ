// FILE: client/src/utils/Notifications.jsx
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const logNotification = async ({ 
  subject, 
  message, 
//   userId = 'anonymous', 
  additionalData = {} 
}) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      subject,
      message,
    //   userId,
      timestamp: serverTimestamp(),
      ...additionalData
    });
    console.log('Notification logged successfully');
    return true;
  } catch (error) {
    console.error('Error logging notification:', error);
    return false;
  }
};

const NotificationLogger = () => null;
export default NotificationLogger;