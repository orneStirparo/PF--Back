import express from "express";
import eventsControllers from "../data/events.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/api/v1/event/:group_id', auth, async (req, res) => {
    /* coordinates, namePlace, */
    let { title, date, time, timeUnix, lugar,  description } = req.body;
    let { group_id } = req.params;
    console.log(req.body);
    console.log(req.params);
    try {
        if (!title || !date || !time || !timeUnix  || !lugar || !description || !group_id) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'title', 'date', 'time', 'timeUnix' 'coordinates' 'namePlace' 'description'" });
        } else {
            let newEvent = await eventsControllers.addEvent(req.body, group_id);
            if (newEvent)
                return res.status(201).json({ success: true, data: newEvent });
            else
                return res.status(400).json({ success: false, message: "No se pudo registrar el evento" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/api/v1/events/:id_user', auth, async (req, res) => {
    let { id_user } = req.params;
    try {
        if (!id_user) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_user'." });
        } else {
            let events = await eventsControllers.getEvents(id_user);
            if (events)
                return res.status(200).json({ success: true, data: events });
            else
                return res.status(400).json({ success: false, message: "No existen eventos de este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.post('/api/v1/event/assist/:event_id', auth, async (req, res) => {
    let { id_user } = req.body;
    let { event_id } = req.params;
    try {
        if (!event_id || !id_user) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'id_user'" });
        } else {
            let assist = await eventsControllers.addAssist(id_user, event_id);
            if (assist)
                return res.status(201).json({ success: true, data: assist });
            else
                return res.status(400).json({ success: false, message: "No se pudo registrar el evento" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/api/v1/event/:id', auth, async (req, res) => {
    let { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id'." });
        } else {
            let event = await eventsControllers.getEvent(id);
            if (event)
                return res.status(200).json({ success: true, data: event });
            else
                return res.status(400).json({ success: false, message: "No existen eventos de este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/api/v1/event/assistants/:id_event', auth, async (req, res) => {
    let { id_event } = req.params;
    try {
        if (!id_event) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_event'." });
        } else {
            let assistants = await eventsControllers.getAssistants(id_event);
            if (assistants)
                return res.status(200).json({ success: true, data: assistants });
            else
                return res.status(400).json({ success: false, message: "No existen eventos de este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/api/v1/event/reject/:id_event', auth, async (req, res) => {
    let { id_event } = req.params;
    try {
        if (!id_event) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_event'." });
        } else {
            let assistants = await eventsControllers.getRejects(id_event);
            if (assistants)
                return res.status(200).json({ success: true, data: assistants });
            else
                return res.status(400).json({ success: false, message: "No existen eventos de este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.delete('/api/v1/event/assist/:event_id', auth, async (req, res) => {
    let { id_user } = req.body;
    let { event_id } = req.params;
    try {
        if (!event_id || !id_user) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'id_user'" });
        } else {
            let noAssist = await eventsControllers.addNoAssist(id_user, event_id);
            if (noAssist)
                return res.status(201).json({ success: true, data: noAssist });
            else
                return res.status(400).json({ success: false, message: "No se pudo eliminar el evento" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/api/v1/events/group/:id_group', auth, async (req, res) => {
    let { id_group } = req.params;
    try {
        if (!id_group) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_group'." });
        } else {
            let events = await eventsControllers.getEventsGroupAll(id_group);
            if (events)
                return res.status(200).json({ success: true, data: events });
            else
                return res.status(400).json({ success: false, message: "No existen eventos de este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.get('/api/v1/events/user/:id_user', auth, async (req, res) => {
    let { id_user } = req.params;
    try {
        if (!id_user) {
            return res.status(400).json({ success: false, message: "Parametro requerido'id_user'." });
        } else {
            let events = await eventsControllers.getEventsUserAll(id_user);
            if (events)
                return res.status(200).json({ success: true, data: events });
            else
                return res.status(400).json({ success: false, message: "No existen eventos de este grupo" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

router.delete('/api/v1/event/', auth, async (req, res) => {
    let { id } = req.body;
    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "Es requerido el parametro 'id'" });
        } else {
            let newEvent = await eventsControllers.deleteEvent(id);
            if (newEvent)
                return res.status(201).json({ success: true, data: newEvent });
            else
                return res.status(400).json({ success: false, message: "No se pudo eliminar el evento" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
})

export default router;