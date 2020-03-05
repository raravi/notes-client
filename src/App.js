import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import './App.css';

function App() {
  let [ userLoggedIn, setUserLoggedIn ] = useState(null);
  let [ notes, setNotes ] = useState([]);

  return (
    <>
      {userLoggedIn && <Dashboard setUserLoggedIn={setUserLoggedIn} notes={notes} />}
      {!userLoggedIn && <Login setUserLoggedIn={setUserLoggedIn} setNotes={setNotes} />}
    </>
  );
}

export default App;
