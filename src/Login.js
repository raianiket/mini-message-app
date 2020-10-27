import React from 'react'
import { auth, provider } from './firebase'
import './Login.css'
import { actionTypes } from './reducer'
import { useStateValue } from './StateProvider'

function Login() {
    const [{},dispatch] = useStateValue()

    const signIn = () => {
        auth.signInWithPopup(provider)
        .then((result) => {
            //console.log(result)
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
                <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ-ZKkX3b9yrTeCDCaF9rc1fmWsoXSk0rMEqg&usqp=CAU' alt='blank'/>
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
