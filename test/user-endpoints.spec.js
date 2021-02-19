const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { expect } = require('chai')
const supertest = require('supertest')

describe('Users Endpoints', function() {
    let db

    const { testUsers } = helpers.makeMomentsFixtures()
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

    describe(`POST /api/user`, () => {
        context(`User Validation`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )
            
            const requiredFields = ['fullname', 'username', 'user_password', 'email', 'about_user', 'privacy']

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: 'Password1!',
                    email: 'email@email.com',
                    about_user: 'test all the things',
                    privacy: 'Public'
                }

                it(`responds with 400 required error when '${field}' is missing`, () => {
                    delete registerAttemptBody[field]
    
                    return supertest(app)
                        .post('/api/user')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`,
                        })
                })
            })

            it(`responds 400 'Username must be less than 20 characters' when long username`, () => {
                const userLongUsername = {
                    fullname: 'TheTester',
                    username: '*'.repeat(21),
                    user_password: 'Password1!',
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Private'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(userLongUsername)
                    .expect(400, { error: `Username must be less than 20 characters` })
            })

            it(`responds 400 'Username may not contain any spaces' when username contains spaces`, () => {
                const userSpacedUsername = {
                    fullname: 'The Tester',
                    username: 'test test',
                    user_password: 'Password1!',
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Public'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(userSpacedUsername)
                    .expect(400, { error: `Username may not contain any spaces` })
            })

            it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
                const userShortPassword = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: '1234567',
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Private'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(userShortPassword)
                    .expect(400, { error: `Password must be longer than 8 characters` })
            })
    
            it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
                const userLongPassword = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: '*'.repeat(73),
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Public'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(userLongPassword)
                    .expect(400, { error: `Password must be less than 72 characters` })
            })
    
            it(`responds 400 error when password starts with spaces`, () => {
                const userPasswordStartsSpaces = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: ' Password1!',
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Private'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(userPasswordStartsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            })
    
            it(`responds 400 error when password ends with spaces`, () => {
                const userPasswordEndsSpaces = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: 'Password1! ',
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Public'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(userPasswordEndsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            })
    
            it(`responds 400 error when password isn't complex enough`, () => {
                const userPasswordNotComplex = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: '11AAaabb',
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Private'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(userPasswordNotComplex)
                    .expect(400, { error: `Password must contain at least 1 upper case letter, 1 lower case letter, 1 number and 1 special character` })
            })

            it(`responds 400 error when email is not a valid address`, () => {
                const emailInvalidFormat = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: 'Password1!',
                    email: 'incorrect',
                    about_user: 'test all the things',
                    privacy: 'Public'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(emailInvalidFormat)
                    .expect(400, { error: `Email must be a valid address`})

            })
    
            it(`responds 400 'Username already taken' when username isn't unique`, () => {
                const duplicateUser = {
                    fullname: 'TheTester',
                    username: testUser.username,
                    user_password: 'Password1!',
                    email: 'test@test.com',
                    about_user: 'test all the things',
                    privacy: 'Private'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(duplicateUser)
                    .expect(400, { error: `Username already taken` })
            })

            it(`responds 400 'Email is already associated with an user account' when email isn't unique`, () => {
                const duplicateUser = {
                    fullname: 'TheTester',
                    username: 'test',
                    user_password: 'Password1!',
                    email: testUser.email,
                    about_user: 'test all the things',
                    privacy: 'Public'
                }
                return supertest(app)
                    .post('/api/user')
                    .send(duplicateUser)
                    .expect(400, { error: `Email is already associated with an user account` })
            })

            context(`Happy path`, () => {
                it(`responds 201, serialized user, storing bcrypted password`, () => {
                    const newUser = {
                        fullname: 'TheTester',
                        username: 'test',
                        user_password: 'Password1!',
                        email: 'test@test.com',
                        about_user: 'test all the things',
                        privacy: 'Private'
                    }
                    return supertest(app)
                        .post('/api/user')
                        .send(newUser)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('id')
                            expect(res.body.fullname).to.eql(newUser.fullname)
                            expect(res.body.username).to.eql(newUser.username)
                            expect(res.body.email).to.eql(newUser.email)
                            expect(res.body.about_user).to.eql(newUser.about_user)
                            expect(res.body.privacy).to.eql(newUser.privacy)
                            expect(res.body).to.not.have.property('user_password')
                            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(res.body.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                        .expect(res =>
                            db
                                .from('user_information')
                                .select('*')
                                .where({ id: res.body.id })
                                .first()
                                .then(row => {
                                    expect(row.fullname).to.eql(newUser.fullname)
                                    expect(row.username).to.eql(newUser.username)
                                    expect(row.email).to.eql(newUser.email)
                                    expect(row.about_user).to.eql(newUser.about_user)
                                    expect(row.privacy).to.eql(newUser.privacy)
                                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                                    const actualDate = new Date(row.date_created).toLocaleString()
                                    expect(actualDate).to.eql(expectedDate)
    
                                    return bcrypt.compare(newUser.user_password, row.user_password)
                                })
                                .then(compareMatch => {
                                    expect(compareMatch).to.be.true
                                })
                            )
                })
            })
        })
    })
})
