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
    const URL = 'https://localhost:443';
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
                    console.log('prevTodos value:', prevTodos);
                    return prevTodos.filter(item => item.id !== taskID)
                });
            };

            const onTaskEdited = (data) => {
                console.log('onTaskEdited event');

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
                const currDone = data.done;

                setTodos((prevTodos) =>
                    prevTodos.map(todo => {
                        if (todo.id === taskID) {
                            return {...todo, done: !currDone}; // change 'content' field
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
        //add to database (combine email with newTodo into a single json)
        addTaskToDB({...newTodo, email: email}).then(() => {
            const newTodos = [...todos, newTodo];
            setTodos(newTodos);
            //clear input field
            setTodo("");

            //emit event to socket to update other clients of the same user
            socketRef.current.emit('addTask', newTodo);
        }).catch((error) => {
            console.error('Error adding task to db: ', error);
            setAlertMessage("Could not upload new task to server");
        });
    };

    const deleteTodo = (indexToRemove) => {
        //remove from db
        const taskID = todos[indexToRemove].id;
        deleteTaskFromDB(taskID).then(() => {
            const newTodos = [...todos];
            newTodos.splice(indexToRemove, 1);
            setTodos(newTodos);

            socketRef.current.emit('deleteTask', taskID);
        }).catch(() => {
            setAlertMessage("Failed to delete task on server");
        });
    };

    const editContent = (index, updatedContent) => {
        const taskID = todos[index].id;

        //update task in db
        editTaskOnDB({id: taskID}, {content: updatedContent}).then(() => {
            const updatedTodos = [...todos];
            updatedTodos[index].content = updatedContent;
            setTodos(updatedTodos);
            socketRef.current.emit('editTask', {id: taskID, newContent: updatedContent});
        }).catch(() => {
            setAlertMessage("Failed to update task on server");
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

    const toggleDone = (indexToRemove) => {
        const taskID = todos[indexToRemove].id;
        const currDone = todos[indexToRemove].done;

        editTaskOnDB({id: taskID}, {done: !currDone}).then(() => {
            //remove task from todos
            const newTodos = [...todos];
            newTodos[indexToRemove].done = !currDone;
            setTodos(newTodos);

            socketRef.current.emit('toggleDone', {id: taskID, done: currDone});
        }).catch(() => {
            setAlertMessage("Failed to update task on server");
        })
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
                                {tabIndex === 0 && <TodoList todos={todos} remove={deleteTodo}
                                                             edit={(index, text) => editContent(index, text)}
                                                             markAsDone={toggleDone}/>}
                                {tabIndex === 1 && <DoneList todos={todos} remove={deleteTodo}/>}
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
