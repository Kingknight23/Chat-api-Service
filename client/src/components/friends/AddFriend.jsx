import { useState } from "react";
import { sendFriendRequest } from "../../api/api.js";

const AddFriend = ({ onDone }) => {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const cleanUsername = username.trim().replace(/^@/, "");
        if (!cleanUsername) return;
        setLoading(true);
        setMessage("");
        try {
            await sendFriendRequest(cleanUsername);
            setMessage(`Friend request sent to @${cleanUsername}`);
            setUsername("");
            if (onDone) setTimeout(onDone, 500);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <input
                autoFocus
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                autoComplete="off"
            />
            {message && <p className="friend-message">{message}</p>}
            <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={onDone}>Cancel</button>
                <button className="primary-button" type="submit" disabled={loading || !username.trim()}>
                    {loading ? "Sending..." : "Enter"}
                </button>
            </div>
        </form>
    );
};

export default AddFriend;
