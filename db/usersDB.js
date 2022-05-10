import connection from "./connection.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import fetch from "node-fetch";

dotenv.config();

async function loginWithGoogle(token) {
    try {
        const UserToken = await fetch(process.env.API_GOOGLE, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await UserToken.json().then(data => data).catch(err => console.log(err));
        try {
            const existUser = await getUserEmail(user.email);
            if (!existUser) {
                const newUser = await register(user);
                const userBDA = await getUserId(newUser.insertedId);
                console.log(userDBA);
                return userBDA;
            } else {
                console.log(existUser);
                return existUser;
            }
        } catch (error) {
            console.log(error);
            throw new Error('Error en data - user - loginWithGoogle(token): ', error);
        }
    } catch (error) {
        console.log(error);
        throw new Error('');
    }
}

async function getUserEmail(email) {
    try {
        email = email.toLowerCase().trim();
        const mongoClient = await connection.getConnection();
        const user = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers).findOne({ email: email });
        return user;
    } catch (error) {
        throw new Error('Error en data - user - getUserEmail(email): ', error);
    }
}

async function getUserId(id) {
    try {
        const mongoClient = await connection.getConnection();
        const user = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers).findOne({ _id: new ObjectId(id) });
        return user;
    } catch (error) {
        throw new Error('Error en data - user - getUserId(id): ', error);
    }
}

async function register(user) {
    try {
        const imageDefault = process.env.IMAGE_DEFAULT;
        const newUser = {
            email: user.email.toLowerCase().trim(),
            name: user.name,
            image_profile: (!user.picture) ? imageDefault : user.picture,
            date_creation: Date.parse(new Date()),
            groups_following: [],
            groups_requested: [],
            groups_created: [],
            verified: false,
            codeVerification: parseInt(Math.floor(Math.random() * (999999 - 100000) + 100000)),
            verifiedCode: false,
        }
        const mongoClient = await connection.getConnection();
        const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers).insertOne(newUser);
        return result;
    } catch (error) {
        throw new Error('Error en data - user - addUser(user): ', error);
    }
}

async function generateJWT(user) {
    try {
        const token = jwt.sign({ email: user.email, name: user.name, verified: user.verified, date: user.date_creation }, process.env.JWT_SECRET, { expiresIn: '365d' });
        return token;
    } catch (error) {
        throw new Error('Error en data - user - generateJWT(user): ', error);
    }
}


export default {
    loginWithGoogle,
    generateJWT,
    getUserId,
    register
};

