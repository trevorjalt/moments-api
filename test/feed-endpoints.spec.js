const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Feed Endpoints', function() {
    let db

    const { 
        testUsers, 
        testProfilePicture, 
        testConnections,
        testPostPhoto, 
        testPostCaption,
    } = helpers.makeMomentsFixtures()
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

    describe(`GET /api/feed`, () => {
        context(`Given no posts in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty array `, () => {
                return supertest(app)
                    .get('/api/feed')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context(`Given only current user posts in the database`, () => {
            beforeEach('insert data', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                    testConnections,
                    testPostPhoto,
                    testPostCaption
                )
            )

            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/feed')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })
    })
})
