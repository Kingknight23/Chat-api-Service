import {
    useChat
} from "../../context/ChatContext.jsx";

const BroadcastList = () => {
    const {
        broadcasts
    } = useChat();


    if (!broadcasts.length) {
        return null;
    }


    return (
        <div className="sidebar-section">

            <h3>
                Announcements
            </h3>

            {broadcasts.map(
                (broadcast, index) => (
                    <div
                        className="broadcast-item"
                        key={
                            broadcast._id ||
                            broadcast.id ||
                            index
                        }
                    >
                        {broadcast.message ||
                            broadcast.payload?.text ||
                            broadcast.content}
                    </div>
                )
            )}

        </div>
    );
};

export default BroadcastList;