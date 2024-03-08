import "./App.css";
import {useEffect, useRef, useState} from "react";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";
import DisplayAlert from "./DisplayAlert";
import {AppBar, Box, Container, Paper, Tab, Tabs, ThemeProvider, Toolbar, Typography} from "@mui/material";
import {theme} from "./theme";
import {
    addTaskToDB,
    deleteTaskFromDB,
    editTaskOnDB,
    getTasksFromDB,
    deleteUserFromDB,
    verifyToken
} from './sendRequestToServer';
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
    const serverURL = import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin;
    const socketRef = useRef(null);

    useEffect(() => {
            const token = Cookies.get('token');
            if (!token) {
                return;
            }
            verifyToken(token).then(() => {
                const decodedToken = jwtDecode(token);
                const emailFromToken = decodedToken.email;
                setEmail(emailFromToken);
            }).catch(() => {
                //token verification failed
            });
        }, []
    );

    useEffect(() => {
        if (!email) {
            return;
        }

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
            const socket = io(serverURL, {
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

    const addTodoToState = (newTodo) => {
        const newTodos = [...todos, newTodo];
        setTodos(newTodos);
    }

    const deleteTodoFromState = (taskID) => {
        const newTodos = todos.filter(todo => todo.id !== taskID);
        setTodos(newTodos);
    }

    const editTodoOnState = (taskID, updatedContent) => {
        const newTodos = todos.map(todo => {
            if (todo.id === taskID) {
                return {...todo, content: updatedContent};
            }

            return todo;
        });

        setTodos(newTodos);
    };

    const toggleDoneOnState = (taskID) => {
        const newTodos = todos.map(todo => {
            if (todo.id === taskID) {
                return {...todo, done: !todo.done};
            }

            return todo;
        });

        setTodos(newTodos);
    }

    const addTodo = () => {
        if (todo === "") {
            return;
        }

        const taskID = uuidv4();

        const newTodo = {id: taskID, content: todo, done: false};
        addTodoToState(newTodo);

        setTodo("");
        //add to database (combine email with newTodo into a single json)
        //addTaskToDB({...newTodo, email: email}).then(() => {
        addTaskToDB(newTodo).then(() => {
            //emit event to socket to update other clients of the same user
            socketRef.current.emit('addTask', newTodo);
        }).catch((error) => {
            console.error('Error adding task to db: ', error);
            setAlertMessage("Failed to upload new task to server");

            //delete task that failed to upload to database
            deleteTodoFromState(taskID);
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
            addTodoToState(todoBackup);
        });
    };

    const taskIDToIndex = (taskID) => {
        return todos.findIndex(todo => todo.id === taskID);
    };

    const editContent = (taskID, updatedContent) => {
        //const contentBackup = todos[index].content;
        const contentBackup = todos.map(todo => {
            if (todo.id === taskID) {
                return todo.content;
            }
        });

        editTodoOnState(taskID, updatedContent);

        //update task in db
        editTaskOnDB({id: taskID}, {content: updatedContent}).then(() => {

            socketRef.current.emit('editTask', {id: taskID, newContent: updatedContent});
        }).catch(() => {
            setAlertMessage("Failed to update task on server");

            //restore previous content of task
            editTodoOnState(taskID, contentBackup);
        });
    };

    const toggleDone = (taskID) => {
        const task = todos.find(todo => todo.id === taskID);
        const doneValue = task.done;

        toggleDoneOnState(taskID);

        editTaskOnDB({id: taskID}, {done: !doneValue}).then(() => {

            socketRef.current.emit('toggleDone', {id: taskID, done: !doneValue});
        }).catch(() => {
            setAlertMessage("Failed to update task on server");

            //restore old done value
            toggleDoneOnState(taskID);
        });
    };

    const logOut = () => {
        Cookies.remove('token');
        setEmail("");
    };

    const deleteAccount = () => {
        //request server to delete user, then logout
        deleteUserFromDB().then(() => {
            logOut();
        }).catch(() => {
            setAlertMessage("Failed to delete account");
        });
    };

    const handleTabChange = (event, index) => {
        setTabIndex(index);
    };

    return (<ThemeProvider theme={theme}>
            <Container maxWidth="sm" style={{padding: 5}}>
                {email ? (
                    <>
                        <AppBar position="sticky">
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
                                                         toggleDone={toggleDone} isDone={true}/>}

                            {tabIndex === 1 && <TodoList todos={todos.filter(todo => todo.done)} remove={deleteTodo}
                                                         edit={(taskID, text) => editContent(taskID, text)}
                                                         toggleDone={toggleDone} isDone={false}/>}
                        </div>

                    </>
                ) : (
                    <>
                        <h1>Login</h1>
                        <LoginPage setEmail={setEmail} setPassword={setPassword} password={password}/>
                    </>
                )}
            </Container>
        </ThemeProvider>
    );
}

export default App;
