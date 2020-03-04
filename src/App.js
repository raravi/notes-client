import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import './App.css';

function App() {
  let [ userLoggedIn, setUserLoggedIn ] = useState(null);

  return (
    <>
      {userLoggedIn && <Dashboard setUserLoggedIn={setUserLoggedIn} />}
      {!userLoggedIn && <Login setUserLoggedIn={setUserLoggedIn} />}
    </>
  );
}

export default App;
