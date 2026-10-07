import Avatar from "../common/Avatar.jsx";

const FriendList = ({
    friends = []
}) => {
    return (
        <div className="friend-list">

            {friends.map(
                (friend) => (
                    <div
                        className="friend-item"
                        key={
                            friend.id ||
                            friend._id
                        }
                    >
                        <Avatar
                            name={
                                friend.username ||
                                String(
                                    friend.id
                                )
                            }
                        />

                        <span>
                            {
                                friend.username ||
                                friend.id
                            }
                        </span>
                    </div>
                )
            )}

        </div>
    );
};

export default FriendList;