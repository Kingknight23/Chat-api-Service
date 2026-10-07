import ConversationItem from "./ConversationItem.jsx";
import EmptyState from "../common/EmptyState.jsx";

const ConversationList = ({ conversations, selectedConversation, onSelectConversation }) => {
    if (!conversations.length) {
        return <EmptyState title="No chats" message="Your conversations will appear here." />;
    }

    const selectedItem = selectedConversation?.conversation || selectedConversation;
    const selectedId = selectedItem?._id || selectedItem?.id;

    return (
        <div className="conversation-list">
            {conversations.map((entry) => {
                const item = entry.conversation || entry;
                const id = item._id || item.id;
                return (
                    <ConversationItem
                        key={id}
                        conversation={item}
                        active={String(id) === String(selectedId)}
                        onClick={() => onSelectConversation(entry)}
                    />
                );
            })}
        </div>
    );
};

export default ConversationList;
