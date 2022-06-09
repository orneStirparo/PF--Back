import express from "express";
import userControllers from "../data/user.js";
import dotenv from "dotenv";
import auth from "../middleware/auth.js";
import multer from "../middleware/multerS3.js";
dotenv.config();

const router = express.Router();
router.post('/api/v1/user/image/:id', auth, multer.uploadS3Profile.single('image'), async (req, res) => {
    try {
        if (req.file && req.params.id && req.body.item) {
            console.log(req.file.location);
            const userId = await userControllers.updateImage(req.params.id, req.file.location, req.body.item);
            return res.json({ success: true, message: "Image uploaded successfully", data: req.file.location });
        } else {
            return res.json({ success: false, message: "Image upload failed" });
        }
    } catch (error) {
        return res.json({ success: false, message: "Image upload failed" });
    }

})

router.post('/api/v1/loginGoogle', async (req, res) => {
    let { Token } = req.body;
    console.log('Token: ', Token);
    try {
        if (Token) {
            const userLogin = await userControllers.loginWithGoogle(Token);
            const token = await userControllers.generateJWT(userLogin);
            return res.json({ success: true, data: userLogin, accessToken: token });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar el Token" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/api/v1/login', async (req, res) => {
    let { email, password } = req.body;
    try {
        if (email && password) {
            const userLogin = await userControllers.login(email, password);
            const token = await userControllers.generateJWT(userLogin);
            return res.json({ success: true, data: userLogin, accessToken: token });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar los datos, email-password" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/api/v1/register', async (req, res) => {
    let { name, email, password } = req.body;
    try {
        if (name && email && password) {
            const userRegister = await userControllers.register(name, email, password);
            return res.json({ success: true, data: userRegister });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, name-email-password" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/api/v1/user/generate.code', async (req, res) => {
    let { email } = req.body;
    try {
        if (email) {
            const code = await userControllers.generateCode(email);
            return res.json({ success: true, data: code });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, email" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/api/v1/codeVerification', async (req, res) => {
    let { email, codeVerification } = req.body;
    try {
        if (email && codeVerification) {
            const userCodeVerification = await userControllers.verifyCode(email, codeVerification);
            return res.json({ success: true, data: userCodeVerification });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, email-codeVerification" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.post('/api/v1/user/change.password', async (req, res) => {
    let { email, password, repeatPassword, code } = req.body;
    try {
        if (email && code && password && repeatPassword) {
            const userCodeVerification = await userControllers.changePassword(email, code, password, repeatPassword);
            return res.json({ success: true, data: userCodeVerification });
        } else
            return res.status(401).json({ success: false, message: "Se requiere enviar todos los datos, email-password-repetPassword-code" });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message })
    }
})

router.get('/api/v1/user/:id', auth, async (req, res) => {
    let { id } = req.params;
    try {
        if (id) {
            const user = await userControllers.getUserId(id);
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