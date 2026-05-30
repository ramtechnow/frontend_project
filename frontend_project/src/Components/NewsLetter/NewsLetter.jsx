import React from 'react'
import './NewsLetter.css'

export const NewsLetter = () => {
  return (
    <div className='newsletter'>
        <h1>Get Exculsive Offers On Your Email</h1>
        <p>Subcribe to our newletter and stay updated</p>
        <div>
        <input type="email" placeholder='Your Email id'/>
        <button>Subcribe</button>
        </div>
    </div>
  )
}
