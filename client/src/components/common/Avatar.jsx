const Avatar = ({ name = "User", online = false, profilePicture = null }) => {
    const letter = name?.charAt(0)?.toUpperCase() || "U";
    return <div className="avatar-wrapper"><div className="avatar">{profilePicture ? <img src={profilePicture} alt="" /> : letter}</div>{online && <span className="avatar-online" />}</div>;
};
export default Avatar;
