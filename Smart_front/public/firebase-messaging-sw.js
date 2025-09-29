// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration (Production - Real Keys)
const firebaseConfig = {
    apiKey: "AIzaSyBiVwP9Z7R1CPv09ze_dtxkABgE3HzDfCQ",
    authDomain: "smart-condominium-101a9.firebaseapp.com",
    projectId: "smart-condominium-101a9",
    storageBucket: "smart-condominium-101a9.firebasestorage.app",
    messagingSenderId: "774384284888",
    appId: "1:774384284888:web:d498b3378633cdc14a93ad"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Notificación';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva notificación',
        icon: '/vite.svg', // You can change this to your app icon
        badge: '/vite.svg',
        tag: payload.data?.notificacion_id || 'default',
        requireInteraction: true,
        data: payload.data,
        actions: [
            {
                action: 'view',
                title: 'Ver'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ]
    };

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received:', event);

    event.notification.close();

    if (event.action === 'view') {
        // Open the app and navigate to notifications
        const urlToOpen = new URL('/', self.location.origin).href;

        const promiseChain = clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((windowClients) => {
            let matchingClient = null;

            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
                if (windowClient.url.includes(self.location.origin)) {
                    matchingClient = windowClient;
                    break;
                }
            }

            if (matchingClient) {
                // Focus existing window
                return matchingClient.focus();
            } else {
                // Open new window
                return clients.openWindow(urlToOpen);
            }
        });

        event.waitUntil(promiseChain);
    }
});

// Handle push events (fallback for when service worker is not properly registered)
self.addEventListener('push', (event) => {
    console.log('Push received:', event);

    if (event.data) {
        const data = event.data.json();
        console.log('Push data:', data);

        const options = {
            body: data.notification?.body || 'Nueva notificación',
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: data.data?.notificacion_id || 'default',
            requireInteraction: true,
            data: data.data
        };

        event.waitUntil(
            self.registration.showNotification(
                data.notification?.title || 'Notificación',
                options
            )
        );
    }
});