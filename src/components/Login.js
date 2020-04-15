import React, { useReducer } from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import { LoginSection } from './LoginSection';
import { RegisterSection } from './RegisterSection';
import { ForgotPasswordSection } from './ForgotPasswordSection';
import {
  loginReducer,
  registerReducer,
  forgotPasswordReducer
} from '../reducers';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

axios.defaults.withCredentials = true  // enable axios post cookie, default false

/**
 * Login React Component: This component contains all the
 * Login components - (LoginSection, RegisterSection & ForgotPassword).
 */
export const Login = (props) => {
  const [loginState, loginDispatch] = useReducer(loginReducer, {
    emailError: '',
    passwordError: '',
  });
  const [registerState, registerDispatch] = useReducer(registerReducer, {
    usernameError: '',
    emailError: '',
    passwordError: '',
    password2Error: '',
    success: '',
  });
  const [forgotPasswordState, forgotPasswordDispatch] = useReducer(forgotPasswordReducer, {
    emailError: '',
    emailSuccess: '',
  });

  /**
   * Try to login the user, send the details to the server
   * and display the server response to the user.
   */
  function login() {
    var email = document.getElementsByClassName("login__email")[0];
    var password = document.getElementsByClassName("login__password")[0];

    loginDispatch({ type: 'email-error', text: '' });
    loginDispatch({ type: 'password-error', text: '' });

    /**
     * POST the user request to the API endpoint '/login'.
     */
    axios.post('http://localhost:8000/api/users/login', {
      email: email.value,
      password: password.value
    })
    .then(function (response) {
      if (response && response.data && response.data.token) {
        let tokenDecoded = jwtDecode(response.data.token);
        if(tokenDecoded) {
          sessionStorage.setItem("token", response.data.token);
          props.setNotes(response.data.notes);
          props.setUserLoggedIn({id: tokenDecoded.id, name: tokenDecoded.name});
        } else {
          loginDispatch({ type: 'email-error', text: "An error occured..." });
        }
      }
    })
    .catch(function (error) {
      if (error && error.response && error.response.data) {
        if (error.response.data.email) {
          loginDispatch({ type: 'email-error', text: error.response.data.email });
        }
        if (error.response.data.password) {
          loginDispatch({ type: 'password-error', text: error.response.data.password });
        }
      } else {
        loginDispatch({ type: 'email-error', text: "Unable to reach server..." });
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

    registerDispatch({ type: 'username-error', text: '' });
    registerDispatch({ type: 'email-error', text: '' });
    registerDispatch({ type: 'password-error', text: '' });
    registerDispatch({ type: 'password2-error', text: '' });
    registerDispatch({ type: 'success', text: '' });

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
      if (response && response.data && response.data.createduser)
        registerDispatch({ type: 'success', text: response.data.createduser });
    })
    .catch(function (error) {
      if (error && error.response && error.response.data) {
        if (error.response.data.name) {
          registerDispatch({ type: 'username-error', text: error.response.data.name });
        }
        if (error.response.data.email) {
          registerDispatch({ type: 'email-error', text: error.response.data.email });
        }
        if (error.response.data.password) {
          registerDispatch({ type: 'password-error', text: error.response.data.password });
        }
        if (error.response.data.password2) {
          registerDispatch({ type: 'password2-error', text: error.response.data.password2 });
        }
      } else {
        registerDispatch({ type: 'username-error', text: "Unable to reach server..." });
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

    forgotPasswordDispatch({ type: 'email-error', text: '' });
    forgotPasswordDispatch({ type: 'email-success', text: '' });

    /**
     * POST the user request to the API endpoint '/forgotpassword'.
     */
    axios.post('http://localhost:8000/api/users/forgotpassword', {
      email: email.value
    })
    .then(function (response) {
      if (response && response.data && response.data.emailsent)
        forgotPasswordDispatch({ type: 'email-success', text: response.data.emailsent });
    })
    .catch(function (error) {
      if (error && error.response && error.response.data && error.response.data.email) {
        forgotPasswordDispatch({ type: 'email-error', text: error.response.data.email });
      } else {
        forgotPasswordDispatch({ type: 'email-error', text: "Unable to reach server..." });
      }
    });
  }

  return (
    <div className="login-container">
      <header className="login-header">
        <h1 className="login-header__title">notes</h1>
      </header>
      <Switch>
        <Route exact path="/">
          <LoginSection
            loginState={loginState}
            login={login}
          />
        </Route>
        <Route path="/register">
          <RegisterSection
            registerState={registerState}
            register={register}
          />
        </Route>
        <Route path="/forgot-password">
          <ForgotPasswordSection
            forgotPasswordState={forgotPasswordState}
            sendForPasswordReset={sendForPasswordReset}
          />
        </Route>
      </Switch>
      <footer className="login-footer">
        <p>&#169; 2020 Amith Raravi - source code on <a href="https://github.com/raravi/notes-client">Github</a></p>
      </footer>
    </div>
  )
}
