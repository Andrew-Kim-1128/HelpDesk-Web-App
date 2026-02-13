import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// authentication helper file
const KEY = "jwt-authorization";
const PATH = { path: "/" };

// raw token from cookies
export function getToken() {
    return Cookies.get(KEY) || "";
}

// save token after login/registration
export function setToken(token) {
    Cookies.set(KEY, token, PATH);
}

// Clear token on logout
export function clearToken() {
    Cookies.remove(KEY, PATH);
}

// Decode token payload (sub, username, role)
export function getDecodedUser() {
    const token = getToken();
    if (!token) {
        return null;
    }

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
}
