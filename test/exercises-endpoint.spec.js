const knex = require('knex');
const app = require('../src/app');
const Helpers = require('./test-helpers');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Exercises Endpoint Test', () => {
    let db;

    const { testExercises, testUsers } = Helpers.makeFixtures();

    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
      });
  
    after('disconnect from db', () => db.destroy());
    before('cleanup', () => Helpers.clearTables(db));
    afterEach('cleanup', () => Helpers.clearTables(db));

    describe('POST /api/exercises', () => {
        beforeEach('Insert Exercises', () => {
            Helpers.seedExercises(db, testExercises)
        });

        it('Responds 201 and adds Exercise to database', () => {
            const newExercise = {
                id: 25,
                exercise_name: 'Treadmill'
            };

        return supertest(app)
            .post('/api/exercises')
            .send(newExercise)
            .expect(201)
            .expect((res) => {
                expect(res.body).to.have.property('id');
                expect(res.body.exercise_name).to.eql(newExercise.exercise_name);
            });
        });
    });
    });