// import {
//     useChat
// } from "../../context/ChatContext.jsx";

// import FriendRequestItem
//     from "./FriendRequestItem.jsx";

// const FriendRequests = () => {
//     const {
//         friendRequests,
//         loadInitialData
//     } = useChat();


//     if (!friendRequests.length) {
//         return null;
//     }


//     return (
//         <div className="sidebar-section">

//             <h3>
//                 Friend Requests
//             </h3>

//             {friendRequests.map(
//                 (request) => (
//                     <FriendRequestItem
//                         key={
//                             request._id ||
//                             request.id
//                         }
//                         request={request}
//                         onComplete={
//                             loadInitialData
//                         }
//                     />
//                 )
//             )}

//         </div>
//     );
// };

// export default FriendRequests;

import { useChat } from "../../context/ChatContext.jsx";
// import FriendRequestItem from "./FriendRequestItem.jsx";

import {
    acceptFriendRequest,
    rejectFriendRequest
} from "../../api/api.js";

const FriendRequests = () => {
    const {
        friendRequests,
        setFriendRequests
    } = useChat();

    const handleAccept = async (
        requestId
    ) => {
        try {
            await acceptFriendRequest(
                requestId
            );

            setFriendRequests(
                (previous) =>
                    previous.filter(
                        (request) =>
                            request.requestId !==
                            requestId
                    )
            );
        } catch (error) {
            console.error(
                "Unable to accept friend request:",
                error
            );
        }
    };

    const handleReject = async (
        requestId
    ) => {
        try {
            await rejectFriendRequest(
                requestId
            );

            setFriendRequests(
                (previous) =>
                    previous.filter(
                        (request) =>
                            request.requestId !==
                            requestId
                    )
            );
        } catch (error) {
            console.error(
                "Unable to reject friend request:",
                error
            );
        }
    };

    if (!friendRequests.length) {
        return (
            <div className="friend-requests">
                <h3>Friend Requests</h3>

                <p className="muted">
                    No pending requests.
                </p>
            </div>
        );
    }

    return (
        <div className="friend-requests">
            <h3>Friend Requests</h3>

            {friendRequests.map(
                (request) => (
                    <div
                        className="friend-request"
                        key={request.requestId}
                    >
                        <div className="friend-request-info">
                            <div className="friend-avatar">
                                {(
                                    request.requesterUsername ||
                                    "U"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <strong>
                                    @
                                    {request.requesterUsername ||
                                        "Unknown User"}
                                </strong>

                                <p>
                                    wants to be your
                                    friend
                                </p>
                            </div>
                        </div>

                        <div className="friend-request-actions">
                            <button
                                className="primary-button"
                                onClick={() =>
                                    handleAccept(
                                        request.requestId
                                    )
                                }
                            >
                                Accept
                            </button>

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    handleReject(
                                        request.requestId
                                    )
                                }
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default FriendRequests;