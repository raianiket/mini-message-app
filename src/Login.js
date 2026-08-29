import React from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from './firebase'
import './Login.css'
import { actionTypes } from './reducer'
import { useStateValue } from './StateProvider'

function Login() {
    const [, dispatch] = useStateValue()

    const signIn = () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            dispatch({
                type: actionTypes.SET_USER,
                user: result.user,
            })
        })
        .catch((error) => alert(error.message))
    }
    return (
        <div className='login'>
            <div className='login_container'>
                <div className='login_logo'>💬</div>
                <div className='login_text'>
                    <h1>Sign in to Chatapp</h1>

                </div>
                <button type='submit' onClick={signIn}>
                    Sign In With Google!
                </button>
            </div>
        </div>
    )
}

export default Login
