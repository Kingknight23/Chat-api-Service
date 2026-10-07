const Modal = ({
    open,
    title,
    children,
    onClose
}) => {
    if (!open) {
        return null;
    }

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className="modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="modal-header">
                    <h2>{title}</h2>

                    <button
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;