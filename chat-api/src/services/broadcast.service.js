import Broadcast from "../models/Broadcast.js";
import {sendToUser} from "../websocket/connection.manager.js";


const getBroadcasts = async (
    limit = 50,
    before = null
) => {

    const query = {};

    if (before) {

        const beforeBroadcast =
            await Broadcast.findById(
                before
            );

        if (!beforeBroadcast) {
            throw new Error(
                "Broadcast not found"
            );
        }

        query.createdAt = {
            $lt:
                beforeBroadcast.createdAt
        };
    }


    const broadcasts =
        await Broadcast.find(query)
            .sort({
                createdAt: -1
            })
            .limit(
                Number(limit)
            );


    return broadcasts.reverse();
};


const sendRecentBroadcasts = async (
    userId
) => {

    const broadcasts =
        await Broadcast.find()
            .sort({
                createdAt: -1
            })
            .limit(20);


    /*
     * Send oldest → newest.
     */

    broadcasts.reverse();


    for (
        const broadcast
        of broadcasts
    ) {

        sendToUser(
            userId,
            {
                type:
                    "admin.broadcast",

                data: {
                    broadcastId:
                        broadcast._id,

                    payloadType:
                        broadcast.payloadType,

                    payload:
                        broadcast.payload,

                    sentBy:
                        broadcast.senderId,

                    createdAt:
                        broadcast.createdAt
                }
            }
        );
    }
};


export {
    getBroadcasts,
    sendRecentBroadcasts
};