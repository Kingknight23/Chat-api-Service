const TypingIndicator = ({
    userId
}) => {
    if (!userId) {
        return null;
    }

    return (
        <div className="typing-indicator">
            <span />
            <span />
            <span />
        </div>
    );
};

export default TypingIndicator;