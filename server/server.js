require('dotenv').config(); //load environment variables defined in .env file
const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const HTTPS_PORT = 443;
const HTTP_PORT = process.env.PORT || 80;
//const clientHost = 'http://localhost:3000';
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const dbHandler = require('./dbHandler');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const initializeSocket = require('./socketHandler');
const httpServer = http.createServer(app);

if(process.env.NODE_ENV !== 'production'){
    app.use((req, res, next) => {
        if(!req.secure){
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    })
}


app.use(express.static(path.join(__dirname, '../client/build')));
// app.use(cors({
//     origin: clientHost,
//     credentials: true
// }));
app.use(express.json());
app.use(cookieParser());

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

app.get('*', (req, res) => {
    //redirect all other routes to landing page
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

if(process.env.NODE_ENV !== 'production'){
    const httpOptions = {
        key: fs.readFileSync('server/localhost-key.pem'),
        cert: fs.readFileSync('server/localhost.pem')
    };

    const httpsServer = https.createServer(httpOptions,app);

    initializeSocket(httpsServer);

    httpsServer.listen(HTTPS_PORT, () => {
        console.log('https server is running on port', HTTPS_PORT);
    });
}else{
    initializeSocket(httpServer);
}

httpServer.listen(HTTP_PORT, () => {
    console.log('http server is running on port', HTTP_PORT);
});



