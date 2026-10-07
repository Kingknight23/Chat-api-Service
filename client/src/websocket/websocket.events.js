const WS_EVENTS = {
    CONNECTION_READY:
        "connection.ready",

    MESSAGE_SEND:
        "message.send",

    MESSAGE_CREATED:
        "message.created",

    MESSAGE_DELIVERED:
        "message.delivered",

    MESSAGE_READ:
        "message.read",

    MESSAGE_READ_CONFIRMED:
        "message.read.confirmed",

    CONVERSATION_SUBSCRIBE:
        "conversation.subscribe",

    CONVERSATION_SUBSCRIBED:
        "conversation.subscribed",

    CONVERSATION_UNSUBSCRIBE:
        "conversation.unsubscribe",

    CONVERSATION_UNSUBSCRIBED:
        "conversation.unsubscribed",

    FRIEND_REQUEST_RECEIVED:
        "friend.request.received",

    FRIEND_REQUEST_ACCEPTED:
        "friend.request.accepted",

    FRIEND_REQUEST_REJECTED:
        "friend.request.rejected",

    GROUP_CREATED:
        "group.created",

    GROUP_MEMBER_ADDED:
        "group.member.added",

    GROUP_MEMBER_REMOVED:
        "group.member.removed",

    GROUP_MEMBER_LEFT:
        "group.member.left",

    TYPING_START:
        "typing.start",

    TYPING_STOP:
        "typing.stop",

    PRESENCE_UPDATE:
        "presence.update",

    PRESENCE_STATUS:
        "presence.status",

    PRESENCE_ONLINE:
        "presence.online",

    PRESENCE_OFFLINE:
        "presence.offline",

    ADMIN_BROADCAST:
        "admin.broadcast",

    ADMIN_BROADCAST_CONFIRMED:
        "admin.broadcast.confirmed",

    ADMIN_BROADCAST_READ:
        "admin.broadcast.read",

    ADMIN_BROADCAST_READ_CONFIRMED:
        "admin.broadcast.read.confirmed",

    ERROR:
        "error"
};

export default WS_EVENTS;