const HistoryService = {
    getAllRoutinesByUserId(knex, user_id) {
        return knex
            .select('*')
            .from('history')
            .where({
                user_id: user_id
            })
    },
    addRoutine(knex, newRoutine) {
        return knex
            .insert(newRoutine)
            .into('history')
            .returning('*')
            .then(([newRoutine]) => newRoutine)
    },
    deleteRoutine(knex, user_id, routine_id) {
        return knex
            .from('history')
            .where({
                user_id: user_id,
                id: routine_id
            })
            .delete();
    }
};

module.exports = HistoryService;