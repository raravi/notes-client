import React, { useState } from 'react';
import axios from 'axios';
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import jwtDecode from 'jwt-decode';
import { loginApiDetails, appApiDetails } from './config/apiDetails';
import './App.css';

/**
 * The main App component.
 * Routes to Login / Dashboard React Components based upon the LOGIN state.
 */
function App() {
  let [ userLoggedIn, setUserLoggedIn ] = useState(null);
  let [ notes, setNotes ] = useState([]);

  function onSuccessfulLogin(response) {
    if (response && response.data && response.data.token) {
      let tokenDecoded = jwtDecode(response.data.token);
      if(tokenDecoded) {
        sessionStorage.setItem("token", response.data.token);

        axios.post(appApiDetails.url + appApiDetails.endpoints.initialSync, {
          userid: tokenDecoded.id
        },
        {
          withCredentials: true,
          headers: {
            Authorization: sessionStorage.getItem("token")
          }
        })
        .then(responseSync => {
          if (responseSync && responseSync.data && responseSync.data.success) {
            setNotes(responseSync.data.notes);
            setUserLoggedIn({id: tokenDecoded.id, name: tokenDecoded.name});
          }
        })
        .catch(error => console.log(error));
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
              apiDetails={loginApiDetails} />
        }
      </Route>
    </Switch>
  );
}

export default App;
