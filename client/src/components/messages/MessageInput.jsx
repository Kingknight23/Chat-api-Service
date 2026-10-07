import {
    useState
} from "react";

import {
    useChat
} from "../../context/ChatContext.jsx";

const MessageInput = ({
    conversationId
}) => {
    const [
        text,
        setText
    ] = useState("");

    const {
        sendMessage,
        startTyping,
        stopTyping
    } = useChat();


    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (!conversationId || !text.trim()) {
            return;
        }

        try {
            await sendMessage(
                conversationId,
                text
            );
            setText("");
        } catch (error) {
            console.error("Unable to send encrypted message:", error);
            return;
        }

        stopTyping(
            conversationId
        );
    };


    const handleChange = (
        event
    ) => {
        const value =
            event.target.value;

        setText(value);

        if (!conversationId) {
            return;
        }

        if (value.trim()) {
            startTyping(
                conversationId
            );
        } else {
            stopTyping(
                conversationId
            );
        }
    };


    return (
        <form
            className="message-form"
            onSubmit={handleSubmit}
        >

            <input
                value={text}
                onChange={handleChange}
                placeholder="Type a message..."
            />

            <button
                className="primary-button"
                type="submit"
            >
                Send
            </button>

        </form>
    );
};

export default MessageInput;