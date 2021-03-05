import React from 'react';
import LoginComponent from '@bit/raravi.react.login';

/**
 * Login React Component: This component contains all the
 * Login components - (LoginSection, RegisterSection & ForgotPassword).
 */
export const Login = (props: LoginComponentProps) => {
  return (
    <div className="login-container">
      <header className="login-header">
        <h1 className="login-header__title">notes</h1>
      </header>
      <LoginComponent
        loginSuccessCallback={props.loginSuccessCallback}
        apiDetails={props.apiDetails} />
      <footer className="login-footer">
        <p>&#169; 2020 Amith Raravi - source code on <a href="https://github.com/raravi/notes-client">Github</a></p>
      </footer>
    </div>
  )
}
