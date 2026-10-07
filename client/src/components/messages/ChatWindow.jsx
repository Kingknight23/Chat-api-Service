import {
    useEffect
} from "react";

import {
    useChat
} from "../../context/ChatContext.jsx";

import ChatHeader
    from "../layout/ChatHeader.jsx";

import MessageList
    from "./MessageList.jsx";

import MessageInput
    from "./MessageInput.jsx";

import TypingIndicator
    from "./TypingIndicator.jsx";

import { decryptPayload } from "../../utils/e2ee.js";

const ChatWindow = ({
    conversation
}) => {
    const {
        messages,
        subscribeToConversation,
        unsubscribeFromConversation,
        typingUsers,
        setMessages
    } = useChat();


    const activeConversation = conversation?.conversation || conversation;
    const conversationId =
        activeConversation?._id ||
        activeConversation?.id ||
        activeConversation?.conversationId;


    useEffect(() => {
        if (!conversationId) {
            return;
        }

        subscribeToConversation(
            conversationId
        );

        let cancelled = false;
        import("../../api/api.js").then(({ getMessages }) =>
            getMessages(conversationId).then(async (result) => {
                if (!cancelled) {
                    const loaded = result.messages || result || [];
                    const user = JSON.parse(localStorage.getItem("user") || "null");
                    const userId = String(user?.id || user?._id || user?.userId || "");
                    const hydrated = await Promise.all(loaded.map(async (item) => {
                        if (item.payload?.e2eeVersion !== 1) return item;
                        try {
                            return { ...item, payload: await decryptPayload(item.payload, userId) };
                        } catch (error) {
                            console.error("Unable to decrypt message history:", error);
                            return null;
                        }
                    }));
                    const usable = hydrated.filter(Boolean);
                    if (!cancelled) {
                        setMessages((previous) => {
                            const existing = previous[conversationId] || [];
                            const merged = [...existing, ...usable];
                            const unique = Array.from(new Map(merged.map((item) => [String(item.messageId || item._id || item.id || ""), item])).values());
                            return { ...previous, [conversationId]: unique };
                        });
                    }
                }
            }).catch((error) => console.error("Unable to load messages:", error))
        );

        return () => {
            cancelled = true;
            unsubscribeFromConversation(
                conversationId
            );
        };
    }, [
        conversationId
    ]);


    if (!conversation) {
        return (
            <section className="chat-window">

                <div className="chat-empty">

                    <div className="brand-mark">
                        ✦
                    </div>

                    <h2>
                        Welcome to ChatApp
                    </h2>

                    <p>
                        Select a conversation
                        to start messaging.
                    </p>

                </div>

            </section>
        );
    }


    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    return (
        <section className="chat-window">

            <ChatHeader
                conversation={
                    activeConversation
                }
            />


            <MessageList
                messages={
                    messages[
                        conversationId
                    ] || []
                }
                currentUserId={
                    currentUser?.id ||
                    currentUser?._id ||
                    currentUser?.userId
                }
                isGroup={activeConversation?.type === "GROUP"}
            />


            <TypingIndicator
                userId={
                    typingUsers[
                        conversationId
                    ]
                }
            />


            <MessageInput
                conversationId={
                    conversationId
                }
            />

        </section>
    );
};

export default ChatWindow;