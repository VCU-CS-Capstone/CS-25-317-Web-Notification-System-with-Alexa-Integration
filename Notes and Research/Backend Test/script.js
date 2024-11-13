if(document.body.id == "sign"){
  //Show users constants
  const loadUsersButton = document.getElementById('load-users');
  const userList = document.getElementById('user-list');

  //Sign Up Constants
  const signUpButton = document.getElementById('sign-up');

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