const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

// Short-lived in-memory read cache. Entries live for 10 minutes unless
// server/WebSocket activity invalidates them first. This keeps navigation
// and message history fast without allowing stale data to survive a server update.
const CACHE_TTL_MS = 10 * 60 * 1000;
const readCache = new Map();

const isGet = (options = {}) =>
    String(options.method || "GET").toUpperCase() === "GET";

const cacheKey = (endpoint) => endpoint;

const invalidateCache = (prefix = "") => {
    for (const key of readCache.keys()) {
        if (!prefix || key.startsWith(prefix)) {
            readCache.delete(key);
        }
    }
};

const request = async (endpoint, options = {}) => {
    const useCache = isGet(options);
    const key = cacheKey(endpoint);

    if (useCache) {
        const cached = readCache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
        if (cached) {
            readCache.delete(key);
        }
    }
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token
                    ? {
                        Authorization: `Bearer ${token}`
                    }
                    : {}),
                ...(options.headers || {})
            }
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message || "Request failed"
        );
    }

    if (useCache) {
        readCache.set(key, {
            data,
            expiresAt: Date.now() + CACHE_TTL_MS
        });
    }

    return data;
};


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

const register = async (
    username,
    email,
    password
) => {
    const result = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
            username,
            email,
            password
        })
    });
    invalidateCache();
    return result;
};


const login = async (
    email,
    password
) => {
    invalidateCache();
    return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
};



const getConversationKeys = (conversationId) => {
    return request(
        `/api/keys/conversation/${conversationId}`
    );
};

const uploadPublicKey = async (publicKey) => {
    const result = await request("/api/keys/public", {
        method: "PUT",
        body: JSON.stringify({ publicKey, algorithm: "RSA-OAEP-SHA256" })
    });
    invalidateCache("/api/keys");
    return result;
};

/*
|--------------------------------------------------------------------------
| Conversations
|--------------------------------------------------------------------------
*/

const getConversations = () => {
    return request("/api/conversations");
};


const getConversation = (
    conversationId
) => {
    return request(
        `/api/conversations/${conversationId}`
    );
};


const getMessages = (
    conversationId
) => {
    return request(
        `/api/conversations/${conversationId}/messages`
    );
};


/*
|--------------------------------------------------------------------------
| Friends
|--------------------------------------------------------------------------
*/

// const sendFriendRequest = (
//     userId
// ) => {
//     return request(
//         `/api/friends/${userId}`,
//         {
//             method: "POST"
//         }
//     );
// };

const sendFriendRequest = async (username) => {
    const result = await request(
        `/api/friends/username/${encodeURIComponent(username)}`,
        { method: "POST" }
    );
    invalidateCache("/api/friends/requests");
    return result;
};


const getFriendRequests = () => {
    return request(
        "/api/friends/requests/incoming"
    );
};


const acceptFriendRequest = async (requestId) => {
    const result = await request(
        `/api/friends/requests/${requestId}/accept`,
        { method: "POST" }
    );
    invalidateCache("/api/friends/requests");
    invalidateCache("/api/friends/search");
    invalidateCache("/api/conversations");
    return result;
};


const rejectFriendRequest = async (requestId) => {
    const result = await request(
        `/api/friends/requests/${requestId}/reject`,
        { method: "POST" }
    );
    invalidateCache("/api/friends/requests");
    return result;
};

const searchFriends = (username = "") => {
    return request(
        `/api/friends/search?username=${encodeURIComponent(username)}`
    );
};

const openDirectConversation = async (userId) => {
    const result = await request("/api/conversations/direct", {
        method: "POST",
        body: JSON.stringify({ userId })
    });
    invalidateCache("/api/conversations");
    return result;
};


/*
|--------------------------------------------------------------------------
| Groups
|--------------------------------------------------------------------------
*/

const createGroup = async (name, userIds, profilePicture = null) => {
    const result = await request("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name, userIds, profilePicture })
    });
    invalidateCache("/api/conversations");
    return result;
};


const addGroupMember = async (conversationId, userId) => {
    const result = await request(`/api/groups/${conversationId}/members`, { method: "POST", body: JSON.stringify({ userId }) });
    invalidateCache("/api/conversations");
    invalidateCache(`/api/conversations/${conversationId}`);
    return result;
};


/*
|--------------------------------------------------------------------------
| Broadcasts
|--------------------------------------------------------------------------
*/

const getProfile = () => request("/api/users/me");
const updateProfile = async (body) => {
    const result = await request("/api/users/me", { method: "PATCH", body: JSON.stringify(body) });
    invalidateCache("/api/users/me");
    invalidateCache("/api/conversations");
    return result;
};

const updateGroup = async (conversationId, body) => {
    const result = await request(`/api/groups/${conversationId}`, { method: "PATCH", body: JSON.stringify(body) });
    invalidateCache("/api/conversations");
    return result;
};
const deleteGroup = async (conversationId) => {
    const result = await request(`/api/groups/${conversationId}`, { method: "DELETE" });
    invalidateCache("/api/conversations");
    invalidateCache(`/api/conversations/${conversationId}`);
    return result;
};
const removeGroupMember = async (conversationId, userId) => { const r = await request(`/api/groups/${conversationId}/members/${userId}`, { method: "DELETE" }); invalidateCache("/api/conversations"); return r; };
const makeGroupAdmin = async (conversationId, userId) => { const r = await request(`/api/groups/${conversationId}/members/${userId}/admin`, { method: "PATCH" }); invalidateCache("/api/conversations"); return r; };

const getBroadcasts = () => {
    return request(
        "/api/broadcasts"
    );
};


export {
    request,
    invalidateCache,

    register,
    login,

    getConversations,
    getConversation,
    getMessages,
    getConversationKeys,
    uploadPublicKey,

    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    searchFriends,

    openDirectConversation,

    createGroup,
    addGroupMember,
    updateGroup,
    deleteGroup,
    removeGroupMember,
    makeGroupAdmin,

    getProfile,
    updateProfile,

    getBroadcasts
};