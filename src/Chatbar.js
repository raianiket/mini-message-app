import { Avatar, IconButton } from '@material-ui/core'
import { AttachFile, InsertEmoticonOutlined, MoreVert, SearchOutlined } from '@material-ui/icons'
import React from 'react'
import './Chatbar.css'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import MicIcon from '@material-ui/icons/Mic'

function ChatBar() {
    return (
        <div className="chatbar">
            <div className="chatbar_header">
                <Avatar />
                <div className="chatbar_header_info">
                    <h3>Aniket Group</h3>
                    <p>Last seen...</p>
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
                <p className="chatbar_message">
                    <span className="chatbar_body_name">Chikoo</span>
                    Hello Aniket!!!!
                    <span className="chatbar_body_timeStamp">{new Date().toUTCString()}</span>
                </p>
                <p className="chatbar_message chatbar_reciever">
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
                </p>
            </div>
            <div className="chatbar_footer">
                <InsertEmoticonIcon />
                <form>
                    <input placeholder="Type your message" type="text"/>
                    <button type="submit">Send your message</button>
                </form>
                <MicIcon />
            </div>
        </div>
    )
}

export default ChatBar
