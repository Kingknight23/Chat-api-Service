import { useState } from "react";
import Avatar from "../common/Avatar.jsx";
import GroupDetails from "../groups/GroupDetails.jsx";

const ChatHeader = ({ conversation }) => {
    const [detailsOpen, setDetailsOpen] = useState(false);
    if (!conversation) return null;
    const isGroup = conversation.type === "GROUP";
    const name = conversation.name || conversation.users?.[0]?.username || "Conversation";
    const memberCount = conversation.members?.length || 0;
    return <>
        <header className={`chat-header ${isGroup ? "clickable-group-header" : ""}`} onClick={()=>isGroup && setDetailsOpen(true)} title={isGroup ? "View group members and admin controls" : undefined}>
            <Avatar name={name} profilePicture={conversation.profilePicture || conversation.users?.[0]?.profilePicture} />
            <div>
                <h2>{name}</h2>
                <span>{conversation.type || "DIRECT"}{isGroup && ` · ${memberCount} members`}{" · E2E encrypted"}</span>
            </div>
            {isGroup && <button className="group-members-button" onClick={e=>{e.stopPropagation();setDetailsOpen(true)}}>Members</button>}
        </header>
        {detailsOpen && <GroupDetails conversation={conversation} onClose={()=>setDetailsOpen(false)} />}
    </>;
};
export default ChatHeader;
