import "./App.css";
import {useEffect, useRef, useState} from "react";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";
import DoneList from "./DoneList";
import DisplayAlert from "./DisplayAlert";
import {AppBar, Box, Container, Paper, Tab, Tabs, ThemeProvider, Toolbar, Typography} from "@mui/material";
import {theme} from "./theme";
import {addTaskToDB, deleteTaskFromDB, editTaskOnDB, getTasksFromDB, deleteUserFromDB} from './sendRequestToServer';
import {LoginPage} from "./LoginPage";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import {AccountMenu} from './AccountMenu';
import {v4 as uuidv4} from 'uuid';
import {io} from 'socket.io-client';

function App() {
    const [todo, setTodo] = useState("");
    const [todos, setTodos] = useState([]);
    const [alertMessage, setAlertMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tabIndex, setTabIndex] = useState(0);
    const URL = window.location.origin; // use the domain that served the client
    const socketRef = useRef(null);

    useEffect(() => {
            const token = Cookies.get('token');
            if (!token) {
                return;
            }

            const decodedToken = jwtDecode(token);
            const emailFromToken = decodedToken.email;

            setEmail(emailFromToken);
        }
    );

    useEffect(() => {
        if (!email) {
            return;
        }

        //load tasks from database
        getTasksFromDB(email).then(res => {
            setTodos(res.data);
        }).catch(() => {
            setAlertMessage("Could not load tasks from server");
        });
    }, [email]); //run when user connects

    useEffect(() => {
        if (!email) {
            return;
        }

        //socket setup
        if (!socketRef.current) {
            const socket = io(URL, {
                autoConnect: false
            });

            socketRef.current = socket;

            const onConnect = () => {
                socket.emit('email', email);
            };

            const onDisconnect = () => {

            };

            const onTaskAdded = (newTask) => {

                setTodos(prevTodos => [...prevTodos, newTask]);
            };

            const onTaskRemoved = (taskID) => {

                setTodos((prevTodos) => {
                    return prevTodos.filter(item => item.id !== taskID)
                });
            };

            const onTaskEdited = (data) => {

                const taskID = data.id;
                const newContent = data.newContent;

                setTodos((prevTodos) =>
                    prevTodos.map(todo => {
                        if (todo.id === taskID) {
                            return {...todo, content: newContent}; // change 'content' field
                        }
                        return todo;
                    }));
            };

            const onToggleDone = (data) => {

                const taskID = data.id;
                const newDoneValue = data.done;

                setTodos((prevTodos) =>
                    prevTodos.map(todo => {
                        if (todo.id === taskID) {
                            return {...todo, done: newDoneValue};
                        }
                        return todo;
                    }));
            }

            //add event listeners
            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);
            socket.on('addTask', onTaskAdded);
            socket.on('deleteTask', onTaskRemoved);
            socket.on('editTask', onTaskEdited);
            socket.on('toggleDone', onToggleDone);

            socket.connect();
        }

        return () => {
            socketRef.current.removeAllListeners();
        }


    }, [email]);

    const closeAlert = () => {
        setAlertMessage("");
    };

    const addTodo = () => {
        if (todo === "") {
            return;
        }

        const taskID = uuidv4();

        //create new array consisting of current todos and append the current one to it
        const newTodo = {id: taskID, content: todo, done: false};
        const newTodos = [...todos, newTodo];
        setTodos(newTodos);
        //clear input field
        setTodo("");
        //add to database (combine email with newTodo into a single json)
        addTaskToDB({...newTodo, email: email}).then(() => {

            //emit event to socket to update other clients of the same user
            socketRef.current.emit('addTask', newTodo);
        }).catch((error) => {
            console.error('Error adding task to db: ', error);
            setAlertMessage("Failed to upload new task to server");

            //delete task that failed to upload to database
            const newTodos = todos.filter(todo => todo.id !== taskID);
            setTodos(newTodos);
        });
    };

    const deleteTodo = (taskID) => {
        const index = taskIDToIndex(taskID);
        const todoBackup = todos[index];

        //remove task from client state
        const newTodos = [...todos];
        newTodos.splice(index, 1);
        setTodos(newTodos);
        //remove from db
        deleteTaskFromDB(taskID).then(() => {

            socketRef.current.emit('deleteTask', taskID);
        }).catch(() => {
            setAlertMessage("Failed to delete task on server");

            //restore task
            const newTodos = [...todos, todoBackup];
            setTodos(newTodos);
        });
    };

    const taskIDToIndex = (taskID) => {
        return todos.findIndex(todo => todo.id === taskID);
    };

    const editContent = (taskID, updatedContent) => {
        const index = taskIDToIndex(taskID);
        const contentBackup = todos[index].content;

        const updatedTodos = [...todos];
        updatedTodos[index].content = updatedContent;
        setTodos(updatedTodos);

        //update task in db
        editTaskOnDB({id: taskID}, {content: updatedContent}).then(() => {

            socketRef.current.emit('editTask', {id: taskID, newContent: updatedContent});
        }).catch(() => {
            setAlertMessage("Failed to update task on server");

            //revert task to old content
            const updatedTodos = [...todos];
            updatedTodos[index].content = contentBackup;
            setTodos(updatedTodos);
        });
    };

    const logOut = () => {
        Cookies.remove('token');
        setEmail("");
    };

    const deleteAccount = () => {
        //request server to delete user, then logout
        deleteUserFromDB(email).then(() => {
            logOut();
        }).catch(() => {
            setAlertMessage("Failed to delete account");
        });
    };

    const toggleDone = (taskID) => {
        const index = taskIDToIndex(taskID);
        const newDoneValue = !todos[index].done;

        const newTodos = [...todos];
        newTodos[index].done = newDoneValue;

        setTodos(newTodos);

        editTaskOnDB({id: taskID}, {done: newDoneValue}).then(() => {

            socketRef.current.emit('toggleDone', {id: taskID, done: newDoneValue});
        }).catch(() => {
            setAlertMessage("Failed to update task on server");

            //restore old done value
            const newTodos = [...todos];
            newTodos[index].done = !newDoneValue;

            setTodos(newTodos);
        });
    };

    const handleTabChange = (event, index) => {
        setTabIndex(index);
    };

    return (<ThemeProvider theme={theme}>
            <Container maxWidth="lg">
                <Paper elevation={24} style={{padding: 15, marginTop: 5, marginBottom: 20, textAlign: "center"}}>

                    {email ? (
                        <>
                            <AppBar position="static">
                                <Toolbar>
                                    <Typography variant="h5" component="div" sx={{flexGrow: 1, textAlign: 'center'}}>
                                        ToDo List
                                    </Typography>
                                    <AccountMenu logout={logOut} deleteAccount={deleteAccount}/>
                                </Toolbar>
                            </AppBar>

                            <Box mt={1}>
                                <TodoInput todo={todo} setTodo={setTodo} addTodo={addTodo}/>
                            </Box>
                            {alertMessage && <DisplayAlert message={alertMessage} onClose={closeAlert}/>}

                            <Box className="tabs-box">
                                <Tabs value={tabIndex} onChange={handleTabChange}>
                                    <Tab label="Todo"/>
                                    <Tab label="Done"/>
                                </Tabs>
                            </Box>

                            <div className="list-container">
                                {tabIndex === 0 && <TodoList todos={todos.filter(todo => !todo.done)} remove={deleteTodo}
                                                             edit={(taskID, text) => editContent(taskID, text)}
                                                             markAsDone={toggleDone}/>}
                                {tabIndex === 1 && <DoneList todos={todos.filter(todo => todo.done)} remove={deleteTodo}/>}
                            </div>

                        </>
                    ) : (
                        <>
                            <h1>Login</h1>
                            <LoginPage setEmail={setEmail} setPassword={setPassword} password={password}/>
                        </>
                    )}
                </Paper>
            </Container>
        </ThemeProvider>
    );
}

export default App;
