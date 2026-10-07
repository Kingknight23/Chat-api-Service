const MessageStatus = ({
    status
}) => {
    if (status === "READ") {
        return (
            <span className="message-status read">
                ✓✓
            </span>
        );
    }

    if (status === "DELIVERED") {
        return (
            <span className="message-status">
                ✓✓
            </span>
        );
    }

    if (status === "SENT") {
        return (
            <span className="message-status">
                ✓
            </span>
        );
    }

    return null;
};

export default MessageStatus;