import { useEffect, useState } from 'react';
import { messaging, requestNotificationPermission, onMessageListener } from '../firebase';
import { getToken } from 'firebase/messaging';
import { useAuth } from '../context/AuthContext';
import { registrarDispositivo } from '../services/notificationsService';

const useNotifications = () => {
    const [token, setToken] = useState(null);
    const [permission, setPermission] = useState('default');
    const [usingMock, setUsingMock] = useState(false);
    const { user } = useAuth();

    // Initialize notifications
    useEffect(() => {
        const initializeNotifications = async () => {
            try {
                // Check if notifications are supported
                if (!('Notification' in window)) {
                    console.log('This browser does not support notifications');
                    return;
                }

                // Check current permission
                setPermission(Notification.permission);

                // Register device immediately for testing (even without Firebase token)
                if (user) {
                    await registerDeviceToken('test-device-token-for-development');
                }

                // Try Firebase first
                try {
                    const fcmToken = await requestNotificationPermission();
                    if (fcmToken) {
                        setToken(fcmToken);
                        setPermission('granted');
                        setUsingMock(false);

                        // Register device token with backend
                        if (user) {
                            await registerDeviceToken(fcmToken);
                        }
                        console.log('Firebase notifications initialized successfully');
                        return;
                    }
                } catch (firebaseError) {
                    console.warn('Firebase initialization failed, falling back to mock mode:', firebaseError.message);
                }

                // Fallback to mock mode
                console.log('Using mock notification mode for development');
                setUsingMock(true);
                const mockToken = `mock-fcm-token-${Date.now()}`;
                setToken(mockToken);
                setPermission('granted');

            } catch (error) {
                console.error('Error initializing notifications:', error);
            }
        };

        initializeNotifications();
    }, [user]);

    // Register device token with backend
    const registerDeviceToken = async (fcmToken) => {
        try {
            if (!user) return;

            const deviceInfo = {
                token_push: fcmToken,
                tipo_dispositivo: 'web',
                nombre_dispositivo: `${navigator.userAgent} - ${new Date().toISOString()}`,
                activo: true
            };

            await registrarDispositivo(deviceInfo);
            console.log(`Device token registered successfully${usingMock ? ' (mock)' : ''}`);
        } catch (error) {
            console.error('Error registering device token:', error);
        }
    };

    // Listen for foreground messages (Firebase or mock)
    useEffect(() => {
        if (usingMock) {
            // Mock implementation for development
            const simulateNotification = () => {
                setTimeout(() => {
                    console.log('Mock: Simulating received notification');

                    // Show browser notification for testing
                    if (Notification.permission === 'granted') {
                        const notification = new Notification(
                            'Notificación de Prueba (Mock)',
                            {
                                body: 'Esta es una notificación simulada - Firebase no configurado',
                                icon: '/vite.svg',
                                tag: 'mock-notification',
                                requireInteraction: true
                            }
                        );

                        notification.onclick = () => {
                            notification.close();
                            window.focus();
                            // Dispatch custom event to update notification badge
                            window.dispatchEvent(new CustomEvent('notificacion-recibida', {
                                detail: { tipo: 'prueba', mock: true }
                            }));
                        };
                    }

                    // Dispatch event to update UI
                    window.dispatchEvent(new CustomEvent('notificacion-recibida', {
                        detail: { tipo: 'prueba', mock: true }
                    }));

                    // Repeat simulation every 2 minutes
                    simulateNotification();
                }, 120000); // Every 2 minutes
            };

            // Start simulation after 30 seconds
            setTimeout(simulateNotification, 30000);
        } else if (messaging) {
            // Firebase implementation
            console.log('Setting up Firebase message listener...');

            const handleFirebaseMessage = (payload) => {
                console.log('🎉 FIREBASE MESSAGE RECEIVED:', payload);
                console.log('Dispatching notificacion-recibida event...');

                // Show browser notification
                if (Notification.permission === 'granted') {
                    const notification = new Notification(
                        payload.notification?.title || 'Notificación',
                        {
                            body: payload.notification?.body || 'Tienes una nueva notificación',
                            icon: '/vite.svg',
                            tag: payload.data?.notificacion_id || 'default',
                            requireInteraction: true,
                            data: payload.data
                        }
                    );

                    notification.onclick = () => {
                        notification.close();
                        window.focus();
                        console.log('Notification clicked, dispatching event...');
                        window.dispatchEvent(new CustomEvent('notificacion-recibida', {
                            detail: payload.data
                        }));
                    };
                }

                // Dispatch event to update UI
                const event = new CustomEvent('notificacion-recibida', {
                    detail: payload.data
                });
                console.log('Dispatching event:', event);
                window.dispatchEvent(event);
            };

            const unsubscribe = onMessageListener(handleFirebaseMessage);

            console.log('Firebase message listener setup complete');
            return () => {
                console.log('Cleaning up Firebase listener');
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }
    }, [usingMock]);

    // Request permission manually
    const requestPermission = async () => {
        if (usingMock) {
            try {
                const result = await Notification.requestPermission();
                setPermission(result);
                if (result === 'granted') {
                    const mockToken = `mock-fcm-token-${Date.now()}`;
                    setToken(mockToken);
                    if (user) {
                        await registerDeviceToken(mockToken);
                    }
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error requesting permission:', error);
                return false;
            }
        } else {
            const fcmToken = await requestNotificationPermission();
            if (fcmToken) {
                setToken(fcmToken);
                setPermission('granted');
                if (user) {
                    await registerDeviceToken(fcmToken);
                }
                return true;
            }
            setPermission('denied');
            return false;
        }
    };

    return {
        token,
        permission,
        requestPermission,
        usingMock
    };
};

export default useNotifications;