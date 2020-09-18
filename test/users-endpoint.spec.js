const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const Helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Users Endpoint TEST', function () {
    let db;

    const { testUsers } = Helpers.makeFixtures();
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

    describe('POST /api/users', () => {
        context('User Validation', () => {
            beforeEach('Insert user', () => {
                Helpers.seedUsers(db, testUsers)
            });

            const requiredFields = ['username', 'password', 'email'];

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                  username: 'test username',
                  password: 'Test password',
                  email: 'test@email.com'
                };

                it(`Responds with 400 required error when ${field} is missing`, () => {
                    delete registerAttemptBody[field];

                    return supertest(app)
                        .post('/api/users')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`
                        });
                })
            })

            it('Responds 400 \'Password must be longer than 8 characters\' when empty password', () => {
                const userShortPassword = {
                  username: 'test user',
                  password: 'Test1',
                  email: 'testy'
                };

                return supertest(app)
                    .post('/api/users')
                    .send(userShortPassword)
                    .expect(400, { error: 'Password must be longer than 8 characters' });
            });

            it('Responds 400 \'Password must be shorter than 26 characters\' when long password', () => {
                const userLongPassword = {
                  username: 'test user',
                  password: '*'.repeat(27),
                  email: 'testy'
                };
        
                return supertest(app)
                  .post('/api/users')
                  .send(userLongPassword)
                  .expect(400, { error: 'Password must be shorter than 26 characters' });
              });

            it('Responds 400 when password starts with spaces', () => {
                const userPasswordStartsSpaces = {
                  username: 'test user',
                  password: ' testPassword',
                  email: 'testy'
                };

                return supertest(app)
                .post('/api/users')
                .send(userPasswordStartsSpaces)
                .expect(400, { error: 'Password must not start or end with empty spaces' });
            });
            it('Responds 400 when password ends with spaces', () => {
              const userPasswordStartsSpaces = {
                username: 'test user',
                password: 'testPassword ',
                email: 'testy'
              };
      
              return supertest(app)
                .post('/api/users')
                .send(userPasswordStartsSpaces)
                .expect(400, { error: 'Password must not start or end with empty spaces' });
            });
            it('Responds 400 when password isn\'t complex enough', () => {
              const userSimplePassword = {
                username: 'test name',
                password: 'passwords',
                email: 'testy'
              };
      
              return supertest(app)
                .post('/api/users')
                .send(userSimplePassword)
                .expect(400, { error: 'Password must include an uppercase letter, lowercase letter, and a number' });
            });
            it('Responds 400 \'Username already taken', () => {
              const duplicateUser = {
                username: testUser.username,
                password: 'Password2',
                email: 'testy'
              };
              return supertest(app)
                .post('/api/users')
                .send(duplicateUser)
                .expect(400, { error: 'Username taken' });
            });
          });
          context('Happy path', () => {
            it('Responds 201, serialized User, storing bcryped password', () => {
              const newUser = {
                username: 'test username',
                password: 'Passwordtest3',
                email: 'test@gmail.com'
              };
      
              return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                  expect(res.body).to.have.property('id');
                  expect(res.body.username).to.eql(newUser.username);
                  expect(res.body).to.have.property('password');
                  expect(res.body.email).to.eql(newUser.email);
                })
                .expect(res => {
                  db
                    .from('users')
                    .select('*')
                    .where({ id: res.body.id })
                    .first()
                    .then(row => {
                      expect(row.username).to.eql(newUser.username);
                      expect(row.email).to.eql(newUser.email);
      
                      return bcrypt.compare(newUser.password, row.password);
                    })
                    .then(compareMatch => {
                      expect(compareMatch).to.be.true;
                    });
                });
            });
          });
        });
      });