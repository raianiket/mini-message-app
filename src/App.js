import React from 'react';
//import logo from './logo.svg';
import './App.css';
import ChatBar from './Chatbar';
import Sidebar from './Sidebar';

function App() {
  return (
    <div className="app">
      <div className="app_body">
      <Sidebar />
      <ChatBar />

      </div>
      
    </div>
  );
}

export default App;
