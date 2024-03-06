import axios from 'axios';

axios.defaults.withCredentials = true; //include cookies in requests automatically

const serverURL = import.meta.env.DEV ? 'http://localhost:8080' : '';

export const getTasksFromDB = (email) => {
    return axios.get(`${serverURL}/tasks/${email}`);
};

export const addTaskToDB = (task) => {

    return axios.post(`${serverURL}/tasks`, task);
};

export const deleteTaskFromDB = (taskID) => {

    return axios.delete(`${serverURL}/tasks/${taskID}`);
};

export const editTaskOnDB = (identifier, newData) => {

    return axios.patch(`${serverURL}/tasks`, {
        taskIdentifier: identifier, newTaskData: newData
    });
};

export const addUser = (email, password) => {
    return axios.post(`${serverURL}/register`, {
        email: email,
        password: password
    });
};

export const validateUser = (email, password) => {
    return axios.post(`${serverURL}/login`, {
        email: email,
        password: password
    });
};

export const verifyToken = (token) => {
    console.log('token in verifyToken: ', token);
    return axios.post(`${serverURL}/verify`, {
        token: token,
    });
};

export const deleteUserFromDB = (email) => {
    return axios.delete(`${serverURL}/users/${email}`);
};






