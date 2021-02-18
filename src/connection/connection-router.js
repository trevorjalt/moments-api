const express = require('express')
const ConnectionService = require('./connection-service')
const { requireAuth } = require('../middleware/jwt-auth')

const connectionRouter = express.Router()

connectionRouter
    .route('/followers')
    .get(requireAuth, getUserFollowers)

connectionRouter
    .route('/following')
    .get(requireAuth, getUserFollowing)
    
async function getUserFollowers(req, res, next) {
    try {

        const userFollowers = await ConnectionService.getUserFollowers(
            req.app.get('db'),
            req.user.id
        )

        return await res
            .status(200)
            .json(userFollowers)
            .end()
    } catch (error) {
        next(error)
    }
}

async function getUserFollowing(req, res, next) {
    try {

        const userFollowing = await ConnectionService.getUserFollowing(
            req.app.get('db'),
            req.user.id
        )

        return await res
            .status(200)
            .json(userFollowing)
            .end()
    } catch (error) {
        next(error)
    }
}

module.exports = connectionRouter
