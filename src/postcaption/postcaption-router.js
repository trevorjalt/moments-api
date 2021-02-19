const express = require('express')
const PostCaptionService = require('./postcaption-service')
const { requireAuth } = require('../middleware/jwt-auth')


const postCaptionRouter = express.Router()

postCaptionRouter
    .route('/')
    .get(requireAuth, getUserPostCaptions)

postCaptionRouter
    .route('/:requested_user_id')
    .get(requireAuth, verifyUserExists, getRequestedUserPostCaptions)

async function getUserPostCaptions(req, res, next) {
    try {
        const postCaptions = await PostCaptionService.getUserCaptions(
            req.app.get('db'),
            req.user.id
        )

        const serialized = postCaptions.map(PostCaptionService.serializeCaption)

        return res
            .status(200)
            .json(serialized)
            .end()
    } catch (error) {
        next (error)
    }
}

async function getRequestedUserPostCaptions(req, res, next) {
    try {
        await res
            .status(200)
            .json(res.requestedUserPostCaptions)
            .end()
    } catch {
        next()
    }
}

async function verifyUserExists(req, res, next) {
    try {
        const requestedUserPostCaption = await PostCaptionService.getRequestedUserPostCaptions(
            req.app.get('db'),
            req.params.requested_user_id
        )

        if(!requestedUserPostCaption)
            return await res.status(404).json({
                error: { message:`No post captions found` }
            })

        const sanitizedCaption = await requestedUserPostCaption.map(el =>
            PostCaptionService.serializeCaption(el))

        res.requestedUserPostCaptions = sanitizedCaption

        next()
        
    } catch (error) {
        next(error)
    }
}

module.exports = postCaptionRouter
