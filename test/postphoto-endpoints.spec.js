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
            helpers.seedMomentsTables(
                db,
                testUsers,
                testPostPhoto,
            )
        )

        it(`creates a post photo and a post caption,  responding with 201`, function() {
            this.retries(3)

            const newCaption = {
                caption: 'All the great quotes and lyrics', // captionData
                post_photo_id: testPostPhoto[0].id,
            }

            return supertest(app)
                .post('/api/post-photo/upload')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .attach('imageRequest', `${__dirname}/images/moments-test.jpg`)
                .field('caption_input', newCaption.caption)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.user_id).to.eql(testUser.id)
                    expect(res.body.caption).to.eql(newCaption.caption)
                    expect(res.body.post_photo_id).to.eql(newCaption.post_photo_id)
                    expect(res.body.date_modified).to.eql(null)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                    .from('post_caption')
                    .select('*')
                    .where({ id: res.body.id })
                    .first()
                    .then(row => {
                        expect(row.user_id).to.eql(testUser.id)
                        const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                        const actualDate = new Date(row.date_created).toLocaleString()
                        expect(actualDate).to.eql(expectedDate)
                    })
                )
            
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
