import React, {useState} from 'react';
import {List, ListItem} from '@mui/material';
import Divider from '@mui/material/Divider';
import {EditedItem} from "./EditedItem";
import {TodoItem} from "./TodoItem";

const TodoList = ({todos, remove, edit, markAsDone}) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedText, setEditedText] = useState('');

    const startEditing = (index, text) => {
        setEditingIndex(index);
        setEditedText(text);
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditedText('');
    };

    const saveEditing = (index) => {
        if (editedText.trim() !== '') {
            edit(index, editedText);
            cancelEditing();
        }
    };

    return (
        <List>
            {todos.map((entry, index) => (
                //use <> (fragment) to return multiple elements (list item and divider)
                <>
                    <ListItem>
                        {editingIndex === index ? (
                            <EditedItem index={index} editedText={editedText} setEditedText={setEditedText}
                                        saveEditing={saveEditing} cancelEditing={cancelEditing}/>
                        ) : (
                            <TodoItem index={index} entry={entry.content} remove={remove} startEditing={startEditing}
                                      markAsDone={markAsDone}/>
                        )}
                    </ListItem>
                    {/*add divider to list items except the last one*/}
                    {index !== todos.length - 1 && <Divider component="li"/>}
                </>
            ))}
        </List>
    );
};

export default TodoList;
