import dotenv from "dotenv";
dotenv.config();
const env = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV || "development",
    keyEncryptionSecret: process.env.KEY_ENCRYPTION_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    https: String(process.env.HTTPS || "false").toLowerCase() === "true",
    httpsKeyPath: process.env.HTTPS_KEY_PATH,
    httpsCertPath: process.env.HTTPS_CERT_PATH
};
export default env;
