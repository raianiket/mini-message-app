import React, { useEffect, useState } from 'react'
import './Sidebar.css'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import LogoutIcon from '@mui/icons-material/Logout'
import CheckIcon from '@mui/icons-material/Check'
import { Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import SidebarChat from './SidebarChat'
import NewChatModal from './NewChatModal'
import db, { auth } from '../config/firebase'
import { useStateValue } from '../context/StateProvider'
import { useTheme } from '../context/ThemeContext'

const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: LightModeIcon },
    { value: 'dark', label: 'Dark', icon: DarkModeIcon },
    { value: 'system', label: 'System default', icon: SettingsBrightnessIcon },
]

function Sidebar() {
    const [publicRooms, setPublicRooms] = useState([])
    const [memberRooms, setMemberRooms] = useState([])
    const [search, setSearch] = useState('')
    const [{ user }] = useStateValue()
    const { theme, setTheme } = useTheme()
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [newChatOpen, setNewChatOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const activeRoomId = location.pathname.startsWith('/rooms/') ? location.pathname.split('/rooms/')[1] : null

    useEffect(() => {
        const unsubPublic = onSnapshot(query(collection(db, 'rooms'), where('public', '==', true)), (snapshot) =>
            setPublicRooms(snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })))
        )
        const unsubMine = onSnapshot(query(collection(db, 'rooms'), where('members', 'array-contains', user.uid)), (snapshot) =>
            setMemberRooms(snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })))
        )
        return () => { unsubPublic(); unsubMine() }
    }, [user.uid])

    const rooms = [...publicRooms, ...memberRooms.filter(r => !publicRooms.some(p => p.id === r.id))]

    const filteredRooms = rooms.filter((room) =>
        room.data.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="sidebar">
            <div className="sidebar_header">
                <div className="sidebar_header_left">
                    <Avatar src={user?.photoURL} />
                    <span className="sidebar_brand">ChatBox</span>
                </div>
                <div className="sidebar_header_right">
                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                            <MenuItem key={value} selected={theme === value} onClick={() => { setTheme(value); setMenuAnchor(null) }}>
                                <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                                <ListItemText>{label}</ListItemText>
                                {theme === value && <CheckIcon fontSize="small" color="primary" />}
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem onClick={() => { setMenuAnchor(null); signOut(auth) }}>
                            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Log out</ListItemText>
                        </MenuItem>
                    </Menu>
                </div>
            </div>
            <div className="sidebar_search">
                <div className="sidebar_search_container">
                    <SearchOutlinedIcon fontSize="small" />
                    <input
                        type="text"
                        placeholder="Search or start a new chat"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="sidebar_chat">
                <SidebarChat addNewChat onAddNewChat={() => setNewChatOpen(true)} />
                {filteredRooms.length === 0 && search && (
                    <p className="sidebar_no_results">No chats match "{search}"</p>
                )}
                {filteredRooms.map(room => (
                    <SidebarChat
                        key={room.id}
                        id={room.id}
                        name={room.data.name}
                        isGroup={room.data.type !== 'direct'}
                        active={room.id === activeRoomId}
                    />
                ))}

            </div>
            <NewChatModal
                open={newChatOpen}
                onClose={() => setNewChatOpen(false)}
                onCreated={(roomId) => { setNewChatOpen(false); navigate(`/rooms/${roomId}`) }}
            />
        </div>
    )
}

export default Sidebar
