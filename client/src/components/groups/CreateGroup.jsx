import { useState } from "react";
import { createGroup, searchFriends } from "../../api/api.js";

const CreateGroup = ({ onCreated, onCancel }) => {
    const [name, setName] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);

    const search = async (value) => {
        setQuery(value);
        if (!value.trim()) return setResults([]);
        try {
            const response = await searchFriends(value);
            setResults(response.friends || []);
        } catch (error) {
            setMessage(error.message);
        }
    };

    const toggleFriend = (friend) => {
        setSelected((previous) => previous.some((item) => item.userId === friend.userId)
            ? previous.filter((item) => item.userId !== friend.userId)
            : [...previous, friend]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (selected.length < 2) {
            setMessage("Choose at least 2 friends. You are automatically included.");
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const result = await createGroup(name, selected.map((friend) => friend.userId), profilePicture);
            onCreated(result);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <label className="file-button secondary-button">Optional group picture<input type="file" accept="image/*" hidden onChange={(e)=>{const file=e.target.files?.[0]; if(file&&file.size<=1800000){const reader=new FileReader();reader.onload=()=>setProfilePicture(String(reader.result));reader.readAsDataURL(file);}}} /></label>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" required />
            <input value={query} onChange={(e) => search(e.target.value)} placeholder="Search friends to add..." />
            {selected.length > 0 && (
                <div className="selected-friends">
                    {selected.map((friend) => (
                        <button type="button" key={friend.userId} onClick={() => toggleFriend(friend)}>@{friend.username} ×</button>
                    ))}
                </div>
            )}
            <div className="friend-search-results compact">
                {results.map((friend) => {
                    const active = selected.some((item) => item.userId === friend.userId);
                    return (
                        <button type="button" className={`friend-search-result ${active ? "selected" : ""}`} key={friend.userId} onClick={() => toggleFriend(friend)}>
                            <span className="friend-avatar">{friend.username.charAt(0).toUpperCase()}</span>
                            <strong>@{friend.username}</strong>
                            <span>{active ? "✓" : "Add"}</span>
                        </button>
                    );
                })}
            </div>
            {message && <p className="friend-message error">{message}</p>}
            <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
                <button className="primary-button" disabled={loading || !name.trim() || selected.length < 2}>
                    {loading ? "Creating..." : "Create Group"}
                </button>
            </div>
        </form>
    );
};

export default CreateGroup;
