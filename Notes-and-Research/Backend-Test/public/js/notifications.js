class NotificationService {
  constructor(baseUrl = 'http://localhost:3003') {
    this.baseUrl = baseUrl;
    this.eventSource = null;
  }

  // Initialize notification listener
  initializeNotifications(userId) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Request notification permission
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        this.connectToSSE(userId);
      }
    });
  }

  // Connect to Server-Sent Events
  connectToSSE(userId) {
    this.eventSource = new EventSource(`${this.baseUrl}/notifications/stream/${userId}`);

    this.eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      this.showNotification(notification);
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      this.eventSource.close();
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectToSSE(userId), 5000);
    };
  }

  // Show browser notification
  showNotification(notification) {
    if (Notification.permission === 'granted') {
      new Notification(notification.event, {
        body: notification.message,
        icon: '/path/to/your/icon.png' // Add your notification icon
      });
    }
  }

  // Get all notifications for a user
  async getNotifications(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark a notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Disconnect SSE when needed
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
