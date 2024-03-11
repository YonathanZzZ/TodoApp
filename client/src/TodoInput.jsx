import React from "react";
import Button from "@mui/material/Button";
import {TextField} from "@mui/material";

const TodoInput = ({todo, setTodo, addTodo}) => {

    //use Enter keypress to submit input
    const keyDownHandler = (e) => {
        if (e.key === "Enter") {
            addTodo();
        }
    }

    return (
        <div className="input-wrapper">

            <TextField
                id="todo-field"
                autoFocus={true}
                variant="filled"
                label="Enter task"
                value={todo}
                fullWidth={true}
                onChange={(e) => {
                    setTodo(e.target.value);
                }}

                onKeyDown={keyDownHandler}
            />

            <Button size="small" variant="contained" onClick={addTodo}>Add Task</Button>

        </div>
    );
};

export default TodoInput;