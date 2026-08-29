import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import ChatBar from './components/Chatbar';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from './config/firebase';
import db from './config/firebase';
import { actionTypes } from './context/reducer';
import { useStateValue } from './context/StateProvider';
import { useTheme } from './context/ThemeContext';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

function App() {
  const [{ user }, dispatch] = useStateValue()
  const [authChecked, setAuthChecked] = useState(false)
  const { resolvedTheme } = useTheme()

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: resolvedTheme,
      primary: { main: '#1a6cf5' },
    },
  }), [resolvedTheme])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      dispatch({ type: actionTypes.SET_USER, user: firebaseUser })
      setAuthChecked(true)
      if (firebaseUser) {
        setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }, { merge: true }).catch(() => {})
      }
    })
    return unsubscribe
  }, [dispatch])

  // ponytail: heartbeat-based presence, not a real onDisconnect (that needs
  // Realtime Database). "online" just means a heartbeat landed recently.
  useEffect(() => {
    if (!user) return
    const beat = () => updateDoc(doc(db, 'users', user.uid), { lastActive: serverTimestamp() }).catch(() => {})
    beat()
    const interval = setInterval(beat, 20000)
    return () => clearInterval(interval)
  }, [user])

  if (!authChecked) {
    return <div className="app" />
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <div className="app">

        {!user ? (
          <Login />
        ) : (
            <div className="app_body">
              <Router>
                <Sidebar />

                <Routes>
                  <Route path="/rooms/:roomId" element={<ChatBar />} />
                  <Route path="/" element={<ChatBar />} />
                </Routes>
              </Router>
            </div>
          )}

      </div>
    </MuiThemeProvider>
  );
}

export default App;
