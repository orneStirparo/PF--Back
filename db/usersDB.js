import connection from "./connection.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
// import fetch from "node-fetch";
import bcrypt from "bcryptjs";
// import sendEmail from "./sendEmail.js";
// import multer from "../middleware/multerS3.js";
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
                const newUser = await addUser(user);
                const userBDA = await getUserId(newUser.insertedId);
                return userBDA;
            } else {
                return existUser;
            }
        } catch (error) {
            throw new Error('Error en data - user - loginWithGoogle(token): ', error);
        }
    } catch (error) {
        throw new Error('');
    }
}

async function login(email, password) {
    try {
        const user = await getUserEmail(email);
        if (!user)
            throw new Error('Datos Invalidos');

        const isValido = bcrypt.compareSync(password, user.password);
        if (!isValido)
            throw new Error('Datos Invalidos')
        const LoginUser = {
            _id: user._id,
            email: user.email,
            name: user.name,
            image_profile: user.image_profile,
            groups_following: user.groups_following,
            groups_requested: user.groups_requested,
            groups_created: user.groups_created,
            verified: user.verified,
            verifiedCode: user.verifiedCode,
        }
        return LoginUser;
    } catch (error) {
        throw new Error(error);
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

async function addUser(user) {
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

async function register(name, email, password) {
    try {
        const user = await getUserEmail(email);
        if (user) {
            console.log('El usuario ya existe');
            throw new Error('El usuario ya existe');
        }
        const imageDefault = process.env.IMAGE_DEFAULT;
        const newUser = {
            email: email.toLowerCase().trim(),
            name: name,
            password: bcrypt.hashSync(password, 9),
            image_profile: imageDefault,
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
        //sendEmail.sendEmail(email, 'Registro Hanuka Verificación', newUser.codeVerification);
        return result;
    } catch (error) {
        console.log(error);
        throw new Error('Error en data - user - register(name, email, password): ', error);
    }
}

async function verifyCode(email, code) {
    try {
        const user = await getUserEmail(email);
        if (!user) {
            throw new Error('Usuario no existe')
        }
        code = parseInt(code);
        if (user.codeVerification === code) {
            const mongoClient = await connection.getConnection();
            const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers)
                .updateOne({ _id: user._id }, { $set: { verifiedCode: true } });
            return result;
        } else {
            throw new Error('Código incorrecto');
        }
    } catch (error) {
        throw new Error('Error en data - user - verifyCode(user_id, code): ', error);
    }
}

async function changePassword(email, code, password, repeatPassword) {
    try {
        code = parseInt(code);
        const user = await getUserEmail(email);
        if (!user)
            throw new Error('Usuario no existe')
        if (password !== repeatPassword)
            throw new Error('Las contraseñas no coinciden')
        if (user.codeVerification !== code)
            throw new Error('Código incorrecto')
        const mongoClient = await connection.getConnection();
        const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers)
            .updateOne({ _id: user._id }, { $set: { password: bcrypt.hashSync(password, 9) } });
        return result;
    } catch (error) {
        console.log(error);
        throw new Error('Error en data - user - verifyCode(user_id, code): ', error);
    }
}

async function generateCode(email) {
    try {
        const user = await getUserEmail(email);
        if (!user) {
            throw new Error('Usuario no existe')
        }
        const code = parseInt(Math.floor(Math.random() * (999999 - 100000) + 100000));
        const mongoClient = await connection.getConnection();
        const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers)
            .updateOne({ _id: user._id }, { $set: { codeVerification: code, verifiedCode: false } });
        sendEmail.sendEmail(email, 'Hanuka Codigo de Verificación', code);
        return result;
    } catch (error) {
        throw new Error('Error en data - user - generateCode(email): ', error);
    }
}

async function updateImage(user_id, newImage, item) {
    try {
        let user = await getUserId(user_id);
        if (!user) {
            throw new Error('Usuario no existe')
        }
        const imagePrevious = user.image_profile;
        const mongoClient = await connection.getConnection();
        const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers)
            .updateOne({ _id: user._id }, { $set: { [item]: newImage } });
        deleteImagePrevious(imagePrevious);
        return result;
    } catch (error) {
        throw new Error('Error en data - user - updateImage(user_id, newImage): ', error);
    }

}

function deleteImagePrevious(nameImage) {
    let user_profile = 'img-user-profile.jpg'
    const name = nameImage.split('/').pop();
    if (name != user_profile)
        multer.deleteS3Profile(name);
}

async function generateJWT(user) {
    try {
        const token = jwt.sign({ email: user.email, name: user.name, verified: user.verified, date: user.date_creation }, process.env.JWT_SECRET, { expiresIn: '90d' });
        return token;
    } catch (error) {
        throw new Error('Error en data - user - generateJWT(user): ', error);
    }
}

async function addGroupAdmin(id_user, id_group) {
    try {
        const mongoClient = await connection.getConnection();
        const result_user = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers)
            .updateOne({ _id: new ObjectId(id_user) }, { $addToSet: { groups_created: new ObjectId(id_group) } });
        return result_user;
    } catch (error) {
        throw new Error('Error en data - user - addGroupAdmin(id_user, id_group): ', error);
    }
}

async function getUsers(ids) {
    try {
        const mongoClient = await connection.getConnection();
        const users = await mongoClient.db(process.env.nameDB).collection(process.env.collectionUsers).find({ _id: { $in: ids } }).toArray();
        return users;
    } catch (error) {
        throw new Error('Error en data - user - getUsers(ids): ', error);
    }
}

export default {
    loginWithGoogle,
    getUserId,
    updateImage,
    generateJWT,
    getUserEmail,
    addGroupAdmin,
    getUsers,
    register,
    verifyCode,
    login,
    generateCode,
    changePassword,
};

