require('dotenv').config(); //load environment variables defined in .env file
const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const PORT = 3001;
const clientHost = 'http://localhost:3000';
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const dbHandler = require('./dbHandler');

app.use(cors({
    origin: clientHost,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.post('/tasks', auth.authenticateToken, (req, res) => {

    console.log('request data received from client: ', req.body);

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

    console.log('request data received from client: ', req.body);

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
    // const email = req.body.email;
    // const oldContent = req.body.oldContent;
    // const newContent = req.body.newContent;

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

app.get('/tasks/:email/:done', auth.authenticateToken, (req, res) => {
    const email = req.params.email;
    const doneBoolean = req.params.done === 'true';

    dbHandler.getUserTasks(email, doneBoolean).then((tasks) => {
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

    console.log('IN USER DELETE SERVER ROUTE');

    //delete user and their tasks from db
    dbHandler.deleteUser(emailToDelete).then(() => {
        console.log('deleted user: ', emailToDelete);
        res.status(200).json('user deleted');
    }).catch((error) => {
        console.error('failed to d  elete user: ', error);
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

app.listen(PORT, () => {
    console.log('server is running on port ', PORT);
});