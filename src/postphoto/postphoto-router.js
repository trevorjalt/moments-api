const express = require('express')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const PostPhotoService = require('./postphoto-service')
const PostCaptionService = require ('../postcaption/postcaption-service')
// const { DB_URL } = require('../config')
const { requireAuth } = require('../middleware/jwt-auth')

const postPhotoRouter = express.Router()
// const jsonBodyParser = express.json()

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
        fileSize: 1024 * 1024 * 1 // allowed image size, set to 1MB
    }
})

postPhotoRouter
    .route('/upload')
    .post(requireAuth, [upload.single('imageRequest')], uploadPostPhoto)

postPhotoRouter
    .route('/download')
    .get(requireAuth, downloadPostPhoto)


async function uploadPostPhoto(req, res, next) {
    try { 
        
        // console.log('REQUEST REQUEST', req.body)
        // console.log('FILE FILE', req.file)
        
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

        // console.log('ROW ROW ROW', rows);

        fs.unlink(req.file.path, function(err) {
            if (err) {
                next(err)
                return
            }
            console.log('Temp Image Deleted')
            // return res
            //     .status(201)
            //     .json(PostPhotoService.serializePost(rows))
            //     // .end()
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
            // .location(`/api/post-caption/${postcaption.id}`)
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

async function verifyPostPhotoExists(req, res, next) {
    try {
        const currentPostPhoto = await PostPhotoService.getById(
            req.app.get('db'),
            req.params.postphoto_id
        )

        if(!currentPostPhoto)
            return await res.status(404).json({
                error: { message:`Post photo not found` }
            })

        res.postphoto = currentPostPhoto

        next()
        
    } catch (error) {
        next(error)
    }
}

module.exports = postPhotoRouter
