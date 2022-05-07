import express from "express";
import dotenv from "dotenv";
import auth from "../middleware/auth.js";
import usersDB from "../db/usersDB.js";
dotenv.config();

const router = express.Router();
// router.post('user/image/:id', auth, multer.uploadS3Profile.single('image'), async (req, res) => {
//     try {
//         if (req.file && req.params.id && req.body.item) {
//             console.log(req.file.location);
//             const userId = await usersDB.updateImage(req.params.id, req.file.location, req.body.item);
//             return res.json({ success: true, message: "Image uploaded successfully", data: req.file.location });
//         } else {
//             return res.json({ success: false, message: "Image upload failed" });
//         }
//     } catch (error) {
//         return res.json({ success: false, message: "Image upload failed" });
//     }

// })

router.post('/loginGoogle', async (req, res) => {
    let { Token } = req.body;
    console.log('Token: ', Token);
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

router.post('/login', async (req, res) => {
    let { email, password } = req.body;
    try {
        if (email && password) {
            const userLogin = await usersDB.login(email, password);
            const token = await usersDB.generateJWT(userLogin);
            return res.json({ success: true, data: userLogin, accessToken: token });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar los datos, email-password" });
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

router.post('/user/generate.code', async (req, res) => {
    let { email } = req.body;
    try {
        if (email) {
            const code = await usersDB.generateCode(email);
            return res.json({ success: true, data: code });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, email" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/codeVerification', async (req, res) => {
    let { email, codeVerification } = req.body;
    try {
        if (email && codeVerification) {
            const userCodeVerification = await usersDB.verifyCode(email, codeVerification);
            return res.json({ success: true, data: userCodeVerification });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, email-codeVerification" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/user/change.password', async (req, res) => {
    let { email, password, repeatPassword, code } = req.body;
    try {
        if (email && code && password && repeatPassword) {
            const userCodeVerification = await usersDB.changePassword(email, code, password, repeatPassword);
            return res.json({ success: true, data: userCodeVerification });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, email-password-repetPassword-code" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.get('/user/:id', auth, async (req, res) => {
    let { id } = req.params;
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