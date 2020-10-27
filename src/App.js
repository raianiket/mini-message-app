import React, { useEffect, useState } from 'react';
//import logo from './logo.svg';
import './App.css';
import ChatBar from './Chatbar';
import Sidebar from './Sidebar';
import Pusher from 'pusher-js';
import axios from './axios';
// import { Router } from '@material-ui/icons';
// import { Switch } from '@material-ui/core';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './Login';
import { useStateValue } from './StateProvider';

function App() {
  const [messages, setMessages] = useState([]);
  const [{user},dispatch] = useStateValue()

  useEffect(() => {
    axios.get('/messages/sync')
      .then(response => {
        setMessages(response.data)
      })
  }, []);

  useEffect(() => {
    const pusher = new Pusher('2e9f78736c623a9de0a4', {
      cluster: 'ap2'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', (newMessage) => {
      //alert(JSON.stringify(newMessage));
      setMessages([...messages, newMessage])
    });

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [messages]);

  console.log(messages);

  return (
    <div className="app">

      {!user ? (
        <Login />
      ) : (
          <div className="app_body">
            <Router>
              <Sidebar />

              <Switch>
                <Route path="/rooms/:roomId">
                  <ChatBar messages={messages} />
                </Route>
                <Route path="/">
                  <ChatBar messages={messages} />
                </Route>
              </Switch>
            </Router>
          </div>
        )}

    </div>
  );
}

export default App;
