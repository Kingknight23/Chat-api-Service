import { useEffect, useMemo, useState } from "react";
import { addGroupMember, updateGroup, deleteGroup, removeGroupMember, makeGroupAdmin, searchFriends } from "../../api/api.js";
import Avatar from "../common/Avatar.jsx";
import { useChat } from "../../context/ChatContext.jsx";

const readImage = (file, setter) => {
    if (!file) return;
    if (file.size > 1_800_000) return alert("Please choose an image smaller than 1.8 MB.");
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result));
    reader.readAsDataURL(file);
};

const GroupDetails = ({ conversation, onClose }) => {
    const { setConversations } = useChat();
    const [name, setName] = useState(conversation.name || "");
    const [picture, setPicture] = useState(conversation.profilePicture || null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentId = String(currentUser?.id || currentUser?._id || currentUser?.userId || "");
    const members = conversation.members || [];
    const me = members.find(m => String(m.userId) === currentId);
    const isAdmin = me?.role === "ADMIN";

    useEffect(() => {
        if (!query.trim()) return setResults([]);
        const timer = setTimeout(async () => {
            try { const r = await searchFriends(query); setResults(r.friends || []); } catch (e) { setMessage(e.message); }
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    const replaceConversation = (updated) => {
        const normalized = updated?.conversation || updated;
        if (!normalized?._id) return;
        setConversations(prev => prev.map(c => String(c?._id || c?.conversation?._id) === String(normalized._id) ? normalized : c));
    };

    const save = async () => {
        setBusy(true); setMessage("");
        try { const r = await updateGroup(conversation._id, { name, profilePicture: picture }); replaceConversation(r); } catch(e){ setMessage(e.message); } finally { setBusy(false); }
    };

    const add = async (userId) => { try { await addGroupMember(conversation._id, userId); setQuery(""); setResults([]); setMessage("Member added"); } catch(e){ setMessage(e.message); } };
    const remove = async (userId) => { if (!confirm("Remove this member from the group?")) return; try { await removeGroupMember(conversation._id, userId); setMessage("Member removed"); } catch(e){ setMessage(e.message); } };
    const promote = async (userId) => { if (!confirm("Make this member a group admin?")) return; try { await makeGroupAdmin(conversation._id, userId); setMessage("Admin updated"); } catch(e){ setMessage(e.message); } };
    const destroy = async () => { if (!confirm("Delete this group and all its messages? This cannot be undone.")) return; try { await deleteGroup(conversation._id); setConversations(prev => prev.filter(c => String(c?._id || c?.conversation?._id) !== String(conversation._id))); onClose(); } catch(e){ setMessage(e.message); } };

    return <div className="modal-backdrop" onMouseDown={onClose}>
        <div className="sidebar-modal group-details" onMouseDown={e=>e.stopPropagation()}>
            <div className="modal-heading"><h3>Group details</h3><button className="modal-close" onClick={onClose}>×</button></div>
            <div className="group-profile-editor">
                <Avatar name={conversation.name} />
                {isAdmin && <label className="secondary-button file-button">Change picture<input type="file" accept="image/*" hidden onChange={e=>readImage(e.target.files?.[0], setPicture)} /></label>}
            </div>
            {isAdmin && <><input className="modal-search" value={name} onChange={e=>setName(e.target.value)} placeholder="Group name" /><button className="primary-button" disabled={busy} onClick={save}>Save group</button></>}
            {!isAdmin && <p className="muted">Only group admins can change the name, picture, members, or admin roles.</p>}
            {isAdmin && <>
                <h4>Admin controls</h4>
                <input className="modal-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search accepted friends to add..." />
                <div className="friend-search-results compact">{results.filter(r=>!members.some(m=>String(m.userId)===String(r.userId))).map(r=><button className="friend-search-result" key={r.userId} onClick={()=>add(r.userId)}><Avatar name={r.username}/><strong>@{r.username}</strong><span>Add</span></button>)}</div>
            </>}
            <h4>Members</h4>
            <div className="group-members-list">{members.map(member=><div className="group-member-row" key={member.userId}><Avatar name={member.username || member.userId}/><div><strong>@{member.username || member.userId}</strong>{member.role === "ADMIN" && <span className="admin-badge">ADMIN</span>}</div>{isAdmin && String(member.userId)!==currentId && <div className="member-actions"><button onClick={()=>promote(member.userId)} disabled={member.role==="ADMIN"}>Make admin</button><button onClick={()=>remove(member.userId)}>Remove</button></div>}</div>)}</div>
            {message && <p className="muted">{message}</p>}
            {isAdmin && <button className="danger-button" onClick={destroy}>Delete group</button>}
        </div>
    </div>;
};
export default GroupDetails;
