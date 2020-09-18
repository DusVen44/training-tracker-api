const knex = require('knex');
const app = require('../src/app');
const Helpers = require('./test-helpers');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

describe('Auth Endpoints TEST', function () {
  let db;

  const { testUsers } = Helpers.makeFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => Helpers.clearTables(db));
  afterEach('cleanup', () => Helpers.clearTables(db));

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => Helpers.seedUsers(db, testUsers));
    const requiredFields = ['username', 'password'];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password,
      };
      it(`Responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, { error: `Missing '${field}' in request body` });
      });
    });
    it('Responds 400 \'Invalid username or password\' when bad username', () => {
      const userInvalidUsername = {
        username: 'user_not',
        password: 'existy',
      };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUsername)
        .expect(400, { error: 'Incorrect Username or Password' });
    });
    it('Responds 400 \'Invalid username or password\' when bad password', () => {
      const userInvalidPassword = {
        email: testUser.email,
        password: 'existy',
      };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidPassword)
        .expect(400, { error: 'Missing \'username\' in request body' });
    });
    it('Responds 200 and JWT auth Token and user ID using secret when valid', () => {
      const userValid = {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          algorithm: 'HS256',
        }
      );
      const expectedID = testUser.id;

      return supertest(app).post('/api/auth/login').send(userValid).expect(200, {
        authToken: expectedToken,
        user_id: expectedID
      });
    });
  });
});
