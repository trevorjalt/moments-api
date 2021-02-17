const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('PostPhoto Endpoints', function() {
    let db

    const { testUsers, testProfilePicture, testPostPhoto } = helpers.makeMomentsFixtures()
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

    describe(`POST /api/post-photo/upload`, () => {
        beforeEach('insert users', () =>
            helpers.seedUsers(
                db,
                testUsers,
            )
        )

        it(`creates a post photo, responding with 201`, function() {
            this.retries(3)
            return supertest(app)
                .post('/api/post-photo/upload')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .attach('imageRequest', `${__dirname}/images/moments-test.jpg`)
                .expect(201)
        })
    })

    describe(`GET /api/post-photo/download`, () => {
        context(`Given no post photos in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/post-photo/download')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context(`Given there is a post photo in the database`, () => {
            beforeEach('insert post photo', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                    testPostPhoto,
                )
            )

            it(`responds with 200 and the post photo`, () => {
                this.retries(3)
                const expectedImage = testPostPhoto.map(postphoto =>
                    helpers.makeExpectedImage(postphoto)
                )
                return supertest(app)
                        .get('/api/post-photo/download')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedImage)
            })
        })
    })
})
