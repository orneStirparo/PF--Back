import connection from "./connection.js";
import dotenv from "dotenv";
import userControllers from "./usersDB.js";
import groupsControllers from "./groupsDB.js";
import { ObjectId } from "mongodb";

dotenv.config();

async function addEvent(body, group_id) {
    try {
        const event = {
            group_id: new ObjectId(group_id),
            title: body.title.trim(),
            date: body.date,
            time: body.time,
            timeUnix: body.timeUnix,
            coordinates: 'body.coordinates',
            namePlace: 'body.namePlace',
            lugar: body.lugar,
            description: body.description,
            participants: [],
            no_participants: [],
            date_creation: Date.parse(new Date())
        }
        const mongoClient = await connection.getConnection();
        const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents).insertOne(event);
        return result;
    } catch (error) {
        throw new Error('Error en data - event - addEvent(body, group_id): ', error);
    }
}

async function getEvents(id_user) {
    try {
        console.log(Date.parse(new Date()));
        let events = [];
        const user = await userControllers.getUserId(id_user);
        if (user && user.groups_following.length > 0) {
            for (let i = 0; i < user.groups_following.length; i++) {
                const event = await getEventsGroup(user.groups_following[i]);
                if (events && event.events.length > 0) {
                    events.push(event);
                }
            }
        }
        return events;
    } catch (error) {
        console.log(error);
        throw new Error('Error en data - events - getEvents(id_user): ', error);
    }
}

async function getEventsGroup(group_id) {
    try {
        const timeUnix = Date.parse(new Date()) - (1000 * 60 * 3);
        const group = await groupsControllers.getGroupId(group_id);
        if (!group)
            throw new Error('Error en data - events - getEventsGroupAll(group_id): No existe el grupo');
        const mongoClient = await connection.getConnection();
        const events = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
            .find({ group_id: group._id, timeUnix: { $gte: timeUnix } }).toArray();
        return {
            group: group,
            events: events
        }
    } catch (error) {
        throw new Error('Error en data - events - getEventsGroup(group_id): ', error);
    }
}

async function addAssist(id_user, event_id) {
    try {
        const user = await userControllers.getUserId(id_user);
        if (user) {
            const mongoClient = await connection.getConnection();
            const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
                .updateOne({ _id: new ObjectId(event_id) }, { $addToSet: { participants: user._id } });
            const reject = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
                .updateOne({ _id: new ObjectId(event_id) }, { $pull: { no_participants: user._id } });
            return {
                result: result,
                reject: reject
            };
        }
        return null;
    } catch (error) {
        console.log('Error en data - events - addAssist(id_user, event_id): ', error);
        throw new Error('Error en data - events - addAssist(id_user, event_id): ', error);
    }
}

async function addNoAssist(id_user, event_id) {
    try {
        const user = await userControllers.getUserId(id_user);
        const event = await getEvent(event_id);
        if (user && event) {
            const mongoClient = await connection.getConnection();
            const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
                .updateOne({ _id: new ObjectId(event_id) }, { $addToSet: { no_participants: user._id } });
            const reject = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
                .updateOne({ _id: new ObjectId(event_id) }, { $pull: { participants: user._id } });
            return {
                result: result,
                reject: reject
            };
        }
    } catch (error) {
        throw new Error('Error en data - events - addNoAssist(id_user, event_id): ', error);
    }
}

async function getEvent(id) {
    try {
        const mongoClient = await connection.getConnection();
        const event = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents).findOne({ _id: new ObjectId(id) });
        return event;
    } catch (error) {
        throw new Error('Error en data - events - getEvent(id): ', error);
    }
}

async function getAssistants(id_event) {
    try {
        const event = await getEvent(id_event);
        if (event && event.participants.length > 0) {
            const users = await userControllers.getUsers(event.participants);
            if (users)
                return users;
        } else
            return [];
    } catch (error) {
        throw new Error('Error en data - events - getAssistants(id_event): ', error);
    }
}

async function getRejects(id_event) {
    try {
        const event = await getEvent(id_event);
        if (event && event.no_participants.length > 0) {
            const users = await userControllers.getUsers(event.no_participants);
            if (users)
                return users;
        } else
            return [];
    } catch (error) {
        throw new Error('Error en data - events - getRejects(id_event): ', error);
    }
}

async function getEventsGroupAll(group_id) {
    try {
        const group = await groupsControllers.getGroupId(group_id);
        if (!group)
            throw new Error('Error en data - events - getEventsGroupAll(group_id): No existe el grupo');
        const mongoClient = await connection.getConnection();
        const events = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
            .find({ group_id: group._id }).toArray();
        return events;
    } catch (error) {
        throw new Error('Error en data - events - getEventsGroupAll(group_id): ', error);
    }
}

async function getEventsUserAll(user_id) {
    try {
        let data = [];
        const user = await userControllers.getUserId(user_id);
        if (user && user.groups_following.length > 0) {
            for (let i = 0; i < user.groups_following.length; i++) {
                try {
                    const event = await eventsUser(user.groups_following[i], user_id);
                    if (event && event.events.length > 0) {
                        data.push(event);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } else {
            throw new Error('Error en data - events - getEventsUserAll(user_id): No existe el grupo');
        }
        return data;
    } catch (error) {
        console.log(error);
        throw new Error('Error en data - events - getEventsUserAll(user_id): ', error);
    }
}

async function eventsUser(id_group, id_user) {
    try {
        const group = await groupsControllers.getGroupId(id_group);
        if (!group)
            throw new Error('Error en data - events - eventsUser(id_group): No existe el grupo');
        const mongoClient = await connection.getConnection();
        const events = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
            .find({ group_id: group._id, participants: new ObjectId(id_user) }).toArray();
        return {
            group: group,
            events: events
        }
    } catch (error) {
        throw new Error('Error en data - events - eventsUser(user_id): ', error);
    }
}

async function deleteEvent(id) {
    try {
        const mongoClient = await connection.getConnection();
        const result = await mongoClient.db(process.env.nameDB).collection(process.env.collectionEvents)
            .deleteOne({ _id: new ObjectId(id) });
        return result;
    } catch (error) {
        throw new Error('Error en data - events - deleteEvent(id): ', error);
    }
}

export default {
    addEvent,
    getEvents,
    addAssist,
    getEvent,
    getAssistants,
    addNoAssist,
    getEventsGroupAll,
    getEventsUserAll,
    getRejects,
    deleteEvent
}