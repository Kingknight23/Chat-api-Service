import {
    getToken,
    getUser,
    clearAuth
} from "./storage.js";

const isAuthenticated = () => {
    return Boolean(getToken());
};

const getCurrentUser = () => {
    return getUser();
};

const logout = () => {
    clearAuth();

    window.location.href = "/";
};

export {
    isAuthenticated,
    getCurrentUser,
    logout
};