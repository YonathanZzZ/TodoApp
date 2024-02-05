import "./App.css";
import {useEffect, useState} from "react";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";
import DoneList from "./DoneList";
import DisplayAlert from "./DisplayAlert";
import {Box, Container, Paper, Tab, Tabs, ThemeProvider} from "@mui/material";
import {theme} from "./theme";
import {addTaskToDB, deleteTaskFromDB, editTaskOnDB, getTasksFromDB, deleteUserFromDB} from './sendRequestToServer';
import {LoginPage} from "./LoginPage";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import Stack from "@mui/material/Stack";
import {AccountMenu} from './AccountMenu';
import {v4 as uuidv4} from 'uuid';

function App() {
    const [todo, setTodo] = useState("");
    const [todos, setTodos] = useState([]);
    const [doneTodos, setDoneTodos] = useState([]);
    const [alertMessage, setAlertMessage] = useState("");
    const [editingTodo, setEditingTodo] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            return;
        }

        const decodedToken = jwtDecode(token);
        const emailFromToken = decodedToken.email;

        setEmail(emailFromToken);
    }, []);

    useEffect(() => {
        if (!email) {
            return;
        }

        //load tasks from database
        getTasksFromDB(email, false).then(res => {
            console.log('data received in client: ', res.data);
            setTodos(res.data);
        }).catch(() => {
            setAlertMessage("Could not load tasks from server");
        });

        //load done tasks from database
        getTasksFromDB(email, true).then(res => {
            console.log('done todos received in client: ', res.data);
            setDoneTodos(res.data);
        }).catch(() => {
            setAlertMessage("Could not load tasks from server");
        });

    }, [email]); //run when client loads

    const closeAlert = () => {
        setAlertMessage("");
    };

    const addTodo = () => {
        if (todo === "") {
            return;
        }
    
        const taskID = uuidv4();

        //create new array consisting of current todos and append the current one to it

        const newTodo = {id: taskID, content: todo};
        //add to database (combine email with newTodo into a single json)
        addTaskToDB({...newTodo, email: email}).then(() => {
            const newTodos = [...todos, newTodo];
            setTodos(newTodos);
            //clear input field
            setTodo("");
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
        }).catch(() => {
            setAlertMessage("Failed to delete task on server");
        });
    };

    const deleteDoneTask = (indexToRemove) => {
        console.log('indexToRemove: ', indexToRemove);
        const taskID = doneTodos[indexToRemove].id;

        //remove from db
        deleteTaskFromDB(taskID).then(() => {
            const newDoneTodos = [...doneTodos];
            newDoneTodos.splice(indexToRemove, 1);
            setDoneTodos(newDoneTodos);
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
            setEditingTodo(null);
        }).catch(() => {
            setAlertMessage("Failed to update task on server");
        });
    };

    const logOut = () => {
        Cookies.remove('token');
        setEmail("");
    };

    const deleteAccount = () => {
        //request server to delete, then logout
        deleteUserFromDB(email).then(() => {
            logOut();
        }).catch(() => {
            setAlertMessage("Failed to delete account");
        });
    };

    const markAsDone = (indexToRemove) => {
        //add task to doneTodos
        const newDoneTodos = [...doneTodos, todos[indexToRemove]];
        setDoneTodos(newDoneTodos);

        const taskID = todos[indexToRemove].id;

        editTaskOnDB({id: taskID}, {done: true}).then(() => {
            //remove task from todos
            setTodos(todos.filter((todo, index) => index !== indexToRemove));
        }).catch(() => {
            setAlertMessage("Failed to update task on server");
        })
    };

    const handleTabChange = (event, index) => {
        setTabIndex(index);
    };

    return (<ThemeProvider theme={theme}>
            <Container maxWidth="lg">
                <Paper elevation={24} style={{padding: 20, marginTop: 20, textAlign: "center"}}>

                    {email ? (
                        <>
                            <Stack direction="row" alignItems="flex-start">
                                <AccountMenu logout={logOut} deleteAccount={deleteAccount}/>
                            </Stack>

                            <h1>ToDo List</h1>
                            <TodoInput todo={todo} setTodo={setTodo} addTodo={addTodo}/>
                            {alertMessage && <DisplayAlert message={alertMessage} onClose={closeAlert}/>}

                            <Box className="tabs-box">
                                <Tabs value={tabIndex} onChange={handleTabChange}>
                                    <Tab label="Todo"/>
                                    <Tab label="Done"/>
                                </Tabs>
                            </Box>

                            {tabIndex === 0 && <TodoList todos={todos} remove={deleteTodo}
                                                         edit={(index, text) => editContent(index, text)}
                                                         markAsDone={markAsDone}/>}
                            {/*TODO add DoneList item for tabIndex === 1*/}
                            {tabIndex === 1 && <DoneList doneTasks={doneTodos} remove={deleteDoneTask}/>}
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
