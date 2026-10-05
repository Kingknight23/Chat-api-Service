import Broadcast from "../../models/Broadcast.js";

import {broadcastToAll} from "../connection.manager.js";


const handleAdminBroadcast = async (
    socket,
    message
) => {

    /*
     * Only administrators can
     * create broadcasts.
     */

    if (
        !socket.user.roles ||
        !socket.user.roles.includes(
            "ADMIN"
        )
    ) {
        throw new Error(
            "Admin permission required"
        );
    }

    const {
        payloadType,
        payload
    } = message.data || {};

    if (!payloadType) {
        throw new Error(
            "payloadType is required"
        );
    }

    if (payload === undefined) {
        throw new Error(
            "payload is required"
        );
    }


    /*
     * Save the broadcast first.
     */

    const broadcast =
        await Broadcast.create({
            senderId:
                socket.user.userId,

            payloadType,

            payload
        });


    /*
     * Send it to every currently
     * connected user.
     */

    broadcastToAll(
        {
            type:
                "admin.broadcast",

            data: {
                broadcastId:
                    broadcast._id,

                payloadType,

                payload,

                sentBy:
                    socket.user.userId,

                createdAt:
                    broadcast.createdAt
            }
        }
    );


    /*
     * Confirm to the admin that
     * the broadcast was saved.
     */

    socket.send(
        JSON.stringify({
            type:
                "admin.broadcast.confirmed",

            data: {
                broadcastId:
                    broadcast._id,

                createdAt:
                    broadcast.createdAt
            }
        })
    );
};


export {
    handleAdminBroadcast
};