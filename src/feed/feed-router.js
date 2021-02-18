const express = require('express')
const FeedService = require('./feed-service')
const { requireAuth } = require('../middleware/jwt-auth')

const feedRouter = express.Router()

feedRouter
    .route('/')
    .get(requireAuth, getUserFeed)
    
async function getUserFeed(req, res, next) {
    try {

        const userFeed = await FeedService.getUserFeed(
            req.app.get('db'),
            req.user.id
        )

        return await res
            .status(200)
            .json(userFeed)
            .end()
    } catch (error) {
        next(error)
    }
}

module.exports = feedRouter
