# Todo App

This project is a full-stack Todo application built with React for the client-side and Node.js for the server-side. It provides basic Todo functionalities such as adding tasks, editing tasks, removing tasks, and marking tasks as done. Additionally, users can register and login to access their personalized Todo lists, and their data is securely stored in an SQL database.
Features

* User Authentication: Users can register and login to access their Todo lists. User passwords are securely encrypted using bcrypt and stored in the database.

* JWT Token: JSON Web Tokens (JWT) are used for user login authentication. The token is securely stored as a cookie for subsequent requests.

* Real-time Updates: Utilizes socket.io to enable real-time updates for users. When a user adds a new task on one device, it automatically syncs and appears on other connected devices.

* Material UI Components: The React client utilizes various Material UI components to create a clean and intuitive user interface.

## Technologies Used

* React: A JavaScript library for building user interfaces.

* Node.js: A JavaScript runtime environment for server-side development.

* Express: A minimal and flexible Node.js web application framework.

* SQL Database: Stores user data including Todo lists and user credentials.

* JWT: JSON Web Tokens for secure user authentication.

* bcrypt: A password hashing function used to securely encrypt user passwords.

* Socket.io: Enables real-time bidirectional event-based communication between clients and the server.

## Access the app
You can access the deployed Todo app [here](https://todo-yonathan-43eab9f75c75.herokuapp.com/)
