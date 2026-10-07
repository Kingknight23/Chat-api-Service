import Avatar from "../common/Avatar.jsx";

const ConversationItem = ({
    conversation,
    active,
    onClick
}) => {
    const name = conversation.name ||
        conversation.users?.[0]?.username ||
        "Conversation";

    return (
        <button
            className={
                active
                    ? "conversation-item active"
                    : "conversation-item"
            }
            onClick={onClick}
        >
            <Avatar
                name={name}
                profilePicture={conversation.profilePicture || conversation.users?.[0]?.profilePicture}
            />

            <div className="conversation-info">

                <strong>
                    {name}
                </strong>

                <span>
                    {conversation.type ||
                        "DIRECT"}
                </span>

            </div>
        </button>
    );
};

export default ConversationItem;