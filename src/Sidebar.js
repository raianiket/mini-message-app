import React from 'react'
import './Sidebar.css'
import DonutLargeIcon from '@material-ui/icons/DonutLarge'
import { Avatar, IconButton } from '@material-ui/core'
import ChatIcon from '@material-ui/icons/Chat'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import {SearchOutlined} from '@material-ui/icons'
import SidebarChat from './SidebarChat'


function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar_header">
                <Avatar src='https://avatars2.githubusercontent.com/u/49118761?s=460&u=37843b382defaf149d3df6ae066db046ff2eaf50&v=4'/>
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
                    <SearchOutlined />
                    <input type='text' placeholder='search new chat name' />
                </div>
            </div>
            <div className="sidebar_chat">
                <SidebarChat />
                <SidebarChat />
                <SidebarChat />                
            </div>
        </div>
    )
}

export default Sidebar
