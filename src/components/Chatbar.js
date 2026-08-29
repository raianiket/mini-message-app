import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import React, { useState, useEffect, useRef } from 'react'
import './Chatbar.css'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, doc, addDoc, deleteDoc, getDocs, writeBatch, updateDoc, deleteField, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import db from '../config/firebase'
import { useStateValue } from '../context/StateProvider'
import InitialsAvatar from './InitialsAvatar'
import GroupInfoModal from './GroupInfoModal'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { formatFullTimestamp, deleteRoom } from '../utils'
import { useTheme } from '../context/ThemeContext'
import EmojiPicker, { SkinTones, Theme } from 'emoji-picker-react'

const TYPING_TIMEOUT = 3000
const MAX_IMAGE_BYTES = 700 * 1024

function ChatBar() {

    const [input, setInput] = useState('')
    const {roomId} = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null)
    const [roomName, setRoomName] = useState('')
    const [roomType, setRoomType] = useState('group')
    const [memberNames, setMemberNames] = useState({})
    const [infoOpen, setInfoOpen] = useState(false)
    const [typingUsers, setTypingUsers] = useState({})
    const [messages, setMessages] = useState([])
    const [{user}] = useStateValue()
    const [emojiShown, setEmojiShown] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [showJump, setShowJump] = useState(false)
    const bodyEndRef = useRef(null)
    const scrollRef = useRef(null)
    const atBottomRef = useRef(true)
    const prevCountRef = useRef(0)
    const typingTimeoutRef = useRef(null)
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        if(roomId){
            const unsubscribeRoom = onSnapshot(doc(db, 'rooms', roomId), snapshot => {
                const data = snapshot.data()
                setRoomName(data.name)
                setRoomType(data.type || 'group')
                setMemberNames(data.memberNames || {})
                setTypingUsers(data.typing || {})
            });

            const messagesQuery = query(collection(db, 'rooms', roomId, 'messages'), orderBy('timeStamp', 'asc'))
            const unsubscribeMessages = onSnapshot(messagesQuery, snapshot => (
                setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
            ))

            return () => {
                unsubscribeRoom()
                unsubscribeMessages()
            }
        }
    }, [roomId])

    useEffect(() => {
        setSearchOpen(false)
        setSearchTerm('')
        prevCountRef.current = 0
        atBottomRef.current = true
        setShowJump(false)
    }, [roomId])

    const handleScroll = () => {
        const el = scrollRef.current
        if (!el) return
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
        atBottomRef.current = nearBottom
        setShowJump(!nearBottom)
    }

    useEffect(() => {
        if (searchOpen) return
        const newest = messages[messages.length - 1]
        const isOwn = newest && newest.name === user.displayName
        const grew = messages.length > prevCountRef.current
        if (grew && (atBottomRef.current || isOwn)) {
            bodyEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            atBottomRef.current = true
            setShowJump(false)
        }
        prevCountRef.current = messages.length
    }, [messages, searchOpen, user.displayName])

    const jumpToBottom = () => bodyEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    const setTyping = (isTyping) => {
        updateDoc(doc(db, 'rooms', roomId), {
            [`typing.${user.uid}`]: isTyping ? user.displayName : deleteField(),
        }).catch(() => {})
    }

    const handleInputChange = (e) => {
        setInput(e.target.value)
        setTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTyping(false), TYPING_TIMEOUT)
    }

    const sendMessage = async(e) => {
        e.preventDefault();
        if (!input.trim()) return;

        addDoc(collection(db, 'rooms', roomId, 'messages'), {
            message: input,
            name: user.displayName,
            timeStamp: serverTimestamp(),
        })

        setInput('')
        clearTimeout(typingTimeoutRef.current)
        setTyping(false)
    }

    const attachImage = () => fileInputRef.current?.click()

    const handleFileSelected = (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        if (!file.type.startsWith('image/')) {
            alert('Only image files can be shared.')
            return
        }
        if (file.size > MAX_IMAGE_BYTES) {
            alert(`That image is too large (${Math.round(file.size / 1024)}KB). Please pick one under ${Math.round(MAX_IMAGE_BYTES / 1024)}KB.`)
            return
        }
        const reader = new FileReader()
        reader.onload = () => {
            addDoc(collection(db, 'rooms', roomId, 'messages'), {
                message: '',
                imageUrl: reader.result,
                name: user.displayName,
                timeStamp: serverTimestamp(),
            })
        }
        reader.readAsDataURL(file)
    }

    const deleteMessage = (messageId) => {
        if (!window.confirm('Delete this message?')) return
        deleteDoc(doc(db, 'rooms', roomId, 'messages', messageId))
    }

    const clearChat = async () => {
        setMenuAnchor(null)
        if (!window.confirm(`Delete all messages in "${roomName}"? This can't be undone.`)) return
        const snapshot = await getDocs(collection(db, 'rooms', roomId, 'messages'))
        const batch = writeBatch(db)
        snapshot.docs.forEach(d => batch.delete(d.ref))
        await batch.commit()
    }

    const handleDeleteChat = async () => {
        setMenuAnchor(null)
        if (!window.confirm(`Delete "${roomName}" for everyone? This can't be undone.`)) return
        await deleteRoom(roomId)
        navigate('/')
    }

    const onEmojiClick = (emojiData) => {
        setInput(input+emojiData.emoji);
    }

    if (!roomId) {
        return (
            <div className="chatbar chatbar_empty">
                <p>Select a chat to start messaging</p>
            </div>
        )
    }

    const lastMessage = messages[messages.length - 1]
    const visibleMessages = searchTerm
        ? messages.filter(m => m.message?.toLowerCase().includes(searchTerm.toLowerCase()))
        : messages
    const othersTyping = Object.entries(typingUsers).filter(([uid]) => uid !== user.uid).map(([, name]) => name)

    return (
        <div className="chatbar">
            <div className="chatbar_header">
                {searchOpen ? (
                    <>
                        <input
                            className="chatbar_search_input"
                            autoFocus
                            placeholder="Search in this chat"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <IconButton size="small" onClick={() => { setSearchOpen(false); setSearchTerm('') }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <InitialsAvatar name={roomName} isGroup={roomType !== 'direct'} />
                        <div className="chatbar_header_info">
                            <h3>{roomName}</h3>
                            <p>
                                {othersTyping.length > 0
                                    ? `${othersTyping.join(', ')} typing...`
                                    : lastMessage ? `Last seen ${formatFullTimestamp(lastMessage.timeStamp)}` : 'No messages yet'}
                            </p>
                        </div>
                        <div className="chat_header_right">
                            <IconButton size="small" onClick={() => setSearchOpen(true)}>
                                <SearchOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={attachImage}>
                                <AttachFileIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                                {roomType === 'group' && (
                                    <MenuItem onClick={() => { setMenuAnchor(null); setInfoOpen(true) }}>
                                        <ListItemIcon><InfoOutlinedIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>Group info</ListItemText>
                                    </MenuItem>
                                )}
                                <MenuItem onClick={clearChat}>
                                    <ListItemIcon><DeleteSweepIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText>Clear chat</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleDeleteChat}>
                                    <ListItemIcon><DeleteForeverIcon fontSize="small" /></ListItemIcon>
                                    <ListItemText>Delete chat</ListItemText>
                                </MenuItem>
                            </Menu>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileSelected}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </>
                )}
            </div>
            <div className="chatbar_body" ref={scrollRef} onScroll={handleScroll}>
                <div className="chatbar_messages">
                    {searchTerm && visibleMessages.length === 0 && (
                        <p className="chatbar_no_results">No messages match "{searchTerm}"</p>
                    )}
                    {visibleMessages.map((message) => {
                        const isOwn = message.name === user.displayName
                        return (
                            <p key={message.id} className={`chatbar_message ${isOwn && 'chatbar_reciever'}`}>
                                <span className="chatbar_body_name">{message.name}</span>
                                {isOwn && (
                                    <button type="button" className="chatbar_delete" onClick={() => deleteMessage(message.id)} aria-label="Delete message">
                                        <DeleteOutlineIcon fontSize="inherit" />
                                    </button>
                                )}
                                {message.imageUrl && <img className="chatbar_body_image" src={message.imageUrl} alt="attachment" />}
                                {message.message}
                                <span className="chatbar_body_timeStamp">{formatFullTimestamp(message.timeStamp)}</span>
                            </p>
                        )
                    })}
                    <div ref={bodyEndRef} />
                </div>
                {showJump && (
                    <button type="button" className="chatbar_jump" onClick={jumpToBottom} aria-label="Jump to latest messages">
                        <KeyboardArrowDownIcon fontSize="small" />
                    </button>
                )}
            </div>
            <div className="chatbar_footer">
                {
                    emojiShown &&
                    <span className='emoji-picker'><EmojiPicker onEmojiClick={onEmojiClick} defaultSkinTone={SkinTones.MEDIUM_DARK} theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT} /></span>
                }
                <IconButton size="small" onClick={() => setEmojiShown(!emojiShown)}>
                    <InsertEmoticonIcon />
                </IconButton>
                <form onSubmit={sendMessage}>
                    <input value={input} onChange={handleInputChange} placeholder="Type a message" type="text"/>
                    <IconButton type="submit" size="small" className="chatbar_send" disabled={!input.trim()}>
                        <SendIcon fontSize="small" />
                    </IconButton>
                </form>
            </div>
            <GroupInfoModal
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                roomId={roomId}
                roomName={roomName}
                memberNames={memberNames}
            />
        </div>
    )
}

export default ChatBar
