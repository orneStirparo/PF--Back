import express from "express";
import categoryControllers from "../db/categoryDB.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const categories = await categoryControllers.getCategories();
        if (categories.length > 0)
            return res.json({ "success": true, data: categories });
        else
            return res.json({ "success": false, message: "No categories found." });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

export default router;