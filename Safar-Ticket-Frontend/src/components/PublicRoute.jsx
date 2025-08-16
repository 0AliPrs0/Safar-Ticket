import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";

function PublicRoute({ children }) {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (token) {
        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration > now && decoded.user_type === 'CUSTOMER') {
                return <Navigate to="/" />;
            }
        } catch (error) {
            return children;
        }
    }

    return children;
}

export default PublicRoute;