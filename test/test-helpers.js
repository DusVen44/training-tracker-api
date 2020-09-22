const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function createTestExercises() {
    return [
        {
            id: 45,
            exercise_name: "Barbell Bench Press"
        },
        {
            id: 57,
            exercise_name: "Goblet Squat"
        },
        {
            id: 77,
            exercise_name: "Stationary Bike"
        }
    ];
};

function createTestUsers() {
    return [
        {
            id: 20,
            username: 'user1',
            email: 'user1@gmail.com',
            password: 'password1',
            date_created: '2020-09-16T16:28:32.615Z'
        },
        {
            id: 55,
            username: 'user2',
            email: 'user2@gmail.com',
            password: 'password2',
            date_created: '2020-09-14T16:28:32.615Z'
        },
        {
            id: 79,
            username: 'user3',
            email: 'user3@gmail.com',
            password: 'password3',
            date_created: '2020-09-10T16:28:32.615Z'
        },
    ];
};

function createTestHistory(users) {
    return [
        {
            id: 1,
            user_id: users[0].id,
            date_created: '2020-09-16T16:28:32.615Z',
            routine_date: '2020-09-16T16:28:32.615Z',
            routine_title: 'Title1',
            routine_exercises: ['A bunch of Exercises 1'],
            routine_input: ['User Input 1']
        },
        {
            id: 2,
            user_id: users[0].id,
            date_created: '2020-09-16T16:28:32.615Z',
            routine_date: '2020-09-16T16:28:32.615Z',
            routine_title: 'Title2',
            routine_exercises: ['A bunch of Exercises 2'],
            routine_input: ['User Input 2']
        },
        {
            id: 3,
            user_id: users[0].id,
            date_created: '2020-09-16T16:28:32.615Z',
            routine_date: '2020-09-16T16:28:32.615Z',
            routine_title: 'Title3',
            routine_exercises: ['A bunch of Exercises 3'],
            routine_input: ['User Input 3']
        },
    ];
};

function makeFixtures() {
    const testUsers = createTestUsers();
    const testHistory = createTestHistory(testUsers);
    const testExercises = createTestExercises();

    return { testUsers, testHistory, testExercises };
};

function clearTables(db) {
    return db.raw(
        `TRUNCATE history, users, exercises RESTART IDENTITY CASCADE`
    );
};

function seedExercises(db, exercises) {
    return db
        .into('exercises')
        .insert(exercises)
        .then (() => {
            db.raw('SELECT setval(\'exercises_id_seq\', ?)', [
                exercises[exercises.length -1].id
            ])
        }); 
};

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));
    return db
        .into('users')
        .insert(preppedUsers)
        .then(() => {
            db.raw('SELECT setval(\'users_id_seq\', ?)', [
                users[users.length - 1].id
            ]) 
        });
};

function seedHistory(db, history, users) {
    return db.transaction(async (trx) => {
        await seedUsers(trx, users);
        await trx.into('history').insert(history);
        await trx.raw('SELECT setval(\'history_id_seq\', ?)', [
            history[history.length - 1].id,
        ]);
    });
};

function seedOtherTables(db, history, users) {
    return db.transaction(async (trx) => {
        await seedUsers(trx, users);
        await trx.into('history').insert(history);
        await trx.raw('SELECT setval(\'history_id_seq\', ?)', [
            history[history.length - 1].id,
        ]);
    });
};

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.username,
      algorithm: 'HS256',
    });
    return `Bearer ${token}`
  };

module.exports = {
    createTestExercises,
    createTestUsers,
    createTestHistory,
    makeFixtures,
    clearTables,
    seedExercises,
    seedUsers,
    seedHistory,
    seedOtherTables,
    makeAuthHeader
};