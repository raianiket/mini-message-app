import React from 'react'
import './SidebarChat.css'
import { Avatar } from '@material-ui/core'

function SidebarChat() {
    return (
        <div className="sidebarChat">
            <Avatar />
            <div className="sidebar_chat_info">
                <h2>Aniket</h2>
                <p>Last message...</p>
            </div>
        </div>
    )
}

export default SidebarChat
