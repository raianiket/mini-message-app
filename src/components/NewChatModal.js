import React, { useEffect, useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, ToggleButtonGroup, ToggleButton,
    List, ListItemButton, ListItemAvatar, ListItemText, Checkbox, Radio,
} from '@mui/material'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import db from '../config/firebase'
import { useStateValue } from '../context/StateProvider'
import InitialsAvatar from './InitialsAvatar'

function NewChatModal({ open, onClose, onCreated }) {
    const [{ user }] = useStateValue()
    const [chatType, setChatType] = useState('direct')
    const [groupName, setGroupName] = useState('')
    const [people, setPeople] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open) return
        setChatType('direct')
        setGroupName('')
        setSelected([])
        getDocs(collection(db, 'users')).then(snapshot => {
            setPeople(snapshot.docs
                .map(d => d.data())
                .filter(p => p.uid !== user.uid))
        })
    }, [open, user.uid])

    const toggleSelect = (person) => {
        if (chatType === 'direct') {
            setSelected([person])
        } else {
            setSelected(prev =>
                prev.some(p => p.uid === person.uid)
                    ? prev.filter(p => p.uid !== person.uid)
                    : [...prev, person]
            )
        }
    }

    const canCreate = chatType === 'direct'
        ? selected.length === 1
        : selected.length >= 1 && groupName.trim()

    const handleCreate = async () => {
        setLoading(true)
        const members = [user.uid, ...selected.map(p => p.uid)]
        const memberNames = { [user.uid]: user.displayName }
        selected.forEach(p => { memberNames[p.uid] = p.displayName })
        const name = chatType === 'direct' ? selected[0].displayName : groupName.trim()

        const roomRef = await addDoc(collection(db, 'rooms'), {
            name,
            type: chatType,
            members,
            memberNames,
            public: false,
        })
        setLoading(false)
        onCreated(roomRef.id)
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>New chat</DialogTitle>
            <DialogContent>
                <ToggleButtonGroup
                    value={chatType}
                    exclusive
                    onChange={(e, val) => { if (val) { setChatType(val); setSelected([]) } }}
                    size="small"
                    sx={{ mb: 2 }}
                    fullWidth
                >
                    <ToggleButton value="direct">Direct message</ToggleButton>
                    <ToggleButton value="group">Group</ToggleButton>
                </ToggleButtonGroup>

                {chatType === 'group' && (
                    <TextField
                        label="Group name"
                        fullWidth
                        size="small"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                )}

                {people.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        No one else has signed in yet, so there's no one to start a chat with.
                    </p>
                ) : (
                    <List dense sx={{ maxHeight: 280, overflowY: 'auto' }}>
                        {people.map(person => {
                            const isSelected = selected.some(p => p.uid === person.uid)
                            return (
                                <ListItemButton key={person.uid} onClick={() => toggleSelect(person)}>
                                    <ListItemAvatar><InitialsAvatar name={person.displayName} size={36} /></ListItemAvatar>
                                    <ListItemText primary={person.displayName} secondary={person.email} />
                                    {chatType === 'direct'
                                        ? <Radio checked={isSelected} />
                                        : <Checkbox checked={isSelected} />}
                                </ListItemButton>
                            )
                        })}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" disabled={!canCreate || loading} onClick={handleCreate}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default NewChatModal
