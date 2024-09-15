import React, {useEffect, useState, useCallback} from 'react';
import axios from "axios";

export default function Login() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = useCallback(async () => {
    setError("");
    setSubmitting(true);
    try {
      const result = await axios.post('/api/auth', {
	username,
	password
      });
      setSubmitting(false);
      const {success, token} = result.data;
      if (!success) {
	setError("login failed");
      } else {
	localStorage.setItem('token', token);
	window.location.href = '/';
      }

    } catch (e) {
      console.log("e", e);
      setSubmitting(false);
      setError("login failed");
    }
  }, [username, password, setError, setSubmitting]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="login">
      <div className="main">
    	<h1>GuardForce VR</h1>
    	<div className="field">
	  <input placeholder="username" type="text" value={username} onChange={(e) => {setUsername(e.target.value)}}/>
	</div>
    	<div className="field">
	  <input placeholder="password" type="password" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
	</div>
    	<div className="field">
    	  <button onClick={submit} disabled={submitting}>Login</button>
	</div>

    	<div className="error">
    	  {error}
	</div>
      </div>
    </div>
  )
}
