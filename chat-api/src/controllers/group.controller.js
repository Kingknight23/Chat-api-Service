import {
    createGroup,
    addGroupMember,
    removeGroupMember,
    leaveGroup
} from "../services/group.service.js";


const create = async (
    req,
    res,
    next
) => {

    try {

        const creatorId =
            req.user.userId;

        const {
            name,
            userIds
        } = req.body;

        const result =
            await createGroup(
                creatorId,
                name,
                userIds
            );

        res.status(201).json({
            message:
                "Group created",

            conversation:
                result.conversation,

            members:
                result.members
        });

    } catch (error) {
        next(error);
    }
};


const addMember = async (
    req,
    res,
    next
) => {

    try {

        const requesterId =
            req.user.userId;

        const {
            conversationId
        } = req.params;

        const {
            userId
        } = req.body;

        const member =
            await addGroupMember(
                requesterId,
                conversationId,
                userId
            );

        res.status(201).json({
            message:
                "Member added",

            member
        });

    } catch (error) {
        next(error);
    }
};


const removeMember = async (
    req,
    res,
    next
) => {

    try {

        const requesterId =
            req.user.userId;

        const {
            conversationId,
            userId
        } = req.params;

        await removeGroupMember(
            requesterId,
            conversationId,
            userId
        );

        res.status(200).json({
            message:
                "Member removed"
        });

    } catch (error) {
        next(error);
    }
};


const leave = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        const {
            conversationId
        } = req.params;

        await leaveGroup(
            userId,
            conversationId
        );

        res.status(200).json({
            message:
                "Left group"
        });

    } catch (error) {
        next(error);
    }
};


export {
    create,
    addMember,
    removeMember,
    leave
};