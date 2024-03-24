import "../App.css";
import { useEffect, useState } from "react";
import TodoInput from "./TodoInput";
import DisplayAlert from "./DisplayAlert";
import {
  AppBar,
  Box,
  Container,
  Paper,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import { getDesignTokens } from "./theme";
import {
  addTaskToDB,
  deleteTaskFromDB,
  deleteUserFromDB,
  editTaskOnDB,
  getTasksFromDB,
  verifyToken,
} from "./sendRequestToServer";
import { LoginPage } from "./LoginPage";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { AccountMenu } from "./AccountMenu";
import { v4 as uuidv4 } from "uuid";
import { createTheme } from "@mui/material/styles";
import { ThemeToggle } from "./ThemeToggle";
import TodoContainer from "./TodoContainer";
import {initSocket, sendEvent} from './SocketManager';

function App() {
  const [todos, setTodos] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [email, setEmail] = useState("");
  const serverURL = import.meta.env.DEV
    ? "http://localhost:8080"
    : window.location.origin;
  const [mode, setMode] = useState("light");
  //const socketRef = useRef(null);

  const theme = createTheme(getDesignTokens(mode));

  useEffect(() => {
    const userSetting = localStorage.getItem("mode");
    if (userSetting) {
      setMode(userSetting);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setMode(e.matches ? "dark" : "light");
    };

    handleChange(mediaQuery);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      return;
    }
    verifyToken(token)
      .then(() => {
        const decodedToken = jwtDecode(token);
        const emailFromToken = decodedToken.email;
        setEmail(emailFromToken);
      })
      .catch(() => {
        //token verification failed
      });
  }, []);

  useEffect(() => {
    if (!email) {
      return;
    }

    getTasksFromDB(email)
      .then((res) => {
        setTodos(res.data);
      })
      .catch(() => {
        setAlertMessage("Could not load tasks from server");
      });
  }, [email]); //run when user connects

  useEffect(() => {
    if (!email) {
      return;
    }

    initSocket(email, serverURL, setTodos);

    // //socket setup
    // if (!socket) {
    //   //create and configure socket
    //   const socket = io(serverURL, {
    //     autoConnect: false,
    //     query: {
    //       email: email,
    //     },
    //   });
    //
    //   socket = socket;
    //
    //   const onTaskAdded = (newTask) => {
    //     setTodos((prevTodos) => [...prevTodos, newTask]);
    //   };
    //
    //   const onTaskRemoved = (taskID) => {
    //     setTodos((prevTodos) => {
    //       return prevTodos.filter((item) => item.id !== taskID);
    //     });
    //   };
    //
    //   const onTaskEdited = (data) => {
    //     const taskID = data.id;
    //     const newContent = data.newContent;
    //
    //     setTodos((prevTodos) =>
    //       prevTodos.map((todo) => {
    //         if (todo.id === taskID) {
    //           return { ...todo, content: newContent }; // change 'content' field
    //         }
    //         return todo;
    //       })
    //     );
    //   };
    //
    //   const onToggleDone = (data) => {
    //     const taskID = data.id;
    //     const newDoneValue = data.done;
    //
    //     setTodos((prevTodos) =>
    //       prevTodos.map((todo) => {
    //         if (todo.id === taskID) {
    //           return { ...todo, done: newDoneValue };
    //         }
    //         return todo;
    //       })
    //     );
    //   };
    //
    //   socket.on("addTask", onTaskAdded);
    //   socket.on("deleteTask", onTaskRemoved);
    //   socket.on("editTask", onTaskEdited);
    //   socket.on("toggleDone", onToggleDone);
    //
    //   socket.connect();
    // }
    //
    // return () => {
    //   socket.removeAllListeners();
    // };
  }, [email]);

  const closeAlert = () => {
    setAlertMessage("");
  };

  const addTodoToState = (newTodo) => {
    const newTodos = [...todos, newTodo];
    setTodos(newTodos);
  };

  const deleteTodoFromState = (taskID) => {
    const newTodos = todos.filter((todo) => todo.id !== taskID);
    setTodos(newTodos);
  };

  const editTodoOnState = (taskID, updatedContent) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === taskID) {
        return { ...todo, content: updatedContent };
      }

      return todo;
    });

    setTodos(newTodos);
  };

  const toggleDoneOnState = (taskID) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === taskID) {
        return { ...todo, done: !todo.done };
      }

      return todo;
    });

    setTodos(newTodos);
  };

  const addTodo = (todo) => {
    if (todo === "") {
      return;
    }

    const taskID = uuidv4();

    const newTodo = { id: taskID, content: todo, done: false };
    addTodoToState(newTodo);

    //add to database (combine email with newTodo into a single json)
    //addTaskToDB({...newTodo, email: email}).then(() => {
    addTaskToDB(newTodo)
      .then(() => {
        //emit event to socket to update other clients of the same user
        sendEvent("addTask", newTodo);
      })
      .catch((error) => {
        console.error("Error adding task to db: ", error);
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
    deleteTaskFromDB(taskID)
      .then(() => {
        sendEvent("deleteTask", taskID);
      })
      .catch(() => {
        setAlertMessage("Failed to delete task on server");

        //restore task
        addTodoToState(todoBackup);
      });
  };

  const taskIDToIndex = (taskID) => {
    return todos.findIndex((todo) => todo.id === taskID);
  };

  const editContent = (taskID, updatedContent) => {
    const contentBackup = todos.map((todo) => {
      if (todo.id === taskID) {
        return todo.content;
      }
    });

    editTodoOnState(taskID, updatedContent);

    //update task in db
    editTaskOnDB({ id: taskID }, { content: updatedContent })
      .then(() => {
        sendEvent("editTask", {
          id: taskID,
          newContent: updatedContent,
        });
      })
      .catch(() => {
        setAlertMessage("Failed to update task on server");

        //restore previous content of task
        editTodoOnState(taskID, contentBackup);
      });
  };

  const toggleDone = (taskID) => {
    const task = todos.find((todo) => todo.id === taskID);
    const doneValue = task.done;

    toggleDoneOnState(taskID);

    editTaskOnDB({ id: taskID }, { done: !doneValue })
      .then(() => {
        sendEvent("toggleDone", { id: taskID, done: !doneValue });
      })
      .catch(() => {
        setAlertMessage("Failed to update task on server");

        //restore old done value
        toggleDoneOnState(taskID);
      });
  };

  const logOut = () => {
    Cookies.remove("token");
    setEmail("");
  };

  const deleteAccount = () => {
    deleteUserFromDB()
      .then(() => {
        logOut();
      })
      .catch(() => {
        setAlertMessage("Failed to delete account");
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box style={{ backgroundColor: theme.palette.background.main }}>
        <Container maxWidth="sm" sx={{ height: "100%", padding: 0 }}>
          <Paper elevation={5} style={{ height: "100vh", overflow: "auto" }}>
            <Box>
              {email ? (
                <>
                  <AppBar position="sticky">
                    <Toolbar>
                      <ThemeToggle mode={mode} setMode={setMode} />
                      <Typography
                        variant="h5"
                        sx={{ flexGrow: 1, textAlign: "center" }}
                      >
                        ToDo List
                      </Typography>
                      <AccountMenu
                        logout={logOut}
                        deleteAccount={deleteAccount}
                      />
                    </Toolbar>

                    <Box
                      style={{
                        background: theme.palette.background.main,
                        padding: "6px",
                      }}
                    >
                      <TodoInput addTodo={addTodo} />

                      {alertMessage && (
                        <DisplayAlert
                          message={alertMessage}
                          onClose={closeAlert}
                        />
                      )}
                    </Box>
                  </AppBar>
                  <Box sx={{ padding: "0px" }}>
                    <TodoContainer
                      todos={todos}
                      remove={deleteTodo}
                      edit={editContent}
                      toggleDone={toggleDone}
                    />
                  </Box>
                </>
              ) : (
                <>
                  <LoginPage setEmail={setEmail} />
                </>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
