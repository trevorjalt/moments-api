const express = require('express')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const PostPhotoService = require('./postphoto-service')
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
        
        // console.log('REQUEST REQUEST', req)
        // console.log('FILE FILE', req.file)
        
        const imgData = fs.readFileSync(req.file.path)

        const uploadData = {
            // name: req.body.someText,
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

        console.log(rows[0]);

        fs.unlink(req.file.path, function(err) {
            if (err) {
                next(err)
                return
            }
            console.log('Temp Image Deleted')
            res.sendStatus(201).end()
        })
    } catch(error) {
        next(error)
    }
}

async function downloadPostPhoto(req, res, next) {
    try {
        const rows = await PostPhotoService.getPostPhotos(
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
        console.log('PARAMS', req.params.postphoto_id)
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
