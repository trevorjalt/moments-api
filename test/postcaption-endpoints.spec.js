const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')

describe('PostCaption Endpoints', function() {
    let db

    const { testUsers, testProfilePicture, testPostPhoto, testPostCaption } = helpers.makeMomentsFixtures()
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

    // describe(`POST /api/post-caption`, () => {
    //     beforeEach('insert data', () =>
    //         helpers.seedMomentsTables(
    //             db,
    //             testUsers,
    //             testProfilePicture,
    //             testPostPhoto,
    //         )
    //     )

    //     it(`creates a caption, responding with 201 and the new caption`, function() {
    //         this.retries(3)
    //         const newCaption = {
    //             caption: 'All the great quotes and lyrics',
    //             post_photo_id: testPostPhoto[0].id,
    //         }
    //         return supertest(app)
    //             .post('/api/post-caption')
    //             .set('Authorization', helpers.makeAuthHeader(testUser))
    //             .send(newCaption)
    //             .expect(201)
    //             .expect(res => {
    //                 expect(res.body).to.have.property('id')
    //                 expect(res.body.user_id).to.eql(testUser.id)
    //                 expect(res.body.caption).to.eql(newCaption.caption)
    //                 expect(res.body.post_photo_id).to.eql(newCaption.post_photo_id)
    //                 expect(res.body.date_modified).to.eql(null)
    //                 expect(res.headers.location).to.eql(`/api/post-caption/${res.body.id}`)
    //                 const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
    //                 const actualDate = new Date(res.body.date_created).toLocaleString()
    //                 expect(actualDate).to.eql(expectedDate)
    //             })
    //             .expect(res =>
    //                 db
    //                 .from('post_caption')
    //                 .select('*')
    //                 .where({ id: res.body.id })
    //                 .first()
    //                 .then(row => {
    //                     expect(row.user_id).to.eql(testUser.id)
    //                     const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
    //                     const actualDate = new Date(row.date_created).toLocaleString()
    //                     expect(actualDate).to.eql(expectedDate)
    //                 })
    //             )
    //     })

    //     context(`Given an XSS attack caption`, () => {
    //         const {
    //             maliciousCaption,
    //             expectedCaption,
    //         } = helpers.makeMaliciousCaption(testUser, testPostPhoto[0])
      
    //         beforeEach('insert malicious caption', () => {
    //             return helpers.seedMaliciousCaption(
    //                 db,
    //                 maliciousCaption,
    //             )
    //         })
      
    //         it('removes XSS attack content', () => {
    //             return supertest(app)
    //                 .get(`/api/post-caption/`)
    //                 .set('Authorization', helpers.makeAuthHeader(testUser))
    //                 .expect(200)
    //                 .expect(res => {
    //                     expect(res.body[0].caption).to.eql(expectedCaption.caption)
    //                 })
    //         })
    //     })
    // })
})