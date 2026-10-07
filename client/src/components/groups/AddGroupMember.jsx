import {
    useState
} from "react";

import {
    addGroupMember
} from "../../api/api.js";

const AddGroupMember = ({
    conversationId
}) => {
    const [
        userId,
        setUserId
    ] = useState("");

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (!userId.trim()) {
            return;
        }

        try {
            await addGroupMember(
                conversationId,
                userId.trim()
            );

            setUserId("");
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="add-member-form"
        >

            <input
                value={userId}
                onChange={(event) =>
                    setUserId(
                        event.target.value
                    )
                }
                placeholder="User ID"
            />

            <button className="primary-button">
                Add
            </button>

        </form>
    );
};

export default AddGroupMember;