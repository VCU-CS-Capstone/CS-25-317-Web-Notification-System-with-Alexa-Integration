if(document.body.id == "sign"){
  //Show users constants
  //const loadUsersButton = document.getElementById('load-users');
  //const userList = document.getElementById('user-list');

  // Sign Up Constants
  const signUpButton = document.getElementById('sign-up');

  // Event constants
  //const eventButton = document.getElementById('event-button'); 
  
  /* Event for showing users
  loadUsersButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const users = await response.json();
      userList.innerHTML = ''; // Clear the list

      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.username} (${user.email})`;
        userList.appendChild(li);
      });
    } 
    catch (error) {
      console.error('Error loading users:', error);
    }
  });*/
 
  // Event for signing up
  signUpButton.addEventListener('click', async (event) => {
    // Prevent form from reloading the page
    event.preventDefault();

    // Get values from form inputs
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) throw new Error('Failed to sign up');

      console.log('User signed up successfully');
    } 
    catch (error) {
      console.error('Error signing up:', error);
    }
  });
}

if(document.body.id == "event"){

  // Show events constants
  const eventList = document.getElementById('event-list'); 
  const eventButton = document.getElementById
  ('event-button'); 
  const username = localStorage.getItem('username'); 

  // Event for displaying all events for the user 
  async function loadEvents(){
    try {

      const userid = localStorage.getItem('userid'); 
      if (!userid){
        alert('You are not logged in!'); 
        window.location.href = 'login.html'; 
        return; 
      }

      const response = await fetch(`http://localhost:5000/events?userid=${userid}`);
      if (!response.ok) throw new Error('Failed to fetch events');

      const events = await response.json(); 
      eventList.innerHTML = ''; 
      const usernameElement = document.getElementById('username-display');
      usernameElement.textContent = `User: ${username}`;  
      
      events.forEach(event=> {
        // Create a list item for event name 
        const li = document.createElement('li'); 
        li.textContent = event.event_name; 

        const nestedUl = document.createElement('ul'); 

        const details = [
          `Date: ${event.event_date}`,
          `Start Time: ${event.start_time}`,
          `End Time: ${event.end_time}`,
          `Calendar Source: ${event.calendar_source}`
        ];

        details.forEach(detail => {
          const detailLi = document.createElement('li');
          detailLi.textContent = detail;
          nestedUl.appendChild(detailLi);
        });

        li.appendChild(nestedUl); 

        // Create buttons
        const button1 = document.createElement('button');
        button1.textContent = 'Edit';

        const button2 = document.createElement('button');
        button2.textContent = 'Delete';

        // Event for delete button 
        button2.addEventListener('click', async () => {
          if (confirm(`Are you sure you want to delete the event: ${event.event_name}?`)) {
            try {
              const deleteResponse = await fetch(`http://localhost:5000/events/${event.id}`, {
                method: 'DELETE',
              });

              if (!deleteResponse.ok) throw new Error('Failed to delete the event');

              // Remove the event from the displayed list
              eventList.removeChild(li);
              console.log(`Event "${event.name}" deleted`);
            } catch (error) {
              console.error('Error deleting event:', error);
              console.log('Failed to delete the event');
            }
          }
        }); 

        li.appendChild(button1); 
        li.appendChild(button2); 

        eventList.appendChild(li); 
      });
    }
    catch (error) {
      console.error('Error in events:', error);
    }
  }
  window.onload = loadEvents;  

  // Event for creating an event
  eventButton.addEventListener('click', async (event) => {

    event.preventDefault();

    // Get values from form inputs
    const event_name = document.getElementById('event-name').value;
    const event_date = document.getElementById('event-date').value;
    const start_time = document.getElementById('event-start-time').value;
    const end_time = document.getElementById('event-end-time').value || null;
    const calendar_source = document.getElementById('calendar-source').value; 

    try {
      const response = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_name, start_time, end_time, event_date, calendar_source}),
      });

      if (!response.ok) throw new Error('Failed to create event');

      console.log('event information:', event_name, event_date, start_time, end_time, calendar_source);

      console.log('Event created successfully');
      window.location.reload(); 
    } 
    catch (error) {
      console.error('Error creating event:', error);
    }
  });
}

if(document.body.id == "log"){
  // Login Constants
  const loginButton = document.getElementById('account-login');

  //Event for logging in users
  loginButton.addEventListener('click', async (event) => {
    // Prevent form from reloading the page
    event.preventDefault();

    // Get values from form inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // Start API call send email and password to backend
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check login response
      if (!response.ok) throw new Error('Failed to log in');
      const data = await response.json();
      const userid = data.id; 
      const username = data.username; 
      localStorage.setItem('userid', userid); 
      localStorage.setItem('username', username);

      window.location.href = 'events.html'; 
      
    }
    catch (error) {
      console.error('Error logging in:', error);
    }
  });
}
