import React from 'react'
import { assets } from '../assets /assets'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useContext } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'

const ResetPassword = () => {

    const { backendUrl } = useContext(AppContent)
    axios.defaults.withCredentials = true;

    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isEmailSent, setIsEmailSent] = useState('')
    const [otp, setOtp] = useState(0)
    const [isOtpSubmited, setIsOtpSubmited] = useState(false)

    const inputRefs = React.useRef([])

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    } //makes the otp input move to the next box when typing

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }//makes the otp input delete numbers in descending order
    
    
    // handle paste action and paste accordingly
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text')
        const pasteArray = paste.split('')
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char
            }
        })
    }
       
    //full explanation of the logic
    // const handlePaste = (e) => {

    //     // Get the text that the user pasted from their clipboard.
    //     // Example: if the user copies "123456", paste will be "123456".
    //     const paste = e.clipboardData.getData('text')
    
    //     // Convert the pasted text into an array of individual characters.
    //     // Example: "123456" becomes ["1", "2", "3", "4", "5", "6"].
    //     const pasteArray = paste.split('')
    
    //     // Loop through each character in the pasted OTP.
    //     // char = the current character
    //     // index = the position of that character
    //     pasteArray.forEach((char, index) => {
    
    //         // Check if an OTP input box exists at this index.
    //         // This prevents an error if there are fewer input boxes
    //         // than the number of characters that were pasted.
    //         if (inputRefs.current[index]) {
    
    //             // Put the current character into the matching input box.
    //             // Example:
    //             // index 0 → first input gets "1"
    //             // index 1 → second input gets "2"
    //             // index 2 → third input gets "3"
    //             inputRefs.current[index].value = char
    
    //         }
    
    //     })
    
    // }


    const onSubmitEmail = async (e) => {
        e.preventDefault()

        // Check if the email has a valid format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Invalid email address')
            return
        }
        try {
            console.log("BACKEND URL:", backendUrl)
            console.log(
                "FULL URL:",
                backendUrl + '/api/auth/send-reset-otp'
            )
            const { data } = await axios.post( backendUrl + '/api/auth/send-reset-otp', { email })
            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && setIsEmailSent(true)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onSubmitOtp = async (e)=>{
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value)
       setOtp(otpArray.join('')) //join all element in the array
       setIsOtpSubmited(true)
    }

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        try{
            
            const {data} = await axios.post(backendUrl + '/api/auth/reset-password', {email, otp, newPassword})
            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && navigate('/login')

        } catch(error){
          toast.error(error.message)
        }
    }


    return (
        <div className='flex items-center justify-center min-h-screen px-6 
          sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
            <img onClick={() => navigate('/')} src={assets.logo} alt=""
                className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
            />
            {/* enter email id */}

            {!isEmailSent &&
                <form onSubmit={onSubmitEmail}
                    className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                        Reset Password
                    </h1>
                    <p className='text-center mb-6 text-indigo-300'>
                        Enter your email address
                    </p>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.mail_icon} alt="" className='w-3 h-3' />

                        <input type="email" placeholder='Email Address'
                            className='bg-transparent outline-none text-white'
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500
                    to-indigo-900 text-white rounded-full mt-3'>
                        Submit
                    </button>
                </form>
            }

            {/* otp input form */}
            {/* whenever the otp is not submitted then only this form will be displayed */}

            {!isOtpSubmited && isEmailSent &&

                <form onSubmit={onSubmitOtp} 
                className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password OTP</h1>
                    <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email </p>
                    <div className='flex justify-between mb-8' onPaste={handlePaste}>
                        {/* this array here creates 6 input field */}
                        {Array(6).fill(0).map((_, index) => (
                            <input type="text" maxLength='1' key={index} required
                                className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                                ref={e => inputRefs.current[index] = e}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                    </div>
                    <button className='w-full py-2.5  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>
                        Submit
                    </button>
                </form>
            }


            {/* enter new password */}
            {/* Whenever otp is sent and email is sent we will display the third form */}
            {isOtpSubmited && isEmailSent &&

                <form onSubmit={onSubmitNewPassword}  
                    className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>
                        New Password
                    </h1>
                    <p className='text-center mb-6 text-indigo-300'>
                        Enter the new password below
                    </p>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.lock_icon} alt="" className='w-3 h-3' />

                        <input type="password" placeholder='Password'
                            className='bg-transparent outline-none text-white'
                            value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    </div>

                    <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500
                    to-indigo-900 text-white rounded-full mt-3'>
                        Submit
                    </button>
                </form>
            }
        </div>
    )
}

export default ResetPassword