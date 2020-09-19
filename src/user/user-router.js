const express = require('express');
const xss = require('xss');
const UserService = require('./user-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

const serializeUser = user => ({
    id: user.id,
    username: xss(user.username),
    email: xss(user.email),
    password: xss(user.password)    
});

userRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        UserService.getAllUsers(knexInstance)
            .then(users => {
                res.json(users.map(serializeUser))
                })
        .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db');

        let { username, email, password } = req.body;

        username = username && username.toLowerCase();

        for (const field of ['username', 'email', 'password'])
            if(!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
        
        const passwordError = UserService.validatePassword(password);
        if (passwordError) {
            return res.status(400).json({
                error: passwordError
            })
        }

        UserService.emailTaken(knexInstance, email)
            .then((emailTaken) => {
                if (emailTaken)
                    return res.status(400).json({ error: 'This email address is already registered' })

        UserService.usernameTaken(knexInstance, username)
            .then((usernameTaken) => {
                if (usernameTaken)
                    return res.status(400).json({ error: 'Username taken'})
            })

                return UserService.hashPassword(password)
                    .then((hashedPassword) => {
                        const newUser = {
                            username,
                            email,
                            password: hashedPassword
                        };
                    
                    return UserService.insertUser(knexInstance, newUser)
                        .then((user) => {
                            res.status(201)
                            .json(serializeUser(user));
                        });
                    });
            })
        .catch(next);
    })

module.exports = userRouter;