const express = require('express')
const fs = require('fs')
const multer = require('multer')
const PostPhotoService = require('./postphoto-service')
const PostCaptionService = require ('../postcaption/postcaption-service')
const { requireAuth } = require('../middleware/jwt-auth')

const postPhotoRouter = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/uploads`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + new Date().toISOString());
    }
})
  
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1 
    }
})

postPhotoRouter
    .route('/upload')
    .post(requireAuth, [upload.single('imageRequest')], uploadPostPhoto)

postPhotoRouter
    .route('/download')
    .get(requireAuth, downloadPostPhoto)

postPhotoRouter
    .route('/download/:requested_user_id')
    .get(requireAuth, verifyUserExists, downloadRequestedUserPostPhoto)

async function uploadPostPhoto(req, res, next) {
    try {       
        const imgData = fs.readFileSync(req.file.path)

        const captionData = req.body.caption_input

        const uploadData = {
            img_type: req.file.mimetype,
            img_file: imgData
        }

        const numberOfValues = Object.values(uploadData).filter(Boolean).length
        if (numberOfValues === 0)
            return await res.status(400).json({
                error: { message: `Invalid request`}
        })

        uploadData.user_id = req.user.id

        const rows = await PostPhotoService.insertPostPhoto(
            req.app.get('db'),
            uploadData
        )

        fs.unlink(req.file.path, function(err) {
            if (err) {
                next(err)
                return
            }
            console.log('Temp Image Deleted')
        })

        const postPhotoId = PostPhotoService.serializePost(rows)

        const newCaption = { 
            post_photo_id: postPhotoId.id,
            caption: captionData
        }

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
            .json(PostCaptionService.serializeCaption(postcaption))
            .end()
    } catch(error) {
        next(error)
    }
}

async function downloadPostPhoto(req, res, next) {
    try {
        const rows = await PostPhotoService.getUserPostPhotos(
            req.app.get('db'),
            req.user.id
        )

        return res
            .status(200)
            .json(rows)
            .end()
    } catch(error) {
        next(error)
    }
}

async function downloadRequestedUserPostPhoto(req, res, next) {
    try {
        await res
            .status(200)
            .json(res.requestedUserPostPhotos)
            .end()
    } catch {
        next()
    }
}

async function verifyUserExists(req, res, next) {
    try {
        const requestedUserPostPhoto = await PostPhotoService.getRequestedUserPostPhotos(
            req.app.get('db'),
            req.params.requested_user_id
        )

        if(!requestedUserPostPhoto)
            return await res.status(404).json({
                error: { message:`No post photos found` }
            })

        res.requestedUserPostPhotos = requestedUserPostPhoto

        next()
        
    } catch (error) {
        next(error)
    }
}

module.exports = postPhotoRouter
