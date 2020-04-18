import React, { useState } from 'react';
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import jwtDecode from 'jwt-decode';
import './App.css';

/**
 * The main App component.
 * Routes to Login / Dashboard React Components based upon the LOGIN state.
 */
function App() {
  let [ userLoggedIn, setUserLoggedIn ] = useState(null);
  let [ notes, setNotes ] = useState([]);

  const apiDetails = {
    url: 'http://localhost:8000',
    endpoints: {
      login: '/api/users/login',
      register: '/api/users/register',
      forgotPassword: '/api/users/forgotpassword'
    }
  };

  function onSuccessfulLogin(response) {
    if (response && response.data && response.data.token) {
      let tokenDecoded = jwtDecode(response.data.token);
      if(tokenDecoded) {
        sessionStorage.setItem("token", response.data.token);
        setNotes(response.data.notes);
        setUserLoggedIn({id: tokenDecoded.id, name: tokenDecoded.name});
      }/* else {
        loginDispatch({ type: 'email-error', text: "An error occured..." });
      }*/
    }
  }

  return (
    <Switch>
      <Route path="/dashboard">
        { userLoggedIn
          ? <Dashboard  setUserLoggedIn={setUserLoggedIn}
                        notes={notes}
                        setNotes={setNotes}
                        user={userLoggedIn} />
          : <Redirect to="/" />
        }
      </Route>
      <Route path="/">
        { userLoggedIn
          ? <Redirect to="/dashboard" />
          : <Login
              loginSuccessCallback={onSuccessfulLogin}
              apiDetails={apiDetails} />
        }
      </Route>
    </Switch>
  );
}

export default App;
