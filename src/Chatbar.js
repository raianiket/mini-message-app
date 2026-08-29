import { Avatar, IconButton } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import React, { useState, useEffect } from 'react'
import './Chatbar.css'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import MicIcon from '@mui/icons-material/Mic'
import { useParams } from 'react-router-dom'
import { collection, doc, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import db from './firebase'
import { useStateValue } from './StateProvider'
import EmojiPicker, { SkinTones } from 'emoji-picker-react'


function ChatBar() {

    const [input, setInput] = useState('')
    const [seed, setSeed] = useState('')
    const {roomId} = useParams();
    const [roomName, setRoomName] = useState('')
    const [messages, setMessages] = useState([])
    const [{user}] = useStateValue()
    const [emojiShown, setEmojiShown] = useState(false);

    useEffect(() => {
        if(roomId){
            const unsubscribeRoom = onSnapshot(doc(db, 'rooms', roomId), snapshot => (
                setRoomName(snapshot.data().name)
            ));

            const messagesQuery = query(collection(db, 'rooms', roomId, 'messages'), orderBy('timeStamp', 'asc'))
            const unsubscribeMessages = onSnapshot(messagesQuery, snapshot => (
                setMessages(snapshot.docs.map(doc => doc.data()))
            ))

            return () => {
                unsubscribeRoom()
                unsubscribeMessages()
            }
        }
    }, [roomId])

    const sendMessage = async(e) => {
        e.preventDefault();

        addDoc(collection(db, 'rooms', roomId, 'messages'), {
            message: input,
            name: user.displayName,
            timeStamp: serverTimestamp(),
        })

        setInput('')
    }


    useEffect(() => {
        setSeed(Math.floor(Math.random()*5000))
    }, [roomId])

    const onEmojiClick = (emojiData) => {
        setInput(input+emojiData.emoji);
    }

    return (
        <div className="chatbar">
            <div className="chatbar_header">
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
                <div className="chatbar_header_info">
                    <h3>{roomName}</h3>
                    <p>Last seen{' '}
                    {new Date(messages[messages.length - 1]?.timeStamp?.toDate()).toUTCString()}
                    </p>
                </div>
                <div className="chat_header_right">
                    <IconButton>
                        <SearchOutlinedIcon />
                    </IconButton>
                    <IconButton>
                        <AttachFileIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>
            <div className="chatbar_body">
                {messages.map((message, i) =>(
                    <p key={i} className={`chatbar_message ${message.name === user.displayName && 'chatbar_reciever'}`}>
                    <span className="chatbar_body_name">{message.name}</span>
                    {message.message}
                    <span className="chatbar_body_timeStamp">{new Date(message.timeStamp?.toDate()).toUTCString()}</span>
                </p>
                ))}
            </div>
            <div className="chatbar_footer">
                {
                    emojiShown &&
                    <span className='emoji-picker'><EmojiPicker onEmojiClick={onEmojiClick} defaultSkinTone={SkinTones.MEDIUM_DARK} /></span>
                }
            <InsertEmoticonIcon onClick={() => setEmojiShown(!emojiShown)}  />
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
