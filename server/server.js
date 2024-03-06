require('dotenv').config(); //load environment variables defined in .env file
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 8080;
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const dbHandler = require('./dbHandler');
const http = require('http');
const fs = require('fs');
const path = require('path');
const initializeSocket = require('./socketHandler');
const httpServer = http.createServer(app);
const cors = require('cors');
const BUILD_PATH = "../client/build/";

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, BUILD_PATH)));

if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development'){
    console.log('server running in development environment');
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }));
}

app.post('/tasks', auth.authenticateToken, (req, res) => {
    const task = req.body;

    dbHandler.addTaskToDB(task).then(() => {
        console.log('task successfully added to db');
        res.status(200).json('task added');
    }).catch((error) => {
        console.error('failed to add task to db: ', error);
        res.status(500).json('internal server error');
    });
});

app.delete('/tasks/:id', auth.authenticateToken, (req, res) => {

    const taskID = req.params.id;

    dbHandler.deleteTask(taskID).then(() => {
        console.log('task successfully removed from db');
        res.status(200).json('task removed');
    }).catch((error) => {
        console.error('failed to remove task from db: ', error);
        res.status(500).json('internal server error');
    });
});

app.patch('/tasks', auth.authenticateToken, (req, res) => {

    const identifier = req.body.taskIdentifier;
    const newTaskData = req.body.newTaskData;

    dbHandler.updateTaskGeneric(identifier, newTaskData).then(() => {
        console.log('task successfully updated on db');
        res.status(200).json('task updated');
    }).catch((error) => {
        console.error('failed to update task on db', error);
        res.status(500).json('internal server error')
    })
});

app.get('/tasks/:email', auth.authenticateToken, (req, res) => {
    const email = req.params.email;

    dbHandler.getUserTasks(email).then((tasks) => {
        console.log('successfully retrieved tasks');
        res.status(200).json(tasks);
    }).catch((error) => {
        console.error('failed to retrieve user tasks: ', error);
        res.status(500).json('internal server error');
    });
});

app.post('/register', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        dbHandler.addUser(email, hashedPassword).then(() => {
            console.log('added user to DB');
            res.status(200).json('user added');
        }).catch((error) => {
            console.error('failed to add user to DB: ', error);
            res.status(500).json('failed to add user');
        });
    });
});

app.delete('/users/:email', auth.authenticateToken, (req, res) => {
    const emailToDelete = req.params.email;

    //delete user and their tasks from db
    dbHandler.deleteUser(emailToDelete).then(() => {
        console.log('deleted user: ', emailToDelete);
        res.status(200).json('user deleted');
    }).catch((error) => {
        console.error('failed to delete user: ', error);
        res.status(500).json('failed to delete user');
    });
});

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = await dbHandler.getUserPassword(email);
    if (!hashedPassword) {
        res.status(401).json('Invalid credentials');
        return;
    }

    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordMatch) {
        //generate JWT
        const token = jwt.sign({email: email}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});

        res.status(200).json({token: token});
    } else {
        res.status(401).json('Invalid credentials');
    }
});

app.post('/verify', (req, res) => {
    const token = req.body.token;
    console.log('token in verify post: ', token);
    const user = auth.verifyToken(token);
    if(!user){
        res.status(403).json('Forbidden: invalid token');
    }else{
        res.status(200).json('Token verified');
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, BUILD_PATH + "index.html"));
})

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log('server is running on port: ', PORT);
})





