const express = require('express');
const AuthService = require('./auth-service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authRouter = express.Router();

authRouter
  .route('/login')
  .post(express.json(), (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { username, password } = req.body;
    const loginUser = { username, password };

    if (typeof loginUser.username !== 'undefined' && loginUser.username)
      loginUser.username = username.toLowerCase();
    else
      return res.status(400).json({ error: 'Missing \'username\' in request body' });

    for (const [key, value] of Object.entries(loginUser))
      if (!value)
        return res.status(400).json({ error: `Missing '${key}' in request body` });

    return AuthService.getUserWithUserName(knexInstance, loginUser.username)
      .then(user => {
        if (!user)
          return res.status(400).json({ error: 'Incorrect Username or Password' });

        return bcrypt.compare(password, user.password)
          .then(passwordMatch => {
            if (!passwordMatch)
              return res.status(400).json({ error: 'Incorrect Username or Password' });

            const token = jwt.sign({ user_id: user.id }, JWT_SECRET, { subject: user.username });

            return res.json({
              authToken: token,
              user_id: user.id
            });
          })
          .catch(next);
      })
      .catch(next);
  });

module.exports = authRouter;