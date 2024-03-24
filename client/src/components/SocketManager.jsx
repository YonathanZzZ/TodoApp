import {useEffect, useRef} from "react";
import io from 'socket.io-client';

let socket = null;

const initSocket = (email, serverURL, setTodos) => {
    if(socket){
        return;
    } //check if necessary

    socket = io(serverURL, {
        autoConnect: false,
        query: {
            email: email
        },
    });

    const onTaskAdded = (newTask) => {
        setTodos((prevTodos) => [...prevTodos, newTask]);
    };

    const onTaskRemoved = (taskID) => {
        setTodos((prevTodos) => {
            return prevTodos.filter((item) => item.id !== taskID);
        });
    };

    const onTaskEdited = (data) => {
        const taskID = data.id;
        const newContent = data.newContent;

        setTodos((prevTodos) =>
            prevTodos.map((todo) => {
                if (todo.id === taskID) {
                    return { ...todo, content: newContent }; // change 'content' field
                }
                return todo;
            })
        );
    };

    const onToggleDone = (data) => {
        const taskID = data.id;
        const newDoneValue = data.done;

        setTodos((prevTodos) =>
            prevTodos.map((todo) => {
                if (todo.id === taskID) {
                    return { ...todo, done: newDoneValue };
                }
                return todo;
            })
        );
    };

    socket.on("addTask", onTaskAdded);
    socket.on("deleteTask", onTaskRemoved);
    socket.on("editTask", onTaskEdited);
    socket.on("toggleDone", onToggleDone);

    socket.connect();
}

const sendEvent = (event, data) => {
    socket.emit(event, data);
}

export {initSocket, sendEvent};