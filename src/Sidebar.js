import React, { useEffect, useState } from 'react'
import './Sidebar.css'
import DonutLargeIcon from '@mui/icons-material/DonutLarge'
import { Avatar, IconButton } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { collection, onSnapshot } from 'firebase/firestore'
import SidebarChat from './SidebarChat'
import db from './firebase'
import { useStateValue } from './StateProvider'


function Sidebar() {
    const [rooms, setRooms] = useState([])
    const [{ user }] = useStateValue()

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'rooms'), (snapshot) =>
            setRooms(snapshot.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data(),
                }))
            )
        )

        return () => {
            unsubscribe();
        }
    }, [])

    return (
        <div className="sidebar">
            <div className="sidebar_header">
                <Avatar src={user?.photoURL}/>
                <div className="sidebar_header_right">
                    <IconButton>
                        <DonutLargeIcon />
                    </IconButton>
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>
            <div className="sidebar_search">
                <div className="sidebar_search_container">
                    <SearchOutlinedIcon />
                    <input type='text' placeholder='search new chat name' />
                </div>
            </div>
            <div className="sidebar_chat">
                <SidebarChat addNewChat />
                {rooms.map(room => (
                    <SidebarChat key={room.id} id={room.id} name={room.data.name} />
                ))}

            </div>
        </div>
    )
}

export default Sidebar
