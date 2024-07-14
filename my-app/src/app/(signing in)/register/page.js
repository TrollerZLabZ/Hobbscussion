"use client"
import { useState } from 'react';

/**
 * Register Page
 */
export default function Register() {
    const [usernameValue, setUsername] = useState('');
    const [emailValue, setEmail] = useState('');
    const [passwordValue, setPassword] = useState('');
    const [confirmedPasswordValue, setConfirmedPassword] = useState('');


    const handleUsernameInputChange = (e) => {
        setUsername(e.target.value);
    };
    const handleEmailInputChange = (e) => {
        setEmail(e.target.value);
    }
    const handlePasswordInputChange = (e) => {
        setPassword(e.target.value);
    }
    const handleConfirmedPasswordInputChange = (e) => {
        setConfirmedPassword(e.target.value);
    }
    async function formSubmit(e) {
        e.preventDefault();
        console.log("Form submitted");
        console.log(e.target)

        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmedPassword = formData.get('confirmPassword');
        const tos = formData.get('TOSConfirmation');

        if (password !== confirmedPassword) {
            alert('Passwords do not match: ' + password + ' ' + confirmedPassword);
            return;
        }

        if (tos === false) {
            alert('You must agree to the terms of service');
            return;
        }

        const data = {
            username: username,
            confirmedPassword: confirmedPassword,
            email: email,
            password: password,
            tos: tos,
        }

        const response = await fetch('http://localhost:9000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // no cors
                'mode': 'no-cors',
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        if (responseData.success === false) {
            alert(responseData.error);
            return;
        }
        // redirect to /home
        // set cookie with expiration of 30 days
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        document.cookie = `session_id=${responseData.cookie}; expires=${expirationDate.toUTCString()};`;
        console.log(document.cookie);
        window.location.href = '/home';
    }
    return (<>
        <div className='h-screen flex justify-center items-center'>
            <img src="/hobbscussion.png" alt="Logo" className='pr-10' />

            <div className='h-auto grid gap-4 place-content-center'>
                <h1 className="">Register</h1>
                <form onSubmit={formSubmit} >
                    <div>
                        <p>Username</p>
                        <input name="username" className="textBox formTextBox rounded-md p-1" type="username" value={usernameValue} onChange={handleUsernameInputChange}></input>
                    </div>
                    <div>
                        <p>Email</p>
                        <input name="email" className="textBox formTextBox rounded-md p-1" type="email" value={emailValue} onChange={handleEmailInputChange} ></input>
                    </div>
                    <div>
                        <p>Password</p>
                        <input name="password" className="textBox formTextBox rounded-md p-1" type="password" value={passwordValue} onChange={handlePasswordInputChange} ></input>
                    </div>
                    <div>
                        <p>Confirm Password</p>
                        <input name="confirmPassword" className="textBox formTextBox rounded-md p-1" type="password" value={confirmedPasswordValue} onChange={handleConfirmedPasswordInputChange} ></input>
                    </div>
                    {/* TOS Confirmation*/}
                    <br />
                    <div>
                        <input name="TOSConfirmation" type="checkbox" id="tos" value="tos"></input>
                        <label className='pl-2'>I agree to the <a href="/tos">Terms of Service</a></label>
                    </div>

                    <div>
                        <button className="border border-solid border-white button rounded-sm p-1" type="submit">Register</button>
                    </div>
                    <div>
                        <sub>Already have an account? <a href="/">Login</a></sub>
                    </div>
                </form>
            </div>
        </div>
    </>
    );
}
