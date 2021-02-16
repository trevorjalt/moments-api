const express = require('express')
const path = require('path')
const PostCaptionService = require('./postcaption-service')
const { requireAuth } = require('../middleware/jwt-auth')


const postCaptionRouter = express.Router()
const jsonBodyParser = express.json()

postCaptionRouter
    .route('/')
    .get(requireAuth, getUserPostCaptions)
    .post(requireAuth, jsonBodyParser, createCaption)

async function getUserPostCaptions(req, res, next) {
    console.log('getting')
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

async function createCaption(req, res, next) {
    try {
        const { post_photo_id, caption } = req.body
        const newCaption = { post_photo_id, caption }

        for (const [key, value] of Object.entries(newCaption))
            if (value == null)
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body`}
            })

        newCaption.user_id = req.user.id

        const postcaption = await PostCaptionService.insertCaption(
            req.app.get('db'),
            newCaption
        )

        await res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${postcaption.id}`))
            .json(PostCaptionService.serializeCaption(postcaption))
            .end()
    } catch(error) {
        next(error)
    }
}

module.exports = postCaptionRouter
