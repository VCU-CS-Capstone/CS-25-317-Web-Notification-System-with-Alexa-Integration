// import { supabase } from '../config/supabaseClient.js';

// // Get notifications for a specific user
// export const getUserNotifications = async (req, res) => {
//   const { userId } = req.params;
  
//   try {
//     const { data: notifications, error } = await supabase
//       .from('reminder_info')
//       .select(`
//         *,
//         events (
//           event_name,
//           start_time,
//           end_time,
//           event_date
//         )
//       `)
//       .eq('events.userID', userId)
//       .order('priority', { ascending: false });

//     if (error) throw error;
//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Mark a notification as read
// export const markNotificationAsRead = async (req, res) => {
//   const { notificationId } = req.params;
  
//   try {
//     const { error } = await supabase
//       .from('reminder_info')
//       .update({ is_read: true })
//       .eq('id', notificationId);

//     if (error) throw error;
//     res.json({ message: 'Notification marked as read' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Create a new notification
// export const createNotification = async (req, res) => {
//   const { device_token, priority, event_id } = req.body;
  
//   try {
//     const { data, error } = await supabase
//       .from('reminder_info')
//       .insert([
//         {
//           device_token,
//           priority,
//           is_read: false,
//           event: event_id
//         }
//       ]);

//     if (error) throw error;
//     res.status(201).json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // SSE endpoint to send real-time notifications
// export const notificationStream = async (req, res) => {
//   const { userId } = req.params;

//   // Set headers for SSE
//   res.writeHead(200, {
//     'Content-Type': 'text/event-stream',
//     'Cache-Control': 'no-cache',
//     'Connection': 'keep-alive'
//   });

//   // Function to check for new notifications
//   const checkNotifications = async () => {
//     try {
//       const currentTime = new Date();
//       const { data: events, error } = await supabase
//         .from('events')
//         .select('*')
//         .eq('userID', userId)
//         .gte('event_date', currentTime.toISOString().split('T')[0]);

//       if (error) throw error;

//       // Filter events that are about to start
//       const upcomingEvents = events.filter(event => {
//         const eventDateTime = new Date(
//           `${event.event_date}T${event.start_time}`
//         );
//         const timeDiff = eventDateTime - currentTime;
//         const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
//         // Notify if event is starting in 15 minutes or less
//         return minutesDiff <= 15 && minutesDiff >= 0;
//       });

//       // Send notifications for upcoming events
//       upcomingEvents.forEach(event => {
//         const notification = {
//           type: 'upcoming_event',
//           event: event.event_name,
//           start_time: event.start_time,
//           message: `Your event "${event.event_name}" starts in 15 minutes!`
//         };
        
//         res.write(`data: ${JSON.stringify(notification)}\n\n`);
//       });
//     } catch (error) {
//       console.error('Error checking notifications:', error);
//     }
//   };

//   // Check for notifications immediately and then every minute
//   checkNotifications();
//   const intervalId = setInterval(checkNotifications, 60000);

//   // Clean up on client disconnect
//   req.on('close', () => {
//     clearInterval(intervalId);
//   });
// };
