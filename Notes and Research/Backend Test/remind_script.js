document.addEventListener("DOMContentLoaded", () => {
    if (document.body.id === "add") {
      const loadSessionButton = document.getElementById('load-session');
      const addEventButton = document.getElementById('submit');
  
      if (!loadSessionButton) {
        console.error("Element with id 'load-session' not found.");
        return;
      }
  
      loadSessionButton.addEventListener('click', () => {
        const sessionId = localStorage.getItem('SessionId');
        if (sessionId) {
          console.log(`SessionId: ${sessionId}`);
        } else {
          console.error('No SessionId found in localStorage');
        }
      });

      addEventButton.addEventListener('click', async (event) => {
        // Prevent form from reloading the page
        event.preventDefault();
    
        // Get values from form inputs
        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const start_time = document.getElementById('start-time').value;
        const end_time = document.getElementById('end-time').value;
        const interval = document.getElementById('interval').value;
        const sessionId = localStorage.getItem('SessionId');
    
        try {
          const response = await fetch('http://localhost:5000/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, date, start_time, end_time, interval, sessionId }),
          });
    
          if (!response.ok) throw new Error('Failed to sign up');
    
          console.log('Event added successfully');
        } 
        catch (error) {
          console.error(error);
        }
      });
      document.getElementById('fetch-users').addEventListener('click', async () => {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = 'Loading...';

        try {
          // Fetch all users from the database
          const response = await fetch(`http://localhost:5000/users`);
          const users = await response.json();

          // Clear the list and display users
          usersList.innerHTML = '';
          users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user.username; // Display user name

            // Create a delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.marginLeft = '10px';

            // Add click event to the delete button
            deleteButton.addEventListener('click', async () => {
              if (confirm(`Are you sure you want to delete ${user.username}?`)) {
                try {
                  const deleteResponse = await fetch(`http://localhost:5000/users/${user.id}`, {
                    method: 'DELETE',
                  });

                  if (!deleteResponse.ok) {
                    throw new Error('Failed to delete user');
                  }

                  // Remove user from the list
                  usersList.removeChild(listItem);
                  alert(`${user.username} deleted successfully`);
                } catch (error) {
                  console.error(error);
                  alert('Error deleting user');
                }
              }
            });

            listItem.appendChild(deleteButton);
            usersList.appendChild(listItem);
          });
        } catch (error) {
          console.error(error);
          usersList.innerHTML = 'Failed to fetch users';
        }
      });
      const baseUrl = 'http://localhost:5000';

      async function fetchAndDisplayUserEvents() {
        const eventsList = document.getElementById('events-list');
        eventsList.innerHTML = 'Loading...';

        // Retrieve sessionId from local storage
        const sessionId = localStorage.getItem('SessionId');
        if (!sessionId) {
          eventsList.innerHTML = 'No user session found. Please log in.';
          return;
        }

        try {
          // Fetch events for the user
          const response = await fetch(`${baseUrl}/events?userid=${sessionId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch events');
          }

          const events = await response.json();

          // Clear and populate the event list
          eventsList.innerHTML = '';
          if (events.length === 0) {
            eventsList.innerHTML = '<li>No events found</li>';
            return;
          }

          events.forEach(event => {
            const listItem = document.createElement('li');
            listItem.textContent = `${event.event_name} (${event.event_date})`;

            // Optional: Add a delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.marginLeft = '10px';

            deleteButton.addEventListener('click', async () => {
              if (confirm(`Are you sure you want to delete the event: ${event.event_name}?`)) {
                try {
                  const deleteResponse = await fetch(`${baseUrl}/events/${event.id}`, {
                    method: 'DELETE',
                  });

                  if (!deleteResponse.ok) {
                    throw new Error('Failed to delete event');
                  }

                  // Remove the event from the list
                  eventsList.removeChild(listItem);
                  alert(`Event "${event.event_name}" deleted successfully`);
                } catch (error) {
                  console.error(error);
                  alert('Error deleting event');
                }
              }
            });

            listItem.appendChild(deleteButton);
            eventsList.appendChild(listItem);
          });
        } catch (error) {
          console.error(error);
          eventsList.innerHTML = 'Failed to load events';
        }
      }

      // Call the function to load user-specific events
      fetchAndDisplayUserEvents();

    }
  });
  