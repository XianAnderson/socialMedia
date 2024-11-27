import React from 'react'
import phone from '../assets/peerImage.png'
import {LoginCard} from '../components/login/LoginCard'

export function Login() {
    return (
        <div className='home lg-sg'>
            <div className="login-left">
                <div className="phone">
                    <img className='' style={{ width: '453px' }} src={phone} alt="" />
                </div>
            </div>
            <LoginCard/>
            <span style={{position:'absolute',bottom:'15px',fontSize:'14px',color:'gray'}}>© 2024 Pear To Peer</span>
        </div>
    )
}
