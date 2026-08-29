import React, { useEffect, useState } from 'react'
import './SidebarChat.css'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import db from '../config/firebase'
import { Link, useNavigate } from 'react-router-dom'
import InitialsAvatar from './InitialsAvatar'
import { formatMessageTime, deleteRoom } from '../utils'

function SidebarChat({ id, name, addNewChat, onAddNewChat, active, isGroup }) {
    const [messages, setMessages] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            const messagesQuery = query(collection(db, 'rooms', id, 'messages'), orderBy('timeStamp', 'asc'))
            const unsubscribe = onSnapshot(messagesQuery, snapshot => (
                setMessages(snapshot.docs.map(doc => doc.data()))
            ))
            return () => unsubscribe()
        }
    }, [id])

    const handleDelete = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!window.confirm(`Delete "${name}" for everyone? This can't be undone.`)) return
        await deleteRoom(id)
        if (active) navigate('/')
    }

    const lastMessage = messages[messages.length - 1]

    return !addNewChat ? (
        <Link to={`/rooms/${id}`}>
            <div className={`sidebarChat ${active ? 'sidebarChat_active' : ''}`}>
                <InitialsAvatar name={name} isGroup={isGroup} />
                <div className="sidebar_chat_info">
                    <div className="sidebar_chat_top_row">
                        <h2>{name}</h2>
                        {lastMessage && <span className="sidebar_chat_time">{formatMessageTime(lastMessage.timeStamp)}</span>}
                    </div>
                    <p>{lastMessage?.message || 'No messages yet'}</p>
                </div>
                <button type="button" className="sidebarChat_delete" onClick={handleDelete} aria-label={`Delete ${name}`}>
                    <DeleteOutlineIcon fontSize="small" />
                </button>
            </div>
        </Link>

    ): (
        <div onClick={onAddNewChat} className="sidebarChat sidebarChat_new">
            <div className="sidebarChat_new_icon"><AddIcon /></div>
            <h2>Add New Chat</h2>
        </div>
    )
}

export default SidebarChat
