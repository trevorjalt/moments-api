const knex = require('knex')
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
            connection: process.env.TEST_DATABASE_URL,
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
            return supertest(app)
                .post('/api/profile-picture/upload')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .attach('imageRequest', `${__dirname}/images/moments-test.jpg`)
                .expect(201)
        })
    })

    describe(`PATCH /api/profile-picture/upload/:profilepicture_id`, () => {
        context(`Given no profile picture in the database`, () => {
            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            )
          
            it(`responds with 404`, () => {
                const profilePictureId = 123456
                return supertest(app)
                    .delete(`/api/profile-picture/upload/${profilePictureId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {})
            })
        })
    
        context('Given there is a profile picture in the database', () => {
            beforeEach('insert profile picture', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                )
            )
    
            it('responds with 204 and updates the profile picture', () => {
                this.retries(3)
                const idToUpdate = 1
        
                return supertest(app)
                    .patch(`/api/profile-picture/upload/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .attach('imageRequest', `${__dirname}/images/moments-test.jpg`)
                    .expect(204)
            })
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
                this.retries(3)
                const expectedImage = testProfilePicture.map(profilepic =>
                    helpers.makeExpectedImage(profilepic)
                )
                return supertest(app)
                        .get('/api/profile-picture/download')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedImage)
            })
        })
    })

    describe(`GET /api/profile-picture/download/:requested_user_id`, () => {
        context(`Given no profile picture in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get(`/api/profile-picture/download/${testUsers[0].id}`)
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
                this.retries(3)
                const expectedImage = testProfilePicture.map(profilepic =>
                    helpers.makeExpectedImage(profilepic)
                )
                return supertest(app)
                        .get(`/api/profile-picture/download/${testUsers[0].id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedImage)
            })
        })
    })
})
