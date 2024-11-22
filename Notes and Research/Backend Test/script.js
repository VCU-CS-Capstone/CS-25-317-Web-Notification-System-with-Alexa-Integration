if(document.body.id == "sign"){
  //Show users constants
  const loadUsersButton = document.getElementById('load-users');
  const userList = document.getElementById('user-list');

  //Show events constants
  const loadEventsButton = document.getElementById('load-events');
  const eventList = document.getElementById('event-list'); 

  //Sign Up Constants
  const signUpButton = document.getElementById('sign-up');

  //Event constants
  const eventButton = document.getElementById('event-button'); 

  //Event for showing users
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
  });

  //Event for showing all events
  loadEventsButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const events = await response.json();
      eventList.innerHTML = ''; // Clear the list

      events.forEach(event => {
        const li = document.createElement('li');
        li.textContent = `${event.event_name}`;
        eventList.appendChild(li);
      });
    } 
    catch (error) {
      console.error('Error loading events:', error);
    }
  });

  //Event for signing up
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

  //Event for creating an event
  eventButton.addEventListener('click', async (event) => {
    // Prevent form from reloading the page
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
    } 
    catch (error) {
      console.error('Error creating event:', error);
    }
  });

}



if(document.body.id == "log"){
  //Login Constants
  const loginButton = document.getElementById('login');

  //Event for logging in users
  loginButton.addEventListener('click', async (event) => {
    // Prevent form from reloading the page
    event.preventDefault();

    //Get values from form inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      //Start API call send email and password to backend
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      //Check login response
      if (!response.ok) throw new Error('Failed to log in');
      const userId = await response.json();

      console.log(userId);
    }
    catch (error) {
      console.error('Error signing up:', error);
    }
  });
}
