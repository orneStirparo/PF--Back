import connection from "./connection.js";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import userControllers from "./user.js";
import multer from "../middleware/multerS3.js";
dotenv.config();

async function getGroup(name) {
    try {
        name = name.toLowerCase().trim();
        const mongoClient = await connection.getConnection();
        const group = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).findOne({ name: name });
        return group;
    } catch (error) {
        throw new Error('Error en data - groups - getGroup(name): ', error);
    }
}

async function getArrayGroup(ids) {
    try {
        const mongoClient = await connection.getConnection();
        let arrayGroup = [];
        for (let i = 0; i < ids.length; i++) {
            try {
                const group = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).findOne({ _id: new ObjectId(ids[i]) });
                arrayGroup.push(group);
            } catch (error) {
                throw new Error('Error en data - groups - getArrayGroup(ids): ', error);
            }
        }
        return arrayGroup;
    } catch (error) {
        throw new Error('Error en data - groups - getArrayGroup(ids): ', error);
    }
}

async function getGroupId(id) {
    try {
        console.log(id);
        const mongoClient = await connection.getConnection();
        const group = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).findOne({ _id: new ObjectId(id) });
        return group;
    } catch (error) {
        throw new Error('Error en data - groups - getGroupId(id): ', error);
    }
}

async function getGroupCategory(category) {
    try {
        category = category.toLowerCase().trim();
        const mongoClient = await connection.getConnection();
        const groups = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).find({ category: category }).toArray();
        return groups;
    } catch (error) {
        throw new Error('Error en data - groups - getGroupCategory(category): ', error);
    }
}

async function addGroup(group) {
    try {
        const user = await userControllers.getUserEmail(group.email_owner);
        if (user) {
            let result = undefined;
            group.nameAvatar = group.name.trim();
            group.name = group.name.toLowerCase().trim();
            group.email_owner = group.email_owner.toLowerCase().trim();
            group.category = group.category.toLowerCase().trim();
            if (group.category != 'bikers' && group.category != 'runners' && group.category != 'fitness')
                throw new Error('La categoria debe ser "bikers", "runners" o "fitness"');
            group.visibility = group.visibility.toLowerCase().trim();
            group.city = group.city.toLowerCase().trim();
            group.town = group.town.toLowerCase().trim();
            group.date_creation = Date.parse(new Date());
            group.administrators = [];
            group.image_profile = process.env.IMAGE_GROUP;
            group.image_front_page = process.env.IMAGE_GROUP_FRONT_PAGE;
            group.followers = [];
            group.requests = [];
            group.whatsApp = group.whatsApp.toLowerCase().trim();
            if (group.instagram.length > 0) {
                group.instagram = group.instagram.trim();
            } else {
                group.instagram = '';
            }
            group.verified = false;
            const group_exist = await getGroup(group.name);
            if (!group_exist) {
                const mongoClient = await connection.getConnection();
                result = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).insertOne(group);
                if (result) {
                    const addGroupAdmin = await userControllers.addGroupAdmin(user._id, result.insertedId);
                }
            }
            return result;
        }
        return null;
    } catch (error) {
        console.log(error);
        throw new Error('Error en data - groups - addGroup(group): ', error);
    }
}

async function getGroupsUser(id) {
    try {
        const user = await userControllers.getUserId(id);
        if (user.groups_created.length > 0) {
            const arrayGroup = await getArrayGroup(user.groups_created);
            return arrayGroup;
        } else
            return [];
    } catch (error) {
        throw new Error('Error en data - groups - getGroupsUser(id): ', error);
    }
}

async function adduserGroup(user_id, group_id) {
    try {
        const user = await userControllers.getUserId(user_id);
        const group = await getGroupId(group_id);
        if (user && group) {
            const mongoClient = await connection.getConnection();
            let result_user;
            let result_group;
            if (group.visibility == 'public') {
                let ya_existe_group = user.groups_following.find(e => e == group_id)
                let ya_existe_user = group.followers.find(e => e == user_id)
                if (ya_existe_group || ya_existe_user)
                    throw new Error('El usuario ya esta en el grupo')
                result_user = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_1).updateOne({ _id: new ObjectId(user_id) }, { $addToSet: { groups_following: group._id } });
                result_group = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).updateOne({ _id: new ObjectId(group_id) }, { $addToSet: { followers: user._id } });
            } else {
                let ya_existe_group = user.groups_requested.find(e => e == group_id)
                let ya_existe_user = group.requests.find(e => e == user_id)
                if (ya_existe_group || ya_existe_user)
                    throw new Error('El usuario ya esta en el grupo')

                result_user = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_1).updateOne({ _id: new ObjectId(user_id) }, { $addToSet: { groups_requested: group._id } });
                result_group = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).updateOne({ _id: new ObjectId(group_id) }, { $addToSet: { requests: user._id } });
            }

            return { user: result_user, group: result_group };
        }
        return null;
    } catch (error) {
        throw new Error(error);
    }
}

async function updateImage(group_id, newImage, item) {
    try {
        let group = await getGroupId(group_id);
        if (!group) {
            throw new Error('El grupo no exite')
        }
        const imagePrevious = group[item];
        const mongoClient = await connection.getConnection();
        const result = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3)
            .updateOne({ _id: group._id }, { $set: { [item]: newImage } });
        deleteImagePrevious(imagePrevious);
        return result;
    } catch (error) {
        throw new Error('Error en data - group - updateImage(group_id, newImage): ', error);
    }

}

function deleteImagePrevious(nameImage) {
    let gProfile = 'img-group-profile.jpg'
    let gPortada = 'img-portada.jpg'
    const name = nameImage.split('/').pop();
    if (name != gProfile && name != gPortada)
        multer.deleteS3Group(name);
}

async function getRequestsFollowers(id_user) {
    try {
        const user = await userControllers.getUserId(id_user);
        console.log(user);
        if (user && user.groups_created.length > 0) {
            const groups = await getArrayGroup(user.groups_created);
            const requests = await getGroupsUserRequest(groups);
            return requests;
        } else
            throw new Error('Usuario no existe');
    } catch (error) {
        throw new Error('Error en data - user - getRequestsFollowers(id_user): ', error);
    }
}

async function getGroupsUserRequest(groups) {
    let requests = [];
    let cont = 0;
    try {
        for (let i = 0; i < groups.length; i++) {
            try {
                if (groups[i].requests.length > 0) {
                    for (let j = 0; j < groups[i].requests.length; j++) {
                        try {
                            const user = await userControllers.getUserId(groups[i].requests[j]);
                            if (user) {
                                requests.push({
                                    id: ++cont,
                                    id_group: groups[i]._id,
                                    nameAvatar: groups[i].nameAvatar,
                                    id_user: user._id,
                                    name_user: user.name,
                                    image_user: user.image_profile,
                                });
                            }
                        } catch (error) {
                            throw new Error('Error en data - user - getGroupsUserRequest(groups): 2do FOR', error);
                        }
                    }
                }
            } catch (error) {
                throw new Error('Error en data - user - getGroupsUserRequest(groups): 1er FOR', error);
            }
        }
        return requests;
    } catch (error) {
        throw new Error('Error en data - user - getGroupsUserRequest(groups): ', error);
    }
}

async function postUserAccept(id_user, id_group) {
    try {
        const group = await getGroupId(id_group);
        if (!group)
            throw new Error('El grupo o usuario no existe')
        const user = await userControllers.getUserId(id_user);
        if (!user)
            throw new Error('El usuario no existe')
        const mongoClient = await connection.getConnection();

        const accept_user_group_following = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_1)
            .updateOne({ _id: new ObjectId(id_user) }, { $addToSet: { groups_following: group._id } });
        const delete_user_group_requested = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_1)
            .updateOne({ _id: new ObjectId(id_user) }, { $pull: { groups_requested: group._id } });

        const accept_user_group_follower = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3)
            .updateOne({ _id: new ObjectId(id_group) }, { $addToSet: { followers: user._id } });
        const delete_user_group_requests = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3)
            .updateOne({ _id: new ObjectId(id_group) }, { $pull: { requests: user._id } });

        if (accept_user_group_following && delete_user_group_requested && accept_user_group_follower && delete_user_group_requests)
            return {
                userAccept: accept_user_group_following,
                userDelete: delete_user_group_requested,
                groupAccept: accept_user_group_follower,
                groupDelete: delete_user_group_requests
            };
        return null;
    } catch (error) {
        throw new Error('Error en data - group - postUserAccept(id_group, id_user): ', error);
    }
}

