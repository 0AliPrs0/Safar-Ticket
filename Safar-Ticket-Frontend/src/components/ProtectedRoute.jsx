import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const auth = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setIsAuthorized(false);
                return;
            }
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                const refreshed = await refreshToken();
                setIsAuthorized(refreshed);
            } else {
                setIsAuthorized(true);
            }
        };
        auth();
    }, []);

    const refreshToken = async () => {
        const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshTokenValue) return false;
        try {
            const res = await api.post("/api/refresh-token/", {
                refresh: refreshTokenValue,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log("Refresh token failed:", error);
            return false;
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;