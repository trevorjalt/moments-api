require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const authRouter = require('./auth/auth-router')
const postPhotoRouter = require('./postphoto/postphoto-router')
const profilePictureRouter = require('./profilepicture/profilepicture-router')
const userRouter = require('./user/user-router')

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
}))
app.use(helmet());
app.use(cors());

app.use('/api/auth', authRouter)
app.use('/api/post-photo', postPhotoRouter)
app.use('/api/profile-picture', profilePictureRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!');
})

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { messages: 'server error' } };
    } else {
        console.error(error)
        response = { message: error.message, error };
    }
    res.status(500).json(response);
})

module.exports = app