import Conversation from "../models/Conversation.js";
import ConversationMember from "../models/ConversationMember.js";
import {sendToUser} from "../websocket/connection.manager.js";


const createGroup = async (
    creatorId,
    name,
    userIds
) => {

    if (!name || name.trim() === "") {
        throw new Error(
            "Group name is required"
        );
    }

    if (!Array.isArray(userIds)) {
        throw new Error(
            "userIds must be an array"
        );
    }

    /*
     * Make sure creator is included.
     */

    const memberIds = [
        ...new Set([
            creatorId,
            ...userIds
        ])
    ];

    /*
     * Groups must contain
     * at least 3 people.
     */

    if (memberIds.length < 3) {
        throw new Error(
            "A group must contain at least 3 users"
        );
    }

    const conversation =
        await Conversation.create({
            type: "GROUP",
            name: name.trim(),
            createdBy: creatorId
        });

    const members =
        memberIds.map(
            (userId) => ({
                conversationId:
                    conversation._id,

                userId,

                role:
                    userId === creatorId
                        ? "ADMIN"
                        : "MEMBER"
            })
        );

    await ConversationMember.insertMany(
        members
    );

    /*
     * Tell every member that the
     * group was created.
     */

    for (
        const userId of memberIds
    ) {

        sendToUser(
            userId,
            {
                type:
                    "group.created",

                data: {
                    conversationId:
                        conversation._id,

                    name:
                        conversation.name,

                    createdBy:
                        creatorId,

                    members:
                        memberIds
                }
            }
        );
    }

    return {
        conversation,
        members
    };
};


const addGroupMember = async (
    requesterId,
    conversationId,
    userId
) => {

    const admin =
        await ConversationMember.findOne({
            conversationId,
            userId: requesterId,
            role: "ADMIN"
        });

    if (!admin) {
        throw new Error(
            "Only group admins can add members"
        );
    }

    const conversation =
        await Conversation.findOne({
            _id: conversationId,
            type: "GROUP"
        });

    if (!conversation) {
        throw new Error(
            "Group not found"
        );
    }

    const existingMember =
        await ConversationMember.findOne({
            conversationId,
            userId
        });

    if (existingMember) {
        throw new Error(
            "User is already a member of this group"
        );
    }

    const member =
        await ConversationMember.create({
            conversationId,
            userId,
            role: "MEMBER"
        });

    const members =
        await ConversationMember.find({
            conversationId
        });

    const memberIds =
        members.map(
            (member) =>
                member.userId
        );

    /*
     * Notify existing members.
     */

    for (
        const memberId of memberIds
    ) {

        sendToUser(
            memberId,
            {
                type:
                    "group.member.added",

                data: {
                    conversationId,
                    userId,
                    addedBy:
                        requesterId
                }
            }
        );
    }

    return member;
};


const removeGroupMember = async (
    requesterId,
    conversationId,
    userId
) => {

    const admin =
        await ConversationMember.findOne({
            conversationId,
            userId: requesterId,
            role: "ADMIN"
        });

    if (!admin) {
        throw new Error(
            "Only group admins can remove members"
        );
    }

    if (
        requesterId === userId
    ) {
        throw new Error(
            "Use leave group to remove yourself"
        );
    }

    const member =
        await ConversationMember.findOne({
            conversationId,
            userId
        });

    if (!member) {
        throw new Error(
            "User is not a member of this group"
        );
    }

    await ConversationMember.deleteOne({
        _id: member._id
    });

    /*
     * Notify the removed user.
     */

    sendToUser(
        userId,
        {
            type:
                "group.member.removed",

            data: {
                conversationId,
                userId,
                removedBy:
                    requesterId
            }
        }
    );

    /*
     * Notify remaining members.
     */

    const remainingMembers =
        await ConversationMember.find({
            conversationId
        });

    for (
        const remainingMember
        of remainingMembers
    ) {

        sendToUser(
            remainingMember.userId,
            {
                type:
                    "group.member.removed",

                data: {
                    conversationId,
                    userId,
                    removedBy:
                        requesterId
                }
            }
        );
    }

    return true;
};


const leaveGroup = async (
    userId,
    conversationId
) => {

    const member =
        await ConversationMember.findOne({
            conversationId,
            userId
        });

    if (!member) {
        throw new Error(
            "You are not a member of this group"
        );
    }

    const memberCount =
        await ConversationMember.countDocuments({
            conversationId
        });

    if (
        memberCount <= 3
    ) {
        throw new Error(
            "A group must contain at least 3 users"
        );
    }

    if (
        member.role === "ADMIN"
    ) {
        throw new Error(
            "Group admin must transfer admin role before leaving"
        );
    }

    await ConversationMember.deleteOne({
        _id: member._id
    });

    const remainingMembers =
        await ConversationMember.find({
            conversationId
        });

    for (
        const remainingMember
        of remainingMembers
    ) {

        sendToUser(
            remainingMember.userId,
            {
                type:
                    "group.member.left",

                data: {
                    conversationId,
                    userId
                }
            }
        );
    }

    return true;
};


export {
    createGroup,
    addGroupMember,
    removeGroupMember,
    leaveGroup
};