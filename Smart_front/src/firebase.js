// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartcondominium.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartcondominium",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartcondominium.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// Request permission and get token
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BDefaultVAPIDKeyForDevelopmentPurposesOnly'
            });
            console.log('FCM Token:', token);
            return token;
        } else {
            console.log('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

// Handle incoming messages when app is in foreground
export const onMessageListener = (callback) => {
    console.log('Setting up Firebase onMessage listener...');
    const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Firebase message received:', payload);
        callback(payload);
    });
    return unsubscribe;
};

export { messaging };