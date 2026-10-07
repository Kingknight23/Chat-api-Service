import Message from "./Message.jsx";
import EmptyState from "../common/EmptyState.jsx";
const MessageList = ({ messages, currentUserId, isGroup }) => {
    if (!messages.length) return <EmptyState title="No messages" message="Send the first message." />;
    return <div className="messages-container">{messages.map((message,index)=>{
        const id = message._id || message.id || message.messageId || index;
        const own = String(message.senderId) === String(currentUserId);
        return <Message key={id} message={message} own={own} isGroup={isGroup} />;
    })}</div>;
};
export default MessageList;
