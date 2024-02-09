import React from 'react';
import {List, ListItem} from '@mui/material';
import Divider from '@mui/material/Divider';
import {DoneItem} from "./DoneItem";

const DoneList = ({todos, remove}) => {

    return (
        <List>
            {todos.map((entry, index) => (
                //use <> (fragment) to return multiple elements (list item and divider)
                entry.done && (
                    <>
                        <ListItem>
                            {
                                <DoneItem index={index} entry={entry.content} remove={remove}/>
                            }
                        </ListItem>
                        {/*add divider to list items except the last one*/}
                        {index !== todos.length - 1 && <Divider component="li"/>}
                    </>
                )
            ))}
        </List>
    );
};

export default DoneList;
