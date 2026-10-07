const BroadcastNotification = ({
    broadcast,
    onClose
}) => {
    if (!broadcast) {
        return null;
    }

    return (
        <div className="broadcast-notification">

            <strong>
                Announcement
            </strong>

            <p>
                {broadcast.message ||
                    broadcast.payload?.text ||
                    broadcast.content}
            </p>

            <button
                onClick={onClose}
            >
                ×
            </button>

        </div>
    );
};

export default BroadcastNotification;