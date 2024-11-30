if(document.body.id == "sign"){
  //Show users constants
  const loadUsersButton = document.getElementById('load-users');
  const userList = document.getElementById('user-list');

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
}

if(document.body.id == "event"){

  //Show events constants
  const loadEventsButton = document.getElementById('load-events');
  const eventList = document.getElementById('event-list'); 
  const eventButton = document.getElementById('event-button'); 

  //Event for showing all events
  loadEventsButton.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:5000/events');
    if (!response.ok) throw new Error('Failed to fetch events');
    
    const events = await response.json();
    eventList.innerHTML = ''; // Clear the list
    
    events.forEach(event => {
      // Create a list item for the event name
      const li = document.createElement('li');
      li.textContent = event.event_name;
    
      // Create a nested list for event details
      const nestedUl = document.createElement('ul');
    
      // Add each detail as an indented bullet point
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
    
      // Append the nested list to the main list item
      li.appendChild(nestedUl);

      // Create buttons
      const button1 = document.createElement('button');
      button1.textContent = 'Edit';

      const button2 = document.createElement('button');
      button2.textContent = 'Delete';
      if (button2) {
        button2.addEventListener('click', () => {
          alert(`Deleting event: ${event.event_name}`);
        });
      }

      // Append buttons to the list item
      li.appendChild(button1);
      li.appendChild(button2);

      // Append the main list item to the event list
      eventList.appendChild(li);
    });
    
  } 
    catch (error) {
      console.error('Error loading events:', error);
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
  const loginButton = document.getElementById('account-login');

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

      window.location.href = 'events.html'; 
    }
    catch (error) {
      console.error('Error signing up:', error);
    }
  });
}
