import Avatar from "../common/Avatar.jsx";

const GroupMembers = ({
    members = []
}) => {
    return (
        <div className="group-members">

            {members.map(
                (member) => (
                    <div
                        className="group-member"
                        key={
                            member._id ||
                            member.id ||
                            member.userId
                        }
                    >
                        <Avatar
                            name={
                                member.username ||
                                member.userId
                            }
                        />

                        <span>
                            {
                                member.username ||
                                member.userId
                            }
                        </span>

                        {member.role && (
                            <small>
                                {member.role}
                            </small>
                        )}
                    </div>
                )
            )}

        </div>
    );
};

export default GroupMembers;