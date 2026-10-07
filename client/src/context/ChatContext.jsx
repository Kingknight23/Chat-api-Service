import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getConversations,
    getFriendRequests,
    getBroadcasts,
    getConversationKeys,
    uploadPublicKey,
    invalidateCache
} from "../api/api.js";

import {
    ensureIdentityKey,
    getIdentityPublicKey,
    encryptForRecipients,
    decryptPayload
} from "../utils/e2ee.js";

import { getUser } from "../utils/storage.js";

import websocketManager
    from "../websocket/websocket.js";

import WS_EVENTS
    from "../websocket/websocket.events.js";

const ChatContext =
    createContext(null);

const getConversationId = (value) => {
    const conversation = value?.conversation || value;
    return String(
        conversation?._id ||
        conversation?.id ||
        conversation?.conversationId ||
        ""
    );
};

const getMessageId = (message) =>
    String(message?.messageId || message?._id || message?.id || "");

const getRequestId = (request) =>
    String(request?.requestId || request?._id || request?.id || "");

const normalizeConversation = (value) => {
    const source = value?.conversation || value;
    const id = getConversationId(source);
    if (!id) return null;
    return {
        ...(value?.conversation ? value : {}),
        conversation: {
            ...source,
            _id: source?._id || source?.id || source?.conversationId || id
        }
    };
};

const ChatProvider = ({
    children
}) => {
    const [
        connectionStatus,
        setConnectionStatus
    ] = useState("disconnected");

    const [
        conversations,
        setConversations
    ] = useState([]);

    const [
        friendRequests,
        setFriendRequests
    ] = useState([]);

    const [
        broadcasts,
        setBroadcasts
    ] = useState([]);

    const [
        messages,
        setMessages
    ] = useState({});

    const [
        typingUsers,
        setTypingUsers
    ] = useState({});


    const loadInitialData = async () => {
        try {
            const [
                conversationResult,
                friendResult,
                broadcastResult
            ] = await Promise.all([
                getConversations(),
                getFriendRequests(),
                getBroadcasts()
            ]);

            setConversations(
                conversationResult.conversations ||
                conversationResult ||
                []
            );

            setFriendRequests(
                friendResult.requests ||
                friendResult ||
                []
            );

            setBroadcasts(
                broadcastResult.broadcasts ||
                broadcastResult ||
                []
            );
        } catch (error) {
            console.error(
                "Unable to load chat data:",
                error
            );
        }
    };


    useEffect(() => {
        const token =
            localStorage.getItem(
                "token"
            );

        if (!token) {
            return;
        }

        const initializeE2EE = async () => {
            try {
                const user = getUser();
                const userId = user?.id || user?._id || user?.userId;
                if (!userId) return;
                await ensureIdentityKey(String(userId));
                await uploadPublicKey(await getIdentityPublicKey(String(userId)));
            } catch (error) {
                console.error("Unable to initialize end-to-end encryption:", error);
            }
        };

        initializeE2EE();

        websocketManager.connect(
            token
        );

        loadInitialData();


        const cleanupConnection =
            websocketManager.on(
                "connection.status",
                setConnectionStatus
            );


        const cleanupMessage =
            websocketManager.on(
                WS_EVENTS.MESSAGE_CREATED,
                async (message) => {
                    const conversationId = message?.conversationId;
                    if (!conversationId) return;

                    const user = getUser();
                    const userId = String(user?.id || user?._id || user?.userId || "");
                    let hydrated = message;

                    try {
                        if (message.payload?.e2eeVersion === 1) {
                            hydrated = {
                                ...message,
                                payload: await decryptPayload(message.payload, userId)
                            };
                        }
                    } catch (error) {
                        console.error("Unable to decrypt incoming message:", error);
                        return;
                    }

                    invalidateCache(`/api/conversations/${conversationId}/messages`);
                    invalidateCache("/api/conversations");
                    setMessages((previous) => {
                        const existing = previous[conversationId] || [];
                        const messageId = getMessageId(hydrated);
                        if (messageId && existing.some((item) => getMessageId(item) === messageId)) {
                            return previous;
                        }
                        return {
                            ...previous,
                            [conversationId]: [...existing, hydrated]
                        };
                    });
                }
            );


        // const cleanupFriendRequest =
        //     websocketManager.on(
        //         WS_EVENTS.FRIEND_REQUEST_RECEIVED,
        //         (request) => {
        //             setFriendRequests(
        //                 (previous) => [
        //                     request,
        //                     ...previous
        //                 ]
        //             );
        //         }
        //     );
        const cleanupFriendRequest =
            websocketManager.on(
                WS_EVENTS.FRIEND_REQUEST_RECEIVED,
                (event) => {
                    console.log(
                        "Friend request received:",
                        event
                    );

                    const request =
                        event?.data || event;

                    if (!request?.requestId) {
                        console.error(
                            "Friend request is missing requestId:",
                            request
                        );

                        return;
                    }

                    invalidateCache("/api/friends/requests");
                    setFriendRequests((previous) => {
                        const id = getRequestId(request);
                        if (!id || previous.some((item) => getRequestId(item) === id)) {
                            return previous;
                        }
                        return [request, ...previous];
                    });
                }
            );


        const cleanupFriendAccepted =
            websocketManager.on(
                WS_EVENTS.FRIEND_REQUEST_ACCEPTED,
                () => {
                    invalidateCache("/api/friends/requests");
                    invalidateCache("/api/conversations");
                    loadInitialData();
                }
            );


        const cleanupGroup =
            websocketManager.on(
                WS_EVENTS.GROUP_CREATED,
                (event) => {
                    const data = event?.conversation || event?.data || event;
                    const id = getConversationId(data);
                    if (!id) return;

                    invalidateCache("/api/conversations");
                    invalidateCache("/api/keys");
                    const normalized = normalizeConversation(data);
                    setConversations((previous) => {
                        if (previous.some((item) => getConversationId(item) === id)) {
                            return previous;
                        }
                        return [normalized, ...previous];
                    });
                }
            );


        const cleanupGroupUpdated = websocketManager.on(
            "group.updated",
            (event) => {
                const data = event?.conversation || event?.data?.conversation || event?.data || event;
                const id = data?._id || data?.conversationId;
                if (!id) return;
                invalidateCache("/api/conversations");
                setConversations((previous) => previous.map((item) => {
                    const itemId = item?._id || item?.conversation?._id || item?.conversationId;
                    return String(itemId) === String(id) ? { ...(data._id ? data : { conversation: data }) } : item;
                }));
            }
        );

        const cleanupGroupDeleted = websocketManager.on(
            "group.deleted",
            (event) => {
                const id = event?.conversationId || event?.data?.conversationId;
                if (!id) return;
                invalidateCache("/api/conversations");
                setConversations((previous) => previous.filter((item) => String(item?._id || item?.conversation?._id || item?.conversationId) !== String(id)));
            }
        );

        const cleanupGroupMemberAdded = websocketManager.on(
            WS_EVENTS.GROUP_MEMBER_ADDED,
            (event) => {
                invalidateCache("/api/conversations");
                invalidateCache("/api/keys");
                const conversationId = event?.conversationId || event?.data?.conversationId;
                if (conversationId) invalidateCache(`/api/keys/conversation/${conversationId}`);
            }
        );


        const cleanupTypingStart =
            websocketManager.on(
                WS_EVENTS.TYPING_START,
                (data) => {
                    if (!data?.conversationId) {
                        return;
                    }

                    setTypingUsers(
                        (previous) => ({
                            ...previous,

                            [data.conversationId]:
                                data.userId
                        })
                    );
                }
            );


        const cleanupTypingStop =
            websocketManager.on(
                WS_EVENTS.TYPING_STOP,
                (data) => {
                    if (!data?.conversationId) {
                        return;
                    }

                    setTypingUsers(
                        (previous) => {
                            const next = {
                                ...previous
                            };

                            delete next[
                                data.conversationId
                            ];

                            return next;
                        }
                    );
                }
            );


        const cleanupBroadcast =
            websocketManager.on(
                WS_EVENTS.ADMIN_BROADCAST,
                (broadcast) => {
                    setBroadcasts(
                        (previous) => [
                            broadcast,
                            ...previous
                        ]
                    );
                }
            );


        return () => {
            cleanupConnection();
            cleanupMessage();
            cleanupFriendRequest();
            cleanupFriendAccepted();
            cleanupGroup();
            cleanupGroupUpdated();
            cleanupGroupDeleted();
            cleanupGroupMemberAdded();
            cleanupTypingStart();
            cleanupTypingStop();
            cleanupBroadcast();

            websocketManager.disconnect();
        };
    }, []);


    const sendMessage = async (
        conversationId,
        text
    ) => {
        const user = getUser();
        const userId = String(user?.id || user?._id || user?.userId || "");
        if (!conversationId || !userId) return false;

        const identity = await ensureIdentityKey(userId);
        await uploadPublicKey(identity.publicKey);
        const { keys } = await getConversationKeys(conversationId);
        const encryptedPayload = await encryptForRecipients(
            { text },
            keys
        );

        return websocketManager.send(
            WS_EVENTS.MESSAGE_SEND,
            {
                conversationId,
                messageType: "TEXT",
                payloadType: "text",
                payload: encryptedPayload
            }
        );
    };


    const subscribeToConversation = (
        conversationId
    ) => {
        websocketManager.subscribe(
            conversationId
        );
    };


    const unsubscribeFromConversation = (
        conversationId
    ) => {
        websocketManager.unsubscribe(
            conversationId
        );
    };


    const startTyping = (
        conversationId
    ) => {
        websocketManager.startTyping(
            conversationId
        );
    };


    const stopTyping = (
        conversationId
    ) => {
        websocketManager.stopTyping(
            conversationId
        );
    };


    const logout = () => {
        websocketManager.disconnect();

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.reload();
    };


    return (
        <ChatContext.Provider
            value={{
                connectionStatus,

                conversations,
                setConversations,

                friendRequests,
                setFriendRequests,

                broadcasts,
                setBroadcasts,

                messages,
                setMessages,

                typingUsers,

                sendMessage,

                subscribeToConversation,
                unsubscribeFromConversation,

                startTyping,
                stopTyping,

                loadInitialData,

                logout
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};


const useChat = () => {
    const context =
        useContext(ChatContext);

    if (!context) {
        throw new Error(
            "useChat must be used inside ChatProvider"
        );
    }

    return context;
};


export {
    ChatProvider,
    useChat
};