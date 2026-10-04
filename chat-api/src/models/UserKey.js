import mongoose from "mongoose";


const userKeySchema =
    new mongoose.Schema(
        {
            userId: {
                type: String,
                required: true,
                unique: true
            },

            publicKey: {
                type: String,
                required: true
            },

            encryptedPrivateKey: {
                type: String,
                required: true
            },

            privateKeyIv: {
                type: String,
                required: true
            },

            privateKeyAuthTag: {
                type: String,
                required: true
            },

            algorithm: {
                type: String,
                default: "RSA-OAEP"
            }
        },
        {
            timestamps: true
        }
    );


const UserKey =
    mongoose.model(
        "UserKey",
        userKeySchema
    );


export default UserKey;