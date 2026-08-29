import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import db from '../config/firebase';

const AVATAR_COLORS = ['#1a6cf5', '#0ea5a2', '#f97316', '#a855f7', '#e11d48', '#0891b2', '#65a30d'];

export const deleteRoom = async (roomId) => {
    const messagesSnap = await getDocs(collection(db, 'rooms', roomId, 'messages'));
    const batch = writeBatch(db);
    messagesSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'rooms', roomId));
    await batch.commit();
};

export const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

export const stringToColor = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const formatMessageTime = (timeStamp) => {
    if (!timeStamp) return '';
    const date = timeStamp.toDate();
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

export const formatFullTimestamp = (timeStamp) =>
    timeStamp ? new Date(timeStamp.toDate()).toUTCString() : 'Sending...';
