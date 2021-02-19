const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Connections Endpoints', function() {
    let db

    const { 
        testUsers, 
        testProfilePicture, 
        testConnections,
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

    describe(`GET /api/connection/followers`, () => {
        context(`Given no user followers in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/connection/followers')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context(`Given there are user followers in the database`, () => {
            beforeEach('insert data', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                    testConnections,
                )
            )

            it(`responds with 200 and all the appropriate data`, () => {
                return supertest(app)
                    .get('/api/connection/followers')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.be.an('array')
                        expect(res.body[0]).to.be.an('object')
                        expect(res.body[0]).to.include.all.keys(
                            'about_user', 
                            'date_created', 
                            'followed_user_id',
                            'fullname',
                            'id',
                            'img_file',
                            'img_type',
                            'username'
                        )
                    })
            })
        })
    })

    describe(`GET /api/connection/following`, () => {
        context(`Given user not following others in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/connection/following')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context(`Given there is user following data in the database`, () => {
            beforeEach('insert data', () =>
                helpers.seedMomentsTables(
                    db,
                    testUsers,
                    testProfilePicture,
                    testConnections,
                )
            )

            it(`responds with 200 and all the appropriate data`, () => {
                return supertest(app)
                    .get('/api/connection/following')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.be.an('array')
                        expect(res.body[0]).to.be.an('object')
                        expect(res.body[0]).to.include.all.keys(
                            'about_user', 
                            'date_created', 
                            'followed_user_id',
                            'fullname',
                            'id',
                            'img_file',
                            'img_type',
                            'username'
                        )
                    })
            })
        })
    })
})
