const { Server } = require('socket.io');

function initializeSocket(httpsServer) {
    const io = new Server(httpsServer);

    io.on('connection', (socket) => {
        console.log('a user connected with socket id:', socket.id);

        let userEmail;

        socket.on('email', (email) => {
            console.log('email received from client: ', email);

            //store socket in room named after the user's email
            socket.join(email);

            //initialize email variable
            userEmail = email;
        });

        socket.on('addTask', (newTask) => {
            console.log('received new task from socket: ', newTask);

            //send task to all sockets belonging to this email, EXCEPT the sender
            console.log('sending task to email:', userEmail);
            socket.to(userEmail).emit('addTask', newTask);
        });

        socket.on('deleteTask', (taskID) => {
            console.log('received id of deleted task: ', taskID);

            socket.to(userEmail).emit('deleteTask', taskID);
        });

        socket.on('editTask', (data) => {
            //data contains 'id' and 'newContent' keys
            console.log('received data of edited task: ', data);

            socket.to(userEmail).emit('editTask', data);
        });

        socket.on('toggleDone', (data) => {
            //data contains 'id' and (current) 'done' keys
            console.log('received data in toggleDone event: ', data);

            socket.to(userEmail).emit('toggleDone', data);
        });
    });
}

module.exports = initializeSocket;
