const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()


function makeUsersArray() {
    return [
        {
            id: 1,
            fullname: 'tester1',
            username: 'test-user-1',
            user_password: 'Password1!',
            email: 'email@email.com',
            about_user: 'test the things',
            privacy: 'Public',
            date_created: new Date().toISOString(),
        },
        {
            id: 2,
            fullname: 'tester2',
            username: 'test-user-2',
            user_password: 'Password1!',
            email: 'email2@email.com',
            about_user: 'test the things',
            privacy: 'Private',
            date_created: new Date().toISOString(),
        },
        {
            id: 3,
            fullname: 'tester3',
            username: 'test-user-3',
            user_password: 'Password1!',
            email: 'email3@email.com',
            about_user: 'test the things',
            privacy: 'Public',
            date_created: new Date().toISOString(),
        }
    ]
}

function makeImageArray(users) {
    return [
        {
            id: 1,
            date_created: new Date().toISOString(),
            img_type: 'image/jpg',
            img_file: { type: 'Buffer', data: [] },
            user_id: users[0].id
        }
    ]
}

function makePostCaptionArray(users, postphotos) {
    return [
        {
            id: 1,
            caption: 'Amazing quotes and song lyrics',
            date_created: new Date().toISOString(),
            post_photo_id: postphotos[0].id,
            user_id: users[0].id
        }
    ]
}

function makeMomentsFixtures() {
    const testUsers = makeUsersArray()
    const testProfilePicture = makeImageArray(testUsers)
    const testPostPhoto = makeImageArray(testUsers)
    const testPostCaption = makePostCaptionArray(testUsers, testPostPhoto)
    return { testUsers, testProfilePicture, testPostPhoto, testPostCaption }
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}

function makeExpectedCaption(caption) {
    return {
        id: caption.id,
        caption: caption.caption,
        date_created: caption.date_created,
        date_modified: null,
        post_photo_id: caption.post_photo_id,
        user_id: caption.user_id,
    }    
}

function makeExpectedImage(profilepicture) {
    return {
            id: profilepicture.id,
            date_created: profilepicture.date_created,
            img_type: profilepicture.img_type,
            img_file: { type: 'Buffer', data: 
                [123,34,116,121,112,101,34,58,34,66,117,102,102,101,114,34,44,34,100,97,116,97,34,58,91,93,125] },
            user_id: profilepicture.user_id,
        }
    
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        user_password: bcrypt.hashSync(user.user_password, 1)
    }))
    return db.into('user_information').insert(preppedUsers)
        .then(() =>
            db.raw(
                `SELECT setval('user_information_id_seq', ?)`,
                [users[users.length - 1].id],
            )
        )
}

function seedMomentsTables(db, users, profilepicture, postphoto, postcaption ) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('user_profile_picture').insert(profilepicture)
        // update the auto sequence to match the forced id values
        await trx.raw(
            `SELECT setval('user_profile_picture_id_seq', ?)`,
            [profilepicture[profilepicture.length - 1].id],
        )
        //only insert connections if there are some, also update the sequence counter
        // if (connections) {
        //     await trx.into('user_connection').insert(connections)
        //     await trx.raw(
        //         `SELECT setval('user_connection_id_seq', ?)`,
        //         [connections[connections.length -1].id],
        //     )
        // }
        // //only insert postphotos if there are some, also update the sequence counter
        if (postphoto) {
            await trx.into('post_photo').insert(postphoto)
            await trx.raw(
                `SELECT setval('post_photo_id_seq', ?)`,
                [postphoto[postphoto.length -1].id],
            )
        }
        if (postcaption) {
            await trx.into('post_caption').insert(postcaption)
            await trx.raw(
                `SELECT setval('post_caption_id_seq', ?)`,
                [postcaption[postcaption.length -1].id],
            )
        }
    })
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                user_information,
                user_profile_picture,
                user_connection,
                post_photo,
                post_caption
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE user_information_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE user_profile_picture_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE user_connection_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE post_photo_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE post_caption_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('user_information_id_seq', 0)`),
                    trx.raw(`SELECT setval('user_profile_picture_id_seq', 0)`),
                    trx.raw(`SELECT setval('user_connection_id_seq', 0)`),
                    trx.raw(`SELECT setval('post_photo_id_seq', 0)`),
                    trx.raw(`SELECT setval('post_caption_id_seq', 0)`),
                ])
            )
    )
}

module.exports = {
    makeUsersArray,
    makeImageArray,
    makePostCaptionArray,
    makeMomentsFixtures,
    makeAuthHeader,
    makeExpectedCaption,
    makeExpectedImage,
    seedUsers,
    seedMomentsTables,
    cleanTables,
}
