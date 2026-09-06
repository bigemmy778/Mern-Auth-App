import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { EmailVerify } from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Login from './pages/Login'

function App() {
  return (
    <div className=''>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>

      </Routes>
    </div>
  )
}

export default App