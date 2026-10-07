const getToken = () => {
    return localStorage.getItem("token");
};

const setToken = (token) => {
    localStorage.setItem("token", token);
};

const removeToken = () => {
    localStorage.removeItem("token");
};

const getUser = () => {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
};

const setUser = (user) => {
    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
};

const removeUser = () => {
    localStorage.removeItem("user");
};

const clearAuth = () => {
    removeToken();
    removeUser();
};

export {
    getToken,
    setToken,
    removeToken,
    getUser,
    setUser,
    removeUser,
    clearAuth
};