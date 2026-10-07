import { formatDate } from "../../utils/formatDate.js";
const Message = ({ message, own, isGroup }) => {
    const text = message.payload?.text || message.text || "";
    return <div className={own ? "message-row own" : "message-row"}>
        <div className={own ? "message-bubble own" : "message-bubble"}>
            {isGroup && <div className="message-sender">@{message.senderUsername || "Unknown User"}</div>}
            <div>{text}</div>
            <div className="message-meta">{formatDate(message.createdAt)}</div>
        </div>
    </div>;
};
export default Message;
