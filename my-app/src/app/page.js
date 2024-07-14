"use client"
import { useState, useEffect } from 'react';
const cookie = require('cookie');
/**
 * Login Page
 */
export default function Login() {
  const [usernameValue, setUsername] = useState('');
  const [passwordValue, setPassword] = useState('');


  const handleUsernameInputChange = (e) => {
    setUsername(e.target.value);
  };
  const handlePasswordInputChange = (e) => {
    setPassword(e.target.value);
  }

  const onLoad = async () => {
    // get cookie

    var cookies = cookie.parse(document.cookie);
    console.log(cookies);
    if (!cookies.session_id) return;
    if (cookies.session_id) {
      console.log("Attempting Remember Me")
      var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
      id = atob(id);
      dateCreated = atob(dateCreated);

      // get user from database
      const response = await fetch('http://localhost:9000/verifyCookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: cookies.session_id,
          id: id,
          dateCreated: dateCreated,
          hashedToken: hashedToken,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error(data.error);
        return;
      }
      if (data.success) {
        window.location.href = '/home';
      }
    }
  }

  async function formSubmit(e) {
    e.preventDefault();
    console.log("Form submitted");
    console.log(e.target)

    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe'); //TODO

    const data = {
      username: username,
      password: password,
      rememberMe: rememberMe,

    }

    const response = await fetch('http://localhost:9000/login', {
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
    // set cookie
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // Set the cookie to expire in 30 days

    document.cookie = `session_id=${responseData.cookie}; expires=${expirationDate.toUTCString()}; `;
    console.log(document.cookie);
    window.location.href = '/home';
  }

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <div className='h-screen flex justify-center items-center'>
      <img src="/hobbscussion.png" alt="Logo" className='pr-10'/>
      <div className='h-auto grid gap-4 place-content-center'>
        <h1>Login</h1>
        <form onSubmit={formSubmit}>
          <div>
            <p>Username</p>
            <input name="username" className="textBox" type="current-username" value={usernameValue} onChange={handleUsernameInputChange}></input>
          </div>
          <div>
            <p>Password</p>
            <input name="password" className="textBox" type="current-password" value={passwordValue} onChange={handlePasswordInputChange} ></input>
          </div>
          <br />
          <div>
            <input name="rememberMe" type="checkbox" id="rememberMe" value="rememberMe"></input>
            <label>Remember me?</label>
          </div>
          <div>
            <button className="border border-solid border-white button rounded-sm p-1" type="submit">Login</button>
          </div>
        </form>
        <sub>Don&#39;t have an account? <a href="/register">Register</a></sub>
      </div>
    </div>
  );
}
