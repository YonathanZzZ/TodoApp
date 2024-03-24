import Stack from "@mui/material/Stack";
import {Box, TextField} from "@mui/material";
import React, {useState} from "react";
import Button from "@mui/material/Button";
import {addUser, validateUser} from "./sendRequestToServer";
import Cookies from 'js-cookie';
import isEmail from 'validator/lib/isEmail';
export const LoginPage = ({setEmail}) => {

    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [inputError, setInputError] = useState("");


    const loginUser = () => {
        validateUser(emailInput, passwordInput).then((res)=>{

            //extract jwt from response
            const token = res.data.token;
            //store jwt as cookie
            Cookies.set('token', token, {
                expires: 7,
                path: '/',
                sameSite: 'strict',
                secure: true
            });

            setEmail(emailInput);
            setPasswordInput("");

        }).catch((error)=>{
            console.error('user unauthorized: ', error);
        });
    }
    const handleLoginButton = () =>{
        loginUser();
    };

    const handleRegisterButton = () => {
        if(!isEmail(emailInput)){
            //display warning on email TextField component
            setInputError('Invalid email address');
            return;
        }else {
            setInputError("");
        }

        //add user to DB
        addUser(emailInput, passwordInput).then(()=>{
            //user successfully registered, log-in...
            loginUser();
            //setEmail(emailInput);
        }).catch((error) =>{
            console.error('failed to register user: ', error);
            //use displayWarning to let user know registration failed
        });
    }

    const handleKeyDown = (e) => {
        if (e.code === "Enter") {
            handleLoginButton();
        }
    };

    return (
        <Stack direction="column" spacing={1}>
            <Box textAlign="center">
                <h1>Please Login or Register</h1>
            </Box>
            <TextField
                id="email-field"
                autoFocus={true}
                variant="filled"
                label="Enter email"
                fullWidth={true}
                required={true}
                type="email"
                error={Boolean(inputError)}
                helperText={inputError}
                onChange={(e) => {
                    setEmailInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
            />

            <TextField
                id="password-field"
                variant="filled"
                label="Enter password"
                fullWidth={true}
                required={true}
                type="password"
                onChange={(e) => {
                    setPasswordInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
            />
            <Box style={{margin: '5px'}}>
                <Stack direction="row" justifyContent="space-between">
                    <Button variant="contained" onClick={handleLoginButton}>Login</Button>
                    <Button variant="contained" onClick={handleRegisterButton}>Register</Button>
                </Stack>
            </Box>
        </Stack>
);
}

