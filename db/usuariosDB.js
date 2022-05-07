const connection = require('./connections')
let ObjectId = require('mongodb').ObjectId;


    // # Obetener todos los usuario
   async function getUsuarios() {
       const clientMongo = await connection.getConnection();
       const usuarios = await clientMongo
       .db("sportApp")
       .collection("usuarios")
       .find()
       .toArray();
       return usuarios;
    }

    // # Agregar un Usuario
async function addUser(user){
  const connectiondb = await connection.getConnection();
  user.password = bcrypt.hashSync(user.password, 8);

  const result = await connectiondb.db('sportApp')
                          .collection('usuarios')
                          .insertOne(user);
  return result;
}