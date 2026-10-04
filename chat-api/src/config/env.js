import dotenv from "dotenv";

dotenv.config();

const env = {
    port: process.env.PORT || 5000,

    mongoUri: process.env.MONGO_URI,

    nodeEnv:
        process.env.NODE_ENV ||
        "development",

    keyEncryptionSecret:
        process.env.KEY_ENCRYPTION_SECRET
};

export default env;