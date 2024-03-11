const { Server } = require('socket.io');

const initializeSocket = (httpServer) => {

    const io = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
        }
    }) : new Server(httpServer);

    io.on('connection', (socket) => {

        let userEmail = socket.handshake.query.email;
        console.log('a user connected with email:', userEmail);
        socket.join(userEmail);

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
