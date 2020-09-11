const path = require('path');
const express = require('express');
const xss = require('xss');
const ExercisesService = require('./exercises-service');

const exercisesRouter = express.Router();
const jsonParser = express.json();

const serializeExercise = exercise => ({
    id: exercise.id,
    exercise_name: xss(exercise.exercise_name),
    exercise_type: xss(exercise.exercise_type),
    set_count: xss(exercise.set_count),
    lbs: xss(exercise.lbs),
});

exercisesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ExercisesService.getAllExercises(knexInstance)
            .then(exercises => {
                res.json(exercises.map(serializeExercise))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { exercise_name, exercise_type } = req.body;
        const newExercise = { exercise_name, exercise_type, set_count, lbs };

        for (const[key, value] of Object.entries(newExercise))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
        
        ExercisesService.addExercise(
            req.app.get('db'),
            newExercise
        )
            .then(exercise => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${exercise.id}`))
                    .json(serializeExercise(exercise))
            })
            .catch(next)
    })

module.exports = exercisesRouter;