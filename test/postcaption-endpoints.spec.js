const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('PostCaption Endpoints', function() {
    let db

    const { testUsers, testProfilePicture, testConnections, testPostPhoto, testPostCaption } = helpers.makeMomentsFixtures()
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

    describe(`GET /api/post-caption`, () => {
        context(`Given no captions in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/post-caption')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context(`Given there are captions in the database`, () => {
            beforeEach('insert captions', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                    testConnections,
                    testPostPhoto,
                    testPostCaption,
                )
            )

            it(`responds with 200 and all the captions`, () => {
                const expectedCaption = testPostCaption.map(caption =>
                    helpers.makeExpectedCaption(caption)
                )
                return supertest(app)
                        .get('/api/post-caption')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedCaption)
            })
        })
    })

    describe(`GET /api/post-caption/:requested_user_id`, () => {
        context(`Given no captions in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get(`/api/post-caption/${testUsers[0].id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context(`Given there are captions in the database`, () => {
            beforeEach('insert captions', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                    testConnections,
                    testPostPhoto,
                    testPostCaption,
                )
            )

            it(`responds with 200 and all the captions`, () => {
                const expectedCaption = testPostCaption.map(caption =>
                    helpers.makeExpectedCaption(caption)
                )
                return supertest(app)
                        .get(`/api/post-caption/${testUsers[0].id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedCaption)
            })
        })
    })
})
