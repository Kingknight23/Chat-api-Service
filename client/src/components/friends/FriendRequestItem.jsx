import {
    acceptFriendRequest,
    rejectFriendRequest
} from "../../api/api.js";

const FriendRequestItem = ({
    request,
    onComplete
}) => {
    const requestId =
        request._id ||
        request.id;

    const handleAccept = async () => {
        try {
            await acceptFriendRequest(
                requestId
            );

            onComplete();
        } catch (error) {
            console.error(error);
        }
    };


    const handleReject = async () => {
        try {
            await rejectFriendRequest(
                requestId
            );

            onComplete();
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className="friend-request">

            <div>
                <strong>
                    {request.fromUserId ||
                        request.senderId ||
                        "User"}
                </strong>
            </div>

            <div className="friend-request-actions">

                <button
                    onClick={
                        handleAccept
                    }
                >
                    Accept
                </button>

                <button
                    onClick={
                        handleReject
                    }
                >
                    Reject
                </button>

            </div>

        </div>
    );
};

export default FriendRequestItem;