require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./error-handler');
const { NODE_ENV } = require('./config');
const exercisesRouter = require('./exercises/exercises-router');
const userRouter = require('./user/user-router');
const historyRouter = require('./history/history-router');
const programFoldersRouter = require('./programFolders/program-folders-router');
const programRoutinesRouter = require('./programRoutines/program-routines-router');
const authRouter = require('./auth/auth-router');


const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

//Routers for endpoints
app.use('/api/exercises', exercisesRouter);
app.use('/api/users', userRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter);
app.use('/api/programfolders', programFoldersRouter);
app.use('/api/programRoutines', programRoutinesRouter);

//Welcome Page endpoint
app.get('/', (req, res) => {
    res.send('Welcome to Training Tracker!')
});

//Error Handler
app.use(errorHandler);

module.exports = app;