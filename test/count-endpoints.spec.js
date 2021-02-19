const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Count Endpoints', function() {
    let db

    const { 
        testUsers, 
        testProfilePicture, 
        testConnections,
        testPostPhoto, 
        testPostCaption 
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

    describe(`GET /api/count`, () => {
        context(`Given no connections in the database`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it(`responds with 200 and three array objects with count 0 `, () => {
                return supertest(app)
                    .get('/api/count')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.be.an('object')
                        expect(res.body).to.include.all.keys('userFollowerCount', 'userFollowingCount', 'userPostCount')
                        expect(res.body.userFollowerCount).to.be.an('array')
                        expect(res.body.userFollowerCount[0]).to.be.an('object')
                        expect(res.body.userFollowerCount[0]).to.include.all.keys('count')
                        expect(res.body.userFollowerCount[0].count).to.eql('0')
                        expect(res.body.userFollowingCount).to.be.an('array')
                        expect(res.body.userFollowingCount[0]).to.be.an('object')
                        expect(res.body.userFollowingCount[0]).to.include.all.keys('count')
                        expect(res.body.userFollowingCount[0].count).to.eql('0')
                        expect(res.body.userPostCount).to.be.an('array')
                        expect(res.body.userPostCount[0]).to.be.an('object')
                        expect(res.body.userPostCount[0]).to.include.all.keys('count')
                        expect(res.body.userPostCount[0].count).to.eql('0')
                    })
            })
        })

        context(`Given there are connections in the database`, () => {
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

            it(`responds with 200 and all the appropriate counts`, () => {
                return supertest(app)
                    .get('/api/count')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.be.an('object')
                        expect(res.body).to.include.all.keys('userFollowerCount', 'userFollowingCount', 'userPostCount')
                        expect(res.body.userFollowerCount).to.be.an('array')
                        expect(res.body.userFollowerCount[0]).to.be.an('object')
                        expect(res.body.userFollowerCount[0]).to.include.all.keys('count')
                        expect(res.body.userFollowerCount[0].count).to.eql('1')
                        expect(res.body.userFollowingCount).to.be.an('array')
                        expect(res.body.userFollowingCount[0]).to.be.an('object')
                        expect(res.body.userFollowingCount[0]).to.include.all.keys('count')
                        expect(res.body.userFollowingCount[0].count).to.eql('1')
                        expect(res.body.userPostCount).to.be.an('array')
                        expect(res.body.userPostCount[0]).to.be.an('object')
                        expect(res.body.userPostCount[0]).to.include.all.keys('count')
                        expect(res.body.userPostCount[0].count).to.eql('1')
                    })
            })
        })
    })
})
