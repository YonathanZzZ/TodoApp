import axios from 'axios';

const serverHost = 'http://localhost:3001';

axios.defaults.withCredentials = true;

export const getTasksFromDB = (email, done) => {
    return axios.get(`${serverHost}/tasks/${email}/${done}`)
};

export const addTaskToDB = (task) => {
    axios.post(`${serverHost}/tasks`, task)
        .then(res => {
            console.log('added task to DB');
        })
        .catch((error) => {
            console.error('failed to add task to DB');
        });
};

export const deleteTask = (taskID) => {
    axios.delete(`${serverHost}/tasks/${taskID}`).then((res) => {
        console.log("response received from server: ", res);
    }).catch((error) => {
        console.error('error while removing task from db: ', error);
    });
};

export const editTask = (identifier, newData) => {
    // const identifier = {email: email, content: oldTask};
    // const newData = {content: modifiedTask};

    axios.patch(`${serverHost}/tasks`, {
        taskIdentifier: identifier, newTaskData: newData
    }).then((res) => {
        console.log('task successfully updated in db');
    }).catch((error) => {
        console.error('failed to update task in db')
    });
};

export const addUser = (email, password) => {
    return axios.post(`${serverHost}/register`, {
        email: email,
        password: password
    });
};

export const validateUser = (email, password) => {
    return axios.post(`${serverHost}/login`, {
        email: email,
        password: password
    });
};

export const deleteUser = (email) => {
    return axios.delete(`${serverHost}/users/${email}`);
};






