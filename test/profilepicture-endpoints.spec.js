const knex = require('knex')
const fs = require('fs')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('ProfilePicture Endpoints', function() {
    let db

    const { testUsers, testProfilePicture } = helpers.makeMomentsFixtures()
    const testUser = testUsers[0]

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/profile-picture/upload`, () => {
        beforeEach('insert users', () =>
            helpers.seedUsers(
                db,
                testUsers,
            )
        )

        it(`creates a profile picture, responding with 201`, function() {
            this.retries(3)
            // const newProfilePicture = { testProfilePicture }
            return supertest(app)
                .post('/api/profile-picture/upload')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .attach('imageRequest', `${__dirname}/images/moments-test.jpg`)
                // .send(newProfilePicture)
                .expect(201)
        })
    })

    describe(`GET /api/profile-picture/download`, () => {
        context(`Given no profile picture in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/profile-picture/download')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context(`Given there is a profile picture in the database`, () => {
            beforeEach('insert profile picture', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                )
            )

            it(`responds with 200 and the profile picture`, () => {
                const expectedPicture = testProfilePicture.map(profilepic =>
                    helpers.makeExpectedProfilePicture(profilepic)
                )
                return supertest(app)
                        .get('/api/profile-picture/download')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        // .attach('imageRequest', `${__dirname}/images/moments-test.jpg`)
                        .expect(200, expectedPicture)
            })
        })
    })
})