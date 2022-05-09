import express from "express";
import dotenv from "dotenv";
import auth from "../middleware/auth.js";
import usersDB from "../db/usersDB.js";
dotenv.config();

const router = express.Router();

router.post('/login.google', async (req, res) => {
    const { Token } = req.body;
    console.log(Token);
    try {
        if (Token) {
            const userLogin = await usersDB.loginWithGoogle(Token);
            const token = await usersDB.generateJWT(userLogin);
            return res.json({ success: true, data: userLogin, accessToken: token });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar el Token" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/register', async (req, res) => {
    let { name, email, password } = req.body;
    try {
        if (name && email && password) {
            const userRegister = await usersDB.register(name, email, password);
            return res.json({ success: true, data: userRegister });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, name-email-password" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})


router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        if (id) {
            const user = await usersDB.getUserId(id);
            if (user)
                return res.status(200).json({ success: true, data: user });
        } else {
            return res.status(400).json({ success: false, message: "'id' requerido para la peticion" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

export default router;