const express = require('express')
const CountService = require('./count-service')
const { requireAuth } = require('../middleware/jwt-auth')

const countRouter = express.Router()

countRouter
    .route('/')
    .get(requireAuth, getUserCounts)
    
async function getUserCounts(req, res, next) {
    try {

        const userFollowerCount = await CountService.getUserFollowerCount(
            req.app.get('db'),
            req.user.id
        )

        const userFollowingCount = await CountService.getUserFollowingCount(
            req.app.get('db'),
            req.user.id
        )

        const userPostCount = await CountService.getUserPostCount(
            req.app.get('db'),
            req.user.id
        )

        return await res
            .status(200)
            .json({ userFollowerCount, userFollowingCount, userPostCount })
            .end()
    } catch (error) {
        next(error)
    }
}

module.exports = countRouter
