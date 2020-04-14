import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import './App.css';

/**
 * The main App component.
 * Routes to Login / Dashboard React Components based upon the LOGIN state.
 */
function App() {
  let [ userLoggedIn, setUserLoggedIn ] = useState(null);
  let [ notes, setNotes ] = useState([]);

  return (
    <Router>
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
            : <Login  setUserLoggedIn={setUserLoggedIn}
                      setNotes={setNotes} />
          }
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
