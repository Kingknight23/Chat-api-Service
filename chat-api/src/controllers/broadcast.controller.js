import {getBroadcasts} from "../services/broadcast.service.js";


const broadcasts = async (
    req,
    res,
    next
) => {

    try {

        const {
            limit = 50,
            before = null
        } = req.query;


        const result =
            await getBroadcasts(
                limit,
                before
            );


        res.status(200).json({
            broadcasts:
                result
        });

    } catch (error) {
        next(error);
    }
};


export {
    broadcasts
};