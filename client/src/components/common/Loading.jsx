const Loading = ({
    text = "Loading..."
}) => {
    return (
        <div className="loading">
            <div className="loading-spinner" />
            <span>{text}</span>
        </div>
    );
};

export default Loading;