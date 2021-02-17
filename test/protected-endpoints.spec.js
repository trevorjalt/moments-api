const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected endpoints', function() {
    let db

    const {
        testUsers,
        testProfilePicture,
        // testConnections,
        testPostPhoto,
    } = helpers.makeMomentsFixtures()

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

    beforeEach('insert data', () =>
            helpers.seedMomentsTables(
                db,
                testUsers,
                testProfilePicture,
                //   testConnections,
                testPostPhoto,
                
            )
    )

    const protectedEndpoints = [
        // {
        //     name: 'POST /api/post-photo/upload',
        //     path: '/api/post-photo/upload',
        //     method: supertest(app).get,
        // },
        {
            name: 'GET /api/post-photo/download',
            path: '/api/post-photo/download',
            method: supertest(app).get,
        },
        // {
        //     name: 'POST /api/profile-picture/upload',
        //     path: '/api/profile-picture/upload',
        //     method: supertest(app).get,
        // },
        // {
        //     name: 'PATCH /api/profile-picture/upload/:profilepicture_id',
        //     path: '/api/profile-picture/upload/1',
        //     method: supertest(app).get,
        // },
        {
            name: 'GET /api/profile-picture/download',
            path: '/api/profile-picture/download',
            method: supertest(app).get,
        },
    ]

    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            it(`responds 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, { error: `Missing bearer token` })
            })

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0]
                const invalidSecret = 'bad-secret'
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = { username: 'user-not-existy', id: 1 }
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, { error: `Unauthorized request` })
            })
        })
    })
})
