// Import Firebase scripts for service workers (MUST use "-compat" versions)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyA1lMW1D2wtXDHsuFJKvuerRbRjK39y0YM",
    authDomain: "cs-25-317.firebaseapp.com",
    projectId: "cs-25-317",
    storageBucket: "cs-25-317.firebasestorage.app",
    messagingSenderId: "920068607900",
    appId: "1:920068607900:web:e02406c989697efeec0259",
    vapidKey: "BAloxObNIPRr9QujTLBgmGOQn_kVDcPlm9VXPXYOkJm3WVJLVcb2_SDJLMnw-JF3nYpdOwPtK2NO1hN0QrR30X8"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Log when the service worker starts
console.log("Firebase messaging service worker started");

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Background message received:", payload);
    
    // For debugging
    const payloadData = JSON.stringify(payload);
    console.log("Payload data:", payloadData);
    
    // Extract notification data
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationBody = payload.notification?.body || 'You have a new event';
    
    // Show notification
    self.registration.showNotification(notificationTitle, {
        body: notificationBody,
        icon: "/icon.png",
        badge: "/badge.png"
    });
});

// Ensure service worker stays alive for push notifications
self.addEventListener('notificationclick', function(event) {
    console.log("Notification clicked:", event);
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
        .then(clientList => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});

// Log any push events received
self.addEventListener('push', function(event) {
    console.log("Push event received:", event);
});