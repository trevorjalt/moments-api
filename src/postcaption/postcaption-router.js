const express = require('express')
const PostCaptionService = require('./postcaption-service')
const { requireAuth } = require('../middleware/jwt-auth')


const postCaptionRouter = express.Router()

postCaptionRouter
    .route('/')
    .get(requireAuth, getUserPostCaptions)

async function getUserPostCaptions(req, res, next) {
    try {
        const postCaptions = await PostCaptionService.getUserCaptions(
            req.app.get('db'),
            req.user.id
        )

        return res
            .status(200)
            .json(postCaptions.map(PostCaptionService.serializeCaption))
            .end()
    } catch (error) {
        next (error)
    }
}

module.exports = postCaptionRouter
