import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children, isAdmin = false }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const loginPath = isAdmin ? "/admin/login" : "/login";

    useEffect(() => {
        const auth = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setIsAuthorized(false);
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const tokenExpiration = decoded.exp;
                const now = Date.now() / 1000;

                const userType = decoded.user_type;
                const requiredType = isAdmin ? 'ADMIN' : 'CUSTOMER';

                if (userType !== requiredType) {
                    setIsAuthorized(false);
                    return;
                }

                if (tokenExpiration < now) {
                    localStorage.removeItem(ACCESS_TOKEN);
                    localStorage.removeItem(REFRESH_TOKEN);
                    setIsAuthorized(false);
                } else {
                    setIsAuthorized(true);
                }
            } catch (error) {
                setIsAuthorized(false);
            }
        };
        auth();
    }, []);

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to={loginPath} />;
}

export default ProtectedRoute;