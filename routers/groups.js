import express from "express";
import groupsControllers from "../db/groupsDB.js";
import auth from "../middleware/auth.js";
// import multer from "../middleware/multerS3.js";

const router = express.Router();

router.get('/user/:id', auth, async (req, res) => {
    let { id } = req.params;
    try {
        if (id) {
            const groups = await groupsControllers.getGroupsUser(id);
            return res.status(200).json({ success: true, data: groups });
        } else
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'id'" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.post('/', auth, async (req, res) => {
    let { name, category, visibility, city, town, email_owner, whatsApp, instagram } = req.body;
    console.log(email.email_owner);
    try {
        if (!name || !category || !visibility || !email_owner || !city || !town || !whatsApp) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'name', 'category', 'visibility', 'email_owner' 'city' 'town' 'whatsApp'" });
        } else {
            let newGroup = await groupsControllers.addGroup(req.body);
            if (newGroup)
                return res.status(201).json({ success: true, data: newGroup });
            else
                return res.status(400).json({ success: false, message: "Ya existe un grupo con este nombre, intenta con otro" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/:category', auth, async (req, res) => {
    let { category } = req.params;
    try {
        if (!category) {
            return res.status(400).json({ success: false, message: "Parametro requerido'category'." });
        } else {
            let group = await groupsControllers.getGroupCategory(category);
            console.log('GRUPO => ', group);
            if (group.length > 0)
                return res.status(200).json({ success: true, data: group });
            else
                return res.status(400).json({ success: false, message: "No existen grupos de este tipo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.post('/user', auth, async (req, res) => {
    let { group_id, user_id } = req.body;
    try {
        if (!group_id || !user_id) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'group_id', 'user_id'" });
        } else {
            let newFolower = await groupsControllers.adduserGroup(user_id, group_id);
            console.log('newFolower => ', newFolower);
            if (newFolower)
                return res.status(201).json({ success: true, data: newFolower });
            else
                return res.status(400).json({ success: false, message: "Ya existe un usuario en este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

// router.post('/image/:id', auth, multer.uploadS3Groups.single('image'), async (req, res) => {
//     console.log('req.file: ', req.file);
//     try {
//         if (req.file && req.params.id && req.body.item) {
//             console.log(req.file.location);
//             const userId = await groupsControllers.updateImage(req.params.id, req.file.location, req.body.item);
//             return res.json({ success: true, message: "Image uploaded successfully", data: req.file.location });
//         } else {
//             return res.json({ success: false, message: "Image upload failed" });
//         }
//     } catch (error) {
//         return res.json({ success: false, message: "Image upload failed" });
//     }

// })

router.get('/requestsFollowers/:id', auth, async (req, res) => {
    try {
        if (req.params.id) {
            const requests = await groupsControllers.getRequestsFollowers(req.params.id);
            if (requests)
                return res.status(200).json({ success: true, data: requests });
        } else {
            return res.status(400).json({ success: false, message: "'id' requerido para la peticion" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.post('/userAccept', auth, async (req, res) => {
    let { group_id, user_id } = req.body;
    try {
        if (!group_id || !user_id) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'group_id', 'user_id'" });
        } else {
            let newFollower = await groupsControllers.postUserAccept(user_id, group_id);
            if (newFollower)
                return res.status(201).json({ success: true, data: newFollower });
            else
                return res.status(400).json({ success: false, message: "Ya existe un usuario en este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.delete('/userDelete', auth, async (req, res) => {
    let { group_id, user_id } = req.body;
    try {
        if (!group_id || !user_id) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'group_id', 'user_id'" });
        } else {
            let newFollower = await groupsControllers.deleteUserReject(user_id, group_id);
            if (newFollower)
                return res.status(201).json({ success: true, data: newFollower });
            else
                return res.status(400).json({ success: false, message: "No se pudo rechazar" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/:id', auth, async (req, res) => {
    let { id } = req.params;
    console.log('id: ', id);
    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "Parametro requerido 'id'." });
        } else {
            let group = await groupsControllers.getGroupId(id);
            if (group)
                return res.status(200).json({ success: true, data: group });
            else
                return res.status(400).json({ success: false, message: "No existe este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/following/:id_user', auth, async (req, res) => {
    let { id_user } = req.params;
    try {
        if (!id_user) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_user'." });
        } else {
            let groups = await groupsControllers.getGroupsFollowing(id_user);
            console.log('GRUPO => ', groups);
            if (groups.length > 0)
                return res.status(200).json({ success: true, data: groups });
            else
                return res.status(400).json({ success: false, message: "No existen grupos para este usuario" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/created/:id_user', auth, async (req, res) => {
    let { id_user } = req.params;
    try {
        if (!id_user) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_user'." });
        } else {
            let groups = await groupsControllers.getGroupsCreated(id_user);
            console.log('GRUPO => ', groups);
            if (groups.length > 0)
                return res.status(200).json({ success: true, data: groups });
            else
                return res.status(400).json({ success: false, message: "No existen grupos para este usuario" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/followers/:id_group', auth, async (req, res) => {
    let { id_group } = req.params;
    try {
        if (!id_group) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_group'." });
        } else {
            let followers = await groupsControllers.getFollowers(id_group);
            if (followers)
                return res.status(200).json({ success: true, data: followers });
            else
                return res.status(400).json({ success: false, message: "No existen grupos para este usuario" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.post('/unfollower', auth, async (req, res) => {
    let { group_id, user_id } = req.body;
    try {
        if (!group_id || !user_id) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'group_id', 'user_id'" });
        } else {
            let unFollower = await groupsControllers.deleteFollow(user_id, group_id);
            if (unFollower)
                return res.status(201).json({ success: true, data: unFollower });
            else
                return res.status(400).json({ success: false, message: "no existe" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.post('/unrequested', auth, async (req, res) => {
    let { group_id, user_id } = req.body;
    try {
        if (!group_id || !user_id) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'group_id', 'user_id'" });
        } else {
            let unRequested = await groupsControllers.deleteRequeted(user_id, group_id);
            if (unRequested)
                return res.status(201).json({ success: true, data: unRequested });
            else
                return res.status(400).json({ success: false, message: "no existe" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.post('/admin/:id_group', auth, async (req, res) => {
    let { id_group } = req.params;
    let { email_admin } = req.body;
    try {
        if (!id_group || !email_admin) {
            return res.status(400).json({ success: false, message: "Parametro requerido 'email_admin'." });
        } else {
            let followers = await groupsControllers.postAdmin(id_group, email_admin);
            if (followers)
                return res.status(200).json({ success: true, data: followers });
            else
                return res.status(400).json({ success: false, message: "No existen usuario o grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})


export default router;