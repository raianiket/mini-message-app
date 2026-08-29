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
import { collection, getDocs, writeBatch, updateDoc, onSnapshot, query, where } from 'firebase/firestore'
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

const MIGRATION_FLAG = 'chatbox-legacy-rooms-migrated-v1'
const MEMBER_MIGRATION_FLAG = 'chatbox-legacy-members-migrated-v1'

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

    // One-time migration: legacy 2020 rooms have no `members`/`type` field.
    // Mark them public so they stay visible once membership rules apply.
    useEffect(() => {
        if (localStorage.getItem(MIGRATION_FLAG)) return
        getDocs(collection(db, 'rooms')).then(async (snapshot) => {
            const legacy = snapshot.docs.filter(d => !('members' in d.data()))
            if (legacy.length > 0) {
                const batch = writeBatch(db)
                legacy.forEach(d => batch.update(d.ref, { public: true, type: 'group' }))
                await batch.commit()
            }
            localStorage.setItem(MIGRATION_FLAG, '1')
        }).catch((err) => console.error('legacy room migration failed', err))
    }, [])

    // One-time backfill: derive a display-only member roster for legacy rooms
    // from who actually sent messages in them. Keyed by name (no real UID
    // exists for these historical senders), so this never touches the real
    // `members` array used for access control.
    useEffect(() => {
        if (localStorage.getItem(MEMBER_MIGRATION_FLAG)) return
        (async () => {
            const snapshot = await getDocs(query(collection(db, 'rooms'), where('public', '==', true)))
            const legacy = snapshot.docs.filter(d => !d.data().memberNames)
            for (const roomDoc of legacy) {
                const messagesSnap = await getDocs(collection(db, 'rooms', roomDoc.id, 'messages'))
                const names = new Set()
                messagesSnap.docs.forEach(m => { const n = m.data().name; if (n) names.add(n) })
                if (names.size > 0) {
                    const memberNames = {}
                    names.forEach(n => { memberNames[n] = n })
                    await updateDoc(roomDoc.ref, { memberNames })
                }
            }
            localStorage.setItem(MEMBER_MIGRATION_FLAG, '1')
        })().catch((err) => console.error('legacy member migration failed', err))
    }, [])

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
