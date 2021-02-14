const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
require('dotenv').config()
// const TestImage = require('./images/moments-test.png')


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

function makeProfilePicture() {
    // const imgData = fs.readFileSync.mockResolvedData()

    return {
        img_file: fs.readFileSync('./images/moments-test.png', 'utf-8'),
        img_type: 'image/png'
    }

}

function makeMomentsFixtures() {
    const testUsers = makeUsersArray()
    const testProfilePicture = makeProfilePicture()
    return { testUsers, testProfilePicture }
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
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

function seedMomentsTables(db, users, profilepicture ) {
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
        // //only insert profilepictures if there are some, also update the sequence counter
        // if (profilepictures) {
        //     await trx.into('user_profile_picture').insert(profilepictures)
        //     await trx.raw(
        //         `SELECT setval('user_profile_picture_id_seq', ?)`,
        //         [profilepictures[profilepictures.length -1].id],
        //     )
        // }
    })
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                user_information,
                user_profile_picture
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE user_information_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE user_profile_picture_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('user_information_id_seq', 0)`),
                    trx.raw(`SELECT setval('user_profile_picture_id_seq', 0)`),
                ])
            )
    )
}

module.exports = {
    makeUsersArray,
    makeProfilePicture,
    makeMomentsFixtures,
    makeAuthHeader,
    seedUsers,
    seedMomentsTables,
    cleanTables,
}