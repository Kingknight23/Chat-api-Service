import { useEffect, useRef, useState } from "react";
import ConversationList from "../conversations/ConversationList.jsx";
import FriendRequests from "../friends/FriendRequests.jsx";
import AddFriend from "../friends/AddFriend.jsx";
import CreateGroup from "../groups/CreateGroup.jsx";
import { searchFriends, openDirectConversation } from "../../api/api.js";
import { useChat } from "../../context/ChatContext.jsx";

const Sidebar = ({ conversations, selectedConversation, onSelectConversation }) => {
    const { setConversations } = useChat();
    const [menuOpen, setMenuOpen] = useState(false);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const menuRef = useRef(null);

    const closeModal = () => {
        setModal(null);
        setSearch("");
        setResults([]);
        setSearchError("");
    };

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const handleOutsideClick = (event) => {
            if (!menuRef.current?.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen]);

    const findFriends = async (value) => {
        setSearch(value);
        setSearchError("");
        if (!value.trim()) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const response = await searchFriends(value.trim());
            setResults(response.friends || []);
        } catch (error) {
            setSearchError(error.message);
        } finally {
            setSearching(false);
        }
    };

    const startChat = async (friend) => {
        try {
            const result = await openDirectConversation(friend.userId);
            const conversation = result.conversation;
            setConversations((previous) => {
                const exists = previous.some((item) =>
                    String(item.conversation?._id || item._id) === String(conversation._id)
                );
                if (exists) return previous;
                return [result, ...previous];
            });
            onSelectConversation(result);
            closeModal();
        } catch (error) {
            setSearchError(error.message);
        }
    };

    const handleGroupCreated = (result) => {
        const source = result?.conversation || result;
        const conversationId = source?._id || source?.id || source?.conversationId;
        if (conversationId) {
            const item = {
                ...(result?.conversation ? result : {}),
                conversation: {
                    ...source,
                    _id: conversationId,
                    type: source.type || "GROUP"
                }
            };
            setConversations((previous) => {
                const exists = previous.some((entry) =>
                    String(entry?.conversation?._id || entry?._id || entry?.conversationId) === String(conversationId)
                );
                return exists ? previous : [item, ...previous];
            });
            onSelectConversation(item);
        }
        closeModal();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-title">
                <div className="sidebar-title-row">
                    <h2>Chats</h2>
                    <div className="plus-menu-anchor" ref={menuRef}>
                        <button className="plus-button" onClick={() => setMenuOpen((v) => !v)} aria-label="Create or add" aria-expanded={menuOpen}>
                            +
                        </button>
                        {menuOpen && (
                            <div className="plus-menu">
                                <button onClick={() => { setModal("friend"); setMenuOpen(false); }}>＋ Add Friend</button>
                                <button onClick={() => { setModal("group"); setMenuOpen(false); }}>＋ Create Group</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FriendRequests />

            <div className="new-chat-section">
                <button className="new-chat-button" onClick={() => setModal("chat")}>✎ New Chat</button>
            </div>

            <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={onSelectConversation}
            />

            {modal && (
                <div className="modal-backdrop" onMouseDown={closeModal}>
                    <div className="sidebar-modal" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="modal-heading">
                            <h3>{modal === "friend" ? "Add Friend" : modal === "group" ? "Create Group" : "New Chat"}</h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>

                        {modal === "friend" && <AddFriend onDone={closeModal} />}

                        {modal === "group" && <CreateGroup onCreated={handleGroupCreated} onCancel={closeModal} />}

                        {modal === "chat" && (
                            <>
                                <input
                                    className="modal-search"
                                    autoFocus
                                    value={search}
                                    onChange={(e) => findFriends(e.target.value)}
                                    placeholder="Search your friends by username..."
                                />
                                {searching && <p className="muted">Searching...</p>}
                                {searchError && <p className="friend-message error">{searchError}</p>}
                                <div className="friend-search-results">
                                    {results.map((friend) => (
                                        <button className="friend-search-result" key={friend.userId} onClick={() => startChat(friend)}>
                                            <span className="friend-avatar">{friend.username.charAt(0).toUpperCase()}</span>
                                            <strong>@{friend.username}</strong>
                                        </button>
                                    ))}
                                    {!searching && search.trim() && !results.length && !searchError && (
                                        <p className="muted">No accepted friends found.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
