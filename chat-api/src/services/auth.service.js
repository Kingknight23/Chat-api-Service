import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import env from "../config/env.js";

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            username: user.username
        },
        env.jwtSecret,
        {
            expiresIn: "7d"
        }
    );
};

const registerUser = async (
    username,
    email,
    password
) => {
    if (!username || !email || !password) {
        throw new Error(
            "Username, email and password are required"
        );
    }

    if (password.length < 8) {
        throw new Error(
            "Password must be at least 8 characters"
        );
    }

    const existingUser = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username }
        ]
    });

    if (existingUser) {
        throw new Error(
            "Username or email is already registered"
        );
    }

    const passwordHash = await bcrypt.hash(
        password,
        12
    );

    const user = await User.create({
        username,
        email: email.toLowerCase(),
        passwordHash,
        role: "USER"
    });


    const token = generateToken(user);

    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture || null
        },
        token
    };
};

const loginUser = async (
    email,
    password
) => {
    const user = await User.findOne({
        email: email.toLowerCase()
    });

    if (!user) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const passwordMatches =
        await bcrypt.compare(
            password,
            user.passwordHash
        );

    if (!passwordMatches) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const token = generateToken(user);

    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture || null
        },
        token
    };
};

export {
    registerUser,
    loginUser,
    generateToken
};