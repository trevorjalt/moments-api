const express = require('express')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const ProfilePictureService = require('./profilepicture-service')
// const { DB_URL } = require('../config')
const { requireAuth } = require('../middleware/jwt-auth')

const profilePictureRouter = express.Router()
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

profilePictureRouter
    .route('/upload')
    .post(requireAuth, [upload.single('imageRequest')], uploadProfilePicture)

profilePictureRouter
    .route('/upload/:profilepicture_id')
    .patch(requireAuth, verifyProfilePictureExists, [upload.single('imageRequest')], updateProfilePicture)

profilePictureRouter
    .route('/download')
    .get(requireAuth, downloadProfilePicture)

async function uploadProfilePicture(req, res, next) {
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

        const rows = await ProfilePictureService.insertProfilePicture(
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

async function updateProfilePicture(req, res, next) {
    console.log('request body', req.body)
    console.log('request file', req.file)
    
    try { 
        
        // console.log('REQUEST REQUEST', req)
        console.log('FILE FILE', req.file)
        
        const imgData = fs.readFileSync(req.file.path)

        const updateData = {
            // name: req.body.someText,
            img_type: req.file.mimetype,
            img_file: imgData,
            date_created: new Date(),
        }

        const numberOfValues = Object.values(updateData).filter(Boolean).length
        if (numberOfValues === 0)
            return await res.status(400).json({
                error: { message: `Invalid request`}
        })


        const rows = await ProfilePictureService.updateProfilePicture(
            req.app.get('db'),
            req.params.profilepicture_id,
            updateData
        )

        console.log(rows[0]);

        fs.unlink(req.file.path, function(err) {
            if (err) {
                next(err)
                return
            }
            console.log('Temp Image Deleted')
            res.status(204).end()
        })
    } catch(error) {
        next(error)
    }
}

async function downloadProfilePicture(req, res, next) {
    try {
        const rows = await ProfilePictureService.getProfilePicture(
            req.app.get('db'),
            req.user.id
        )
        console.log('ROWS', rows)
        return res
            .status(200)
            .json(rows)
            .end()
    } catch(error) {
        next(error)
    }
}

async function verifyProfilePictureExists(req, res, next) {
    try {
        console.log('PARAMS', req.params.profilepicture_id)
        const currentProfilePicture = await ProfilePictureService.getById(
            req.app.get('db'),
            req.params.profilepicture_id
        )

        if(!currentProfilePicture)
            return await res.status(404).json({
                error: { message:`Profile Picture not found` }
            })

        res.profilepicture = currentProfilePicture

        next()
        
    } catch (error) {
        next(error)
    }
}

module.exports = profilePictureRouter
