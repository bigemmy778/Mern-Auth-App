import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export const AppContent = createContext()


// An interceptor runs automatically before EVERY request leaves the frontend.
axios.interceptors.request.use((config) => {

    // Read the saved token from the browser's storage.
    const token = localStorage.getItem('token');

    // If there is a token, attach it to the request as a Bearer header.
    // Our backend middleware (userAuth) looks for exactly this header.
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Send the request on its way.
    return config;
});

export const AppContextProvider = (props) => {
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    axios.defaults.withCredentials = true;
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(false)

    const getAuthState = async () => {
        try {
           // api call to the backend
           const { data } = await axios.get(
            backendUrl + '/api/user/data',
            {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            }
        )
            if (data.success) {
                setIsLoggedin(true)
                getUserData()
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    //creating a function that will get the user data
    const getUserData = async () => {
        try {
    
            const { data } = await axios.get(
                backendUrl + '/api/user/data'
            );
    
            console.log("========== USER DATA ==========");
            console.log("USER DATA RESPONSE:", data);
            console.log("USER DATA:", data.userData);
            console.log("================================");
    
            if (data.success) {
    
                setUserData(data.userData);
    
            } else {
    
                console.log("USER DATA ERROR:", data.message);
    
                toast.error(data.message);
            }
    
        } catch (error) {
    
            console.log("GET USER DATA ERROR:", error);
    
            toast.error(
                error.response?.data?.message ||
                error.message
            );
        }
    }

    useEffect(() => {
        getAuthState()
    }, [])

    const value = {
        backendUrl,
        isLoggedin, 
        setIsLoggedin,
        userData,
        setUserData,
        getUserData

    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
} 