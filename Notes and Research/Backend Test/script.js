const loadUsersButton = document.getElementById('load-users');
const userList = document.getElementById('user-list');

loadUsersButton.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/users');
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