import React, { useState } from 'react';

const Authform = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className='container'>
      <div className='form-container'>
        <div className='form-toggle'>
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Sign Up</button>
        </div>

        
        {isLogin ? (
          <>
            <div className='form'>
              <h2>Login</h2>
                <input type="tel" id="mobile" placeholder="Mobile" />
                <input type="password" id="password" placeholder="Password" />
                <a href='#'>Forgot Password</a>
                <button type="submit">Login</button>
                <p>Not a member? <a href='#' onClick={() => setIsLogin(false)}>Sign up now</a></p>
                
            </div>
          </>
        ) : (
          <>
            <div className='form'>
              <h2>Sign Up</h2>
                <input type="tel" id="signup-mobile" placeholder="Mobile" />
                <input type="password" id="signup-password" placeholder="Password" />
                <input type="password" id="confirm-password" placeholder="Confirm Password" />
                <button type="submit">Sign Up</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Authform;