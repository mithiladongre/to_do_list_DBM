import { useEffect, useState } from 'react';
import './AuthForm.css';
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom"; 

function App() {
  const [isSignIn, setIsSignIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  axios.defaults.withCredentials=true;
  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/home', { withCredentials: true });
            console.log("app res->",response);
            if(response.data.valid){
                navigate('/');
            }else{
                navigate('/auth');
            }
        } catch (err) {
            setError(err.response?.data || "Error fetching user data");
        }
    };

    fetchUserData();
}, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const route = isSignIn ? "/register" : "/login";
      const response = await axios.post(`http://localhost:3000${route}`, {
        username: userName,
        password: password,
      }, { withCredentials: true });

      if (response.data.login) {
        navigate('/'); 
      } else {
        setMessage("Unexpected error occurred");
      }
    } catch (err) {
      setMessage("Error: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="sign-in-login-modal">
      <div className="modal-content">
        <h2 className="login-signin">{isSignIn ? 'Sign In' : 'Login'}</h2>
          <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <button type="submit">{isSignIn ? 'Sign In' : 'Login'}</button>
          </div>
          <div className="error"><b>{message}</b></div>
        </form>
        <div className="toggle-form">
          {isSignIn ? 'Already have an account? ' : 'Don\'t have an account? '}
          <button onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? 'Login' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
