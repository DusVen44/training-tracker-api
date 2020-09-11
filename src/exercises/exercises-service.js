const ExercisesService = {
    getAllExercises(knex) {
        return knex.select('*').from('exercises');
    },
    addExercise(knex, newExercise) {
        return knex
            .insert(newExercise)
            .into('exercises')
            .returning('*')
            .then(([exercise]) => exercise)
    }
}

module.exports = ExercisesService;