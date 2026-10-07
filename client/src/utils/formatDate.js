const formatDate = (date) => {
    if (!date) {
        return "";
    }

    const value = new Date(date);

    return value.toLocaleTimeString(
        [],
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
};

const formatFullDate = (date) => {
    if (!date) {
        return "";
    }

    const value = new Date(date);

    return value.toLocaleString();
};

export {
    formatDate,
    formatFullDate
};