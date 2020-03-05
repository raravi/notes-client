import React, { useState } from 'react';
import { LoginSection } from './LoginSection';
import { RegisterSection } from './RegisterSection';
import { ForgotPasswordSection } from './ForgotPasswordSection';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

axios.defaults.withCredentials = true  // enable axios post cookie, default false

export const Login = (props) => {
  let [ forgotPassword, setForgotPassword ] = useState(false);
  let [ newUser, setNewUser ] = useState(false);
  let [ loginEmailError, setLoginEmailError ] = useState('');
  let [ loginPasswordError, setLoginPasswordError ] = useState('');
  let [ registerUsernameError, setRegisterUsernameError ] = useState('');
  let [ registerEmailError, setRegisterEmailError ] = useState('');
  let [ registerPasswordError, setRegisterPasswordError ] = useState('');
  let [ registerPassword2Error, setRegisterPassword2Error ] = useState('');
  let [ registerSuccess, setRegisterSuccess ] = useState('');
  let [ forgotPasswordEmailError, setForgotPasswordEmailError ] = useState('');
  let [ forgotPasswordEmailSuccess, setForgotPasswordEmailSuccess ] = useState('');

  /**
   * These functions toggle/set state variables.
   */
  function toggleNewUser() {
    setNewUser(!newUser);
  }
  function onClickForgotPassword() {
    setForgotPassword(true);
  }

  /**
   * Try to login the user, send the details to the server
   * and display the server response to the user.
   */
  function login() {
    var email = document.getElementsByClassName("login__email")[0];
    var password = document.getElementsByClassName("login__password")[0];

    setLoginEmailError('');
    setLoginPasswordError('');

    /**
     * POST the user request to the API endpoint '/login'.
     */
    axios.post('http://localhost:8000/api/users/login', {
      email: email.value,
      password: password.value
    })
    .then(function (response) {
      let tokenDecoded = jwtDecode(response.data.token);
      if(tokenDecoded) {
        sessionStorage.setItem("token", response.data.token);
        props.setNotes(response.data.notes);
        props.setUserLoggedIn({id: tokenDecoded.id, name: tokenDecoded.name});
        // TODO: Do Login stuff
      }
    })
    .catch(function (error) {
      if (error.response) {
        if (error.response.data) {
          if (error.response.data.email) {
            setLoginEmailError(error.response.data.email);
          }
          if (error.response.data.password) {
            setLoginPasswordError(error.response.data.password);
          }
        }
      } else {
        console.log(error);
      }
    });
  }

  /**
   * Try to register the new user, send the details to the server
   * and display the server response to the user.
   */
  function register () {
    var username = document.getElementsByClassName("register__username")[0];
    var email = document.getElementsByClassName("register__email")[0];
    var password = document.getElementsByClassName("register__password")[0];
    var password2 = document.getElementsByClassName("register__password2")[0];

    setRegisterUsernameError('');
    setRegisterEmailError('');
    setRegisterPasswordError('');
    setRegisterPassword2Error('');
    setRegisterSuccess('');

    /**
     * POST the user request to the API endpoint '/register'.
     */
    axios.post('http://localhost:8000/api/users/register', {
      name: username.value,
      email: email.value,
      password: password.value,
      password2: password2.value
    })
    .then(function (response) {
      setRegisterSuccess(response.data.createduser);
    })
    .catch(function (error) {
      if (error.response) {
        if (error.response.data) {
          if (error.response.data.name) {
            setRegisterUsernameError(error.response.data.name);
          }
          if (error.response.data.email) {
            setRegisterEmailError(error.response.data.email);
          }
          if (error.response.data.password) {
            setRegisterPasswordError(error.response.data.password);
          }
          if (error.response.data.password2) {
            setRegisterPassword2Error(error.response.data.password2);
          }
        }
      } else {
        console.log(error);
      }
    });
  }

  /**
   * Try to initiate the reset of the user's password, send
   * the details to the server and display the server response
   * to the user.
   */
  function sendForPasswordReset() {
    var email = document.getElementsByClassName("forgot-password__email")[0];

    setForgotPasswordEmailError('');
    setForgotPasswordEmailSuccess('');

    /**
     * POST the user request to the API endpoint '/forgotpassword'.
     */
    axios.post('http://localhost:8000/api/users/forgotpassword', {
      email: email.value
    })
    .then(function (response) {
      if (response.data.emailsent)
        setForgotPasswordEmailSuccess(response.data.emailsent);
    })
    .catch(function (error) {
      if (error.response) {
        if (error.response.data) {
          if (error.response.data.email) {
            setForgotPasswordEmailError(error.response.data.email);
          }
        }
      } else {
        console.log(error);
      }
    });
  }

  return (
    <div className="login-container">
      <header className="login-header">
        <h1 className="login-header__title">notes</h1>
      </header>
      { !forgotPassword && !newUser &&
        <LoginSection
          toggleNewUser={toggleNewUser}
          loginEmailError={loginEmailError}
          loginPasswordError={loginPasswordError}
          login={login}
          onClickForgotPassword={onClickForgotPassword}
        />
      }
      { !forgotPassword && newUser &&
        <RegisterSection
          toggleNewUser={toggleNewUser}
          registerUsernameError={registerUsernameError}
          registerEmailError={registerEmailError}
          registerPasswordError={registerPasswordError}
          registerPassword2Error={registerPassword2Error}
          registerSuccess={registerSuccess}
          register={register}
        />
      }
      { forgotPassword &&
        <ForgotPasswordSection
          forgotPasswordEmailError={forgotPasswordEmailError}
          forgotPasswordEmailSuccess={forgotPasswordEmailSuccess}
          sendForPasswordReset={sendForPasswordReset}
        />
      }
      <footer className="login-footer">
        <p>&#169; 2020 Amith Raravi - source code on <a href="https://github.com/raravi/notes-client">Github</a></p>
      </footer>
    </div>
  )
}
