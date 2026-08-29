import React from 'react'
import { Avatar } from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import { getInitials, stringToColor } from '../utils'

function InitialsAvatar({ name, size = 40, isGroup = false }) {
    return (
        <Avatar
            sx={{
                bgcolor: stringToColor(name || ''),
                width: size,
                height: size,
                fontSize: size * 0.4,
                fontWeight: 600,
            }}
        >
            {isGroup ? <GroupsIcon fontSize={size <= 32 ? 'small' : 'medium'} /> : getInitials(name)}
        </Avatar>
    )
}

export default InitialsAvatar
