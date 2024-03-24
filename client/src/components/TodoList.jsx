import React, {useState} from 'react';
import {List, ListItem} from '@mui/material';
import Divider from '@mui/material/Divider';
import {EditedItem} from "./EditedItem";
import {TodoItem} from "./TodoItem";

const TodoList = ({todos, remove, edit, toggleDone, isDone}) => {
    const [editingTaskID, setEditingTaskID] = useState(null);
    const [editedText, setEditedText] = useState('');

    const startEditing = (taskID, text) => {
        setEditingTaskID(taskID);
        setEditedText(text);
    };

    const cancelEditing = () => {
        setEditingTaskID(null);
        setEditedText('');
    };

    const saveEditing = (taskID) => {
        if (editedText.trim() !== '') {
            edit(taskID, editedText);
            cancelEditing();
        }
    };

    return (
        <List>
            {todos.map((entry, index) => (
                <React.Fragment key={entry.id}>
                    <ListItem >
                        {editingTaskID === entry.id ? (
                            <EditedItem taskID={entry.id} editedText={editedText} setEditedText={setEditedText}
                                        saveEditing={saveEditing} cancelEditing={cancelEditing}/>
                        ) : (
                            <TodoItem id={entry.id} content={entry.content} remove={remove}
                                      startEditing={startEditing}
                                      toggleDone={toggleDone} isDone={isDone}/>
                        )}
                    </ListItem>
                    {/*add divider to list items except the last one*/}
                    {index !== todos.length - 1 && <Divider component="li"/>}
                </React.Fragment>
            ))}
        </List>
    );
};

export default TodoList;
