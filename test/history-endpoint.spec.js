const knex = require('knex');
const app = require('../src/app');
const Helpers = require('./test-helpers');
const supertest = require('supertest');
const { expect } = require('chai');

describe('History Endpoint Test', () => {
    let db;

    const { testUsers, testHistory } = Helpers.makeFixtures();
    const testUser = testUsers[0];

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

    describe('POST /api/history', () => {
        beforeEach('insert data', () =>
            Helpers.seedOtherTables(db, testHistory, testUsers));

        it('Responds 201 and creates a History Routine', () => {
            const newRoutine = {
                id: 20,
                user_id: testUser.id,
                date_created: '2020-04-28T00:00:00.000Z',
                routine_date: '2020-04-28T00:00:00.000Z',
                routine_title: 'Routine Test Title',
                routine_exercises: ['Barbell Bench Press'],
                routine_input: ['Test Routine Input']
            };

            return supertest(app)
                .post('/api/history')
                .set('Authorization', Helpers.makeAuthHeader(testUser))
                .send(newRoutine)
                .expect(201)
                .expect ((res) => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.user_id).to.eql(newRoutine.user_id);
                    expect(res.body.date_created).to.be.a('string');
                    expect(res.body.routine_date).to.eql(newRoutine.routine_date);
                    expect(res.body.routine_title).to.eql(newRoutine.routine_title);
                    expect(res.body.routine_exercises).to.be.a('string');
                    expect(res.body.routine_input).to.be.a('string');
                });
        });
    });
});