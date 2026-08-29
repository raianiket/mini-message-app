import React from 'react';
import './App.css';
import ChatBar from './Chatbar';
import Sidebar from './Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import { useStateValue } from './StateProvider';

function App() {
  const [{ user }] = useStateValue()

  return (
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
  );
}

export default App;
