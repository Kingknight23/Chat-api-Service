const validateImagePayload = (payload) => {
    if (!payload || typeof payload !== "object") {
        throw new Error(
            "Image payload must be an object"
        );
    }

    if (
        typeof payload.url !== "string" ||
        payload.url.trim() === ""
    ) {
        throw new Error(
            "Image payload must contain a url"
        );
    }

    return {
        url: payload.url,
        width: payload.width || null,
        height: payload.height || null
    };
};


export {
    validateImagePayload
};