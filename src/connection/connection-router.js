const express = require('express')
const path = require('path')
const ConnectionService = require('./connection-service')
const { requireAuth } = require('../middleware/jwt-auth')

const connectionRouter = express.Router()

connectionRouter
    .route('/')
    .get(requireAuth, getConnections)
    
async function getConnections(req, res, next) {
    try {
        const userFollowing = await ConnectionService.getUserFollowers(
            req.app.get('db'),
            req.user.id
        )

        return await res
            .status(200)
            .json({
                userFollowing,
            })
            .end()
    } catch (error) {
        next(error)
    }
}

module.exports = connectionRouter