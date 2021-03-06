import connection from "./connection.js";
import dotenv from "dotenv";
dotenv.config();
 
async function getCategories() {
    try {
        const mongoClient = await connection.getConnection();
        const categories = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_2).find().toArray();
        return categories;
    } catch (error) {
        throw new Error('Error en data - category - getCategories(): ',error);
    }
}

export default { getCategories };