import axios from 'axios';

const serverHost = 'https://localhost:443';

axios.defaults.withCredentials = true;

export const getTasksFromDB = (email) => {
    return axios.get(`${serverHost}/tasks/${email}`);
};

export const addTaskToDB = (task) => {

    return axios.post(`${serverHost}/tasks`, task);
};

export const deleteTaskFromDB = (taskID) => {

    return axios.delete(`${serverHost}/tasks/${taskID}`);
};

export const editTaskOnDB = (identifier, newData) => {

    return axios.patch(`${serverHost}/tasks`, {
        taskIdentifier: identifier, newTaskData: newData
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

export const deleteUserFromDB = (email) => {
    return axios.delete(`${serverHost}/users/${email}`);
};






