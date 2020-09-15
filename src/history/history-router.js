const express = require('express');
const path = require('path');
const HistoryService = require('./history-service');
const { requireAuth } = require('../middleware/jwt-auth');
const xss = require('xss');

const historyRouter = express.Router();
const jsonBodyParser = express.json();

const serializeRoutine = routine => ({
    id: routine.id,
    user_id: routine.user_id,
    date_created: routine.date_created,
    routine_date: routine.routine_date,
    routine_title: xss(routine.routine_title),
    routine_exercises: xss(routine.routine_exercises),
    routine_input: xss(routine.routine_input)
})

historyRouter
    .route('/')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { user_id, routine_date, routine_title, routine_exercises, routine_input } = req.body;

        const newRoutine = {
            user_id, 
            routine_date,
            routine_title,
            routine_exercises,
            routine_input
        }
        
        for (const field of [ 'user_id', 'routine_date', 'routine_title', 'routine_exercises', 'routine_input'])
            if(!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
            })

        return HistoryService.addRoutine(knexInstance, newRoutine)
            .then((routine) => {
                res.status(201)
                .location(path.posix.join(req.originalUrl, `/${routine.id}`))
                .json(serializeRoutine(routine))
            })
            .catch(next);        
    });

historyRouter
    .route('/:user_id')
    .all(requireAuth)
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        const { user_id } = req.params;

        HistoryService.getAllRoutinesByUserId(knexInstance, user_id)
            .then(routine => {
                res
                    .status(200)
                    .json(routine.map(i => serializeRoutine(i)))
            })
            .catch(next);
    })
    .delete(jsonBodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { user_id, id } = req.body;

        HistoryService.deleteRoutine(knexInstance, user_id, id)
            .then((routine) => {
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = historyRouter;