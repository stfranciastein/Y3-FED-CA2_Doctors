import { 
    createContext, 
    useContext, 
    useState, 
    useEffect 
} from "react";

import axios from "@/config/api.js";

// Create the AuthContext to store authentication state
// Children is a prop that represents nested components that will have access to this context.
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        if(localStorage.getItem('token')){
            return localStorage.getItem('token');
        }
        else {
            return null;
        }
    });

    const onLogin = async (email, password) => {
        try {
            let response = await axios.post('/login', {
                email: email,
                password: password,
            });
            console.log(response.data);
            localStorage.setItem("token", response.data.token);
            // Store user data
            localStorage.setItem('user', JSON.stringify({
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                email: response.data.email
            }));
            setToken(response.data.token);
        } catch (err) {
            console.error('Login error:', err);
            console.error('Login error response:', err.response?.data);
            throw err; // Re-throw so the form can handle it
        }
    };

    const onLogout = () => {
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const value = {
        token,
        onLogin,
        onLogout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};