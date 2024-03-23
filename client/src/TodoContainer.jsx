import { Box } from "@mui/material"
import { default as TodoTabs } from "./TodoTabs"
import TodoList from "./TodoList"
import { useState } from "react";

const TodoContainer = ({todos, remove, edit, toggleDone}) => {
    const TODO_TAB = 0;
    const DONE_TAB = 1;

    const [tabIndex, setTabIndex] = useState(TODO_TAB);

    return(
        <Box>
            <TodoTabs tabIndex={tabIndex} setTabIndex={setTabIndex}/>
            {tabIndex === TODO_TAB ? (
                <TodoList todos={todos.filter((todo) => !todo.done)} remove={remove} edit={edit} toggleDone={toggleDone} isDone={false}/>
            ) : (
                <TodoList todos={todos.filter((todo) => todo.done)} remove={remove} edit={edit} toggleDone={toggleDone} isDone={true}/>
            )}
            
            
        </Box>
        
    )
}

export default TodoContainer;