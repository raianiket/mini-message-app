import React, { useEffect, useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Checkbox, Divider,
} from '@mui/material'
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import db from '../config/firebase'
import InitialsAvatar from './InitialsAvatar'

function GroupInfoModal({ open, onClose, roomId, roomName, memberNames = {} }) {
    const [adding, setAdding] = useState(false)
    const [people, setPeople] = useState([])
    const [selected, setSelected] = useState([])

    useEffect(() => {
        if (!open) { setAdding(false); setSelected([]) }
    }, [open])

    const startAdding = () => {
        getDocs(collection(db, 'users')).then(snapshot => {
            setPeople(snapshot.docs.map(d => d.data()).filter(p => !memberNames[p.uid]))
        })
        setAdding(true)
    }

    const toggleSelect = (person) => {
        setSelected(prev =>
            prev.some(p => p.uid === person.uid)
                ? prev.filter(p => p.uid !== person.uid)
                : [...prev, person]
        )
    }

    const confirmAdd = async () => {
        if (selected.length === 0) return
        const updates = {}
        selected.forEach(p => { updates[`memberNames.${p.uid}`] = p.displayName })
        await updateDoc(doc(db, 'rooms', roomId), {
            members: arrayUnion(...selected.map(p => p.uid)),
            ...updates,
        })
        setAdding(false)
        setSelected([])
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{roomName}</DialogTitle>
            <DialogContent>
                {!adding ? (
                    <>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>
                            {Object.keys(memberNames).length} member{Object.keys(memberNames).length !== 1 ? 's' : ''}
                        </p>
                        {Object.keys(memberNames).length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
                                This room predates membership tracking, so no one is formally listed here.
                                It's still open to everyone. Add people below to start tracking members.
                            </p>
                        )}
                        <List dense>
                            {Object.entries(memberNames).map(([uid, name]) => (
                                <ListItem key={uid}>
                                    <ListItemAvatar><InitialsAvatar name={name} size={36} /></ListItemAvatar>
                                    <ListItemText primary={name} />
                                </ListItem>
                            ))}
                        </List>
                    </>
                ) : (
                    <>
                        <p style={{ fontSize: 13, marginBottom: 8 }}>Add people</p>
                        {people.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No one else available to add.</p>
                        ) : (
                            <List dense sx={{ maxHeight: 280, overflowY: 'auto' }}>
                                {people.map(person => (
                                    <ListItemButton key={person.uid} onClick={() => toggleSelect(person)}>
                                        <ListItemAvatar><InitialsAvatar name={person.displayName} size={36} /></ListItemAvatar>
                                        <ListItemText primary={person.displayName} secondary={person.email} />
                                        <Checkbox checked={selected.some(p => p.uid === person.uid)} />
                                    </ListItemButton>
                                ))}
                            </List>
                        )}
                    </>
                )}
            </DialogContent>
            <Divider />
            <DialogActions>
                {!adding ? (
                    <>
                        <Button onClick={onClose}>Close</Button>
                        <Button variant="contained" onClick={startAdding}>Add people</Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setAdding(false)}>Back</Button>
                        <Button variant="contained" disabled={selected.length === 0} onClick={confirmAdd}>Add</Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default GroupInfoModal
