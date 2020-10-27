import { Avatar, IconButton } from '@material-ui/core'
import { AttachFile, MoreVert, SearchOutlined } from '@material-ui/icons'
import React, { useState, useEffect } from 'react'
import './Chatbar.css'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import MicIcon from '@material-ui/icons/Mic'
import axios from './axios'
import { useParams } from 'react-router-dom'
import db from './firebase'
import { useStateValue } from './StateProvider'
import firebase from 'firebase'


function ChatBar({}) {

    const [input, setInput] = useState('')
    const [seed, setSeed] = useState('')
    const {roomId} = useParams();
    const [roomName, setRoomName] = useState('')
    const [messages, setMessages] = useState([])
    const [{user},dispatch] = useStateValue()

    useEffect(() => {
        if(roomId){
            db.collection('rooms').doc(roomId).onSnapshot(snapshot => (setRoomName(snapshot.data().name)
            ));

            db.collection('rooms').doc(roomId).collection('messages').orderBy('timeStamp','asc').onSnapshot(snapshot => (
                setMessages(snapshot.docs.map(doc => doc.data()))
            ))
        }
    }, [roomId])
    const sendMessage = async(e) => {
        e.preventDefault(); 
        //console.log('input:',input)

        // await axios.post('/messages/new', {
        //     message: input,
        //     name: 'Ani',
        //     timeStamp: 'testing',
        //     received: false,
        // })


        db.collection('rooms').doc(roomId).collection('messages').add({
            message: input,
            name: user.displayName,
            timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        
        setInput('')
    }


    useEffect(() => {
        setSeed(Math.floor(Math.random()*5000))
    }, [roomId])


    return (
        <div className="chatbar">
            <div className="chatbar_header">
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
                <div className="chatbar_header_info">
                    <h3>{roomName}</h3>
                    <p>Last seen{' '}
                    {new Date(messages[messages.length - 1] ?.timeStamp?.toDate()).toUTCString()}
                    </p>
                </div>
                <div className="chat_header_right">
                    <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </div>
            </div>
            <div className="chatbar_body">
                {messages.map((message) =>(
                    <p className={`chatbar_message ${message.name === user.displayName &&   'chatbar_reciever'}`}>
                    <span className="chatbar_body_name">{message.name}</span>
                    {message.message}
                    <span className="chatbar_body_timeStamp">{new Date(message.timeStamp ?.toDate()).toUTCString()}</span>
                </p>
                ))}
                
                {/* <p className="chatbar_message chatbar_reciever">
                    <span className="chatbar_body_name">Chikoo</span>
                    Hello Aniket!!!!
                    <span className="chatbar_body_timeStamp">{new Date().toUTCString()}</span>
                </p>
                <p className="chatbar_message">
                    <span className="chatbar_body_name">Chikoo</span>
                    Hello Aniket!!!!
                    <span className="chatbar_body_timeStamp">{new Date().toUTCString()}</span>
                </p>
                <p className="chatbar_message chatbar_reciever">
                    <span className="chatbar_body_name">Chikoo</span>
                    Hello Aniket!!!!
                    <span className="chatbar_body_timeStamp">{new Date().toUTCString()}</span>
                </p> */}
            </div>
            <div className="chatbar_footer">
                <InsertEmoticonIcon />
                <form>
                    <input value={input} onChange={e =>setInput(e.target.value)} placeholder="Type your message" type="text"/>
                    <button onClick ={sendMessage} type="submit">Send your message</button>
                </form>
                <MicIcon />
            </div>
        </div>
    )
}

export default ChatBar