async function deleteUserReject(id_user, id_group) {
    try {
        const group = await getGroupId(id_group);
        if (!group)
            throw new Error('El grupo o usuario no existe')
        const user = await userControllers.getUserId(id_user);
        if (!user)
            throw new Error('El usuario no existe')
        const mongoClient = await connection.getConnection();

        const delete_user_group_requested = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_1)
            .updateOne({ _id: new ObjectId(id_user) }, { $pull: { groups_requested: group._id } });

        const delete_user_group_requests = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3)
            .updateOne({ _id: new ObjectId(id_group) }, { $pull: { requests: user._id } });

        if (delete_user_group_requested && delete_user_group_requests)
            return {
                userDelete: delete_user_group_requested,
                groupDelete: delete_user_group_requests
            };
        return null;
    } catch (error) {
        throw new Error('Error en data - group - deleteUserReject(id_group, id_user): ', error);
    }
}

async function getGroupsFollowing(id_user) {
    try {
        const user = await userControllers.getUserId(id_user);
        if (user && user.groups_following.length > 0) {
            const groups = await getArrayGroup(user.groups_following);
            return groups;
        } else
            throw new Error('Usuario no existe');
    } catch (error) {
        throw new Error('Error en data - user - getGroupsFollowing(id_user): ', error);
    }
}

async function getGroupsCreated(id_user) {
    console.log('getGroupsCreated', id_user);
    try {
        const user = await userControllers.getUserId(id_user);
        if (user && user.groups_created.length > 0) {
            const groups = await getArrayGroup(user.groups_created);
            return groups;
        } else
            throw new Error('Usuario no existe');
    } catch (error) {
        throw new Error('Error en data - user - getGroupsFollowing(id_user): ', error);
    }
}

async function getFollowers(id_group) {
    try {
        const group = await getGroupId(id_group);
        if (group) {
            console.log('getFollowers', group.followers);
            const followers = await userControllers.getUsers(group.followers);
            //console.log('getFollowers', followers);
            if (followers.length > 0)
                return followers;
        }
        return [];
    } catch (error) {
        throw new Error('Error en data - user - getFollowing(id_group: ', error);
    }
}

async function deleteFollow(id_user, id_group) {// elimina un user de un grupo y del mismo usuario
    try {
        const user = await userControllers.getUserId(id_user);
        if (!user)
            throw new Error('El usuario no existe');
        const group = await getGroupId(id_group);
        if (!group)
            throw new Error('El grupo no existe');
        const mongoClient = await connection.getConnection();
        const delete_user_group_following = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_1).updateOne({ _id: new ObjectId(id_user) }, { $pull: { groups_following: group._id } });
        const delete_user_group_follower = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).updateOne({ _id: new ObjectId(id_group) }, { $pull: { followers: user._id } });
        return {
            userDelete: delete_user_group_following,
            groupDelete: delete_user_group_follower
        }
    } catch (error) {
        throw new Error('Error en data - group - unFollowGroup(id_user, id_group): ', error);
    }
}

async function deleteRequeted(id_user, id_group) {//elimina un user de un grupo y del mismo usuario
    try {
        const user = await userControllers.getUserId(id_user);
        if (!user)
            throw new Error('El usuario no existe');
        const group = await getGroupId(id_group);
        if (!group)
            throw new Error('El grupo no existe');

        const mongoClient = await connection.getConnection();
        const delete_user_group_requests = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_1).updateOne({ _id: new ObjectId(id_user) }, { $pull: { groups_requested: group._id } });
        const delete_user_group_requested = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).updateOne({ _id: new ObjectId(id_group) }, { $pull: { requests: user._id } });

        return {
            userDelete: delete_user_group_requests,
            groupDelete: delete_user_group_requested
        }
    } catch (error) {
        throw new Error('Error en data - group - requestedGroup(id_user, id_group): ', error);
    }
}

async function postAdmin(id_group, email_admin) {
    try {
        email_admin = email_admin.toLowerCase().trim();
        const group = await getGroupId(id_group);
        if (!group)
            throw new Error('El grupo no existe');
        const user = await userControllers.getUserEmail(email_admin);
        if (!user)
            throw new Error('El usuario no existe');
        const mongoClient = await connection.getConnection();
        const update_group = await mongoClient.db(process.env.DBA).collection(process.env.DBA_TABLE_3).updateOne({ _id: new ObjectId(id_group) }, { $addToSet: { administrators: user._id } });
        return update_group;
    } catch (error) {
        throw new Error('Error en data - group - postAdmin(id_group, email_admin): ', error);
    }
}

export default {
    addGroup,
    getGroupCategory,
    getGroupsUser,
    adduserGroup,
    updateImage,
    getRequestsFollowers,
    postUserAccept,
    deleteUserReject,
    getGroupId,
    getGroupsFollowing,
    getGroupsCreated,
    getFollowers,
    deleteFollow,
    deleteRequeted,
    postAdmin
};