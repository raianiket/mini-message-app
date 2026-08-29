import React, { useEffect, useState } from 'react'
import './SidebarChat.css'
import { Avatar } from '@mui/material'
import { collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore'
import db from './firebase'
import { Link } from 'react-router-dom'

function SidebarChat({ id, name, addNewChat }) {
    const [seed, setSeed] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
        if (id) {
            const messagesQuery = query(collection(db, 'rooms', id, 'messages'), orderBy('timeStamp', 'asc'))
            const unsubscribe = onSnapshot(messagesQuery, snapshot => (
                setMessages(snapshot.docs.map(doc => doc.data()))
            ))
            return () => unsubscribe()
        }
    }, [id])

    useEffect(() => {
        setSeed(Math.floor(Math.random()*5000))
    }, [])

    const createChat = () =>{
        const roomName = prompt('Please Enter name for Chat: ')

        if(roomName){
            addDoc(collection(db, 'rooms'), {
                name: roomName,
            })
        }
    }


    return !addNewChat ? (
        <Link to={`/rooms/${id}`}>
            <div className="sidebarChat">
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
                <div className="sidebar_chat_info">
                    <h2>{name}</h2>
                    <p>{messages[0]?.message}</p>
                </div>
            </div>
        </Link>

    ): (
        <div onClick={createChat} className="sidebarChat">
            <h2>Add New Chat</h2>
        </div>
    )
}

export default SidebarChat
