import axios from 'axios';

axios.defaults.withCredentials = true;

export const getTasksFromDB = (email) => {
    return axios.get(`/tasks/${email}`);
};

export const addTaskToDB = (task) => {

    return axios.post(`/tasks`, task);
};

export const deleteTaskFromDB = (taskID) => {

    return axios.delete(`/tasks/${taskID}`);
};

export const editTaskOnDB = (identifier, newData) => {

    return axios.patch(`/tasks`, {
        taskIdentifier: identifier, newTaskData: newData
    });
};

export const addUser = (email, password) => {
    return axios.post(`/register`, {
        email: email,
        password: password
    });
};

export const validateUser = (email, password) => {
    return axios.post(`/login`, {
        email: email,
        password: password
    });
};

export const deleteUserFromDB = (email) => {
    return axios.delete(`/users/${email}`);
};






