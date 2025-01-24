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
    }
  });
  