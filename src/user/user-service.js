const xss = require('xss')
const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/
const REGEX_EMAIL = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

const UserService = {
    hasUserWithUserEmail(db, email) {
        return db('user_information')
            .where({ email })
            .first()
            .then(email => !!email)
    },

    hasUserWithUserName(db, username) {
        return db('user_information')
            .where({ username })
            .first()
            .then(user => !!user)
    },

    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('user_information')
            .returning('*')
            .then(([user]) => user)
    },

    validateUsername(username) {
        if (username.length > 20) {
            return 'Username must be less than 20 characters'
        }

        if (username.includes(' ')) {
            return 'Username may not contain any spaces'
        }
    },

    validatePassword(user_password) {
        if (user_password.length < 8) {
            return 'Password must be longer than 8 characters'
        }
        if (user_password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (user_password.startsWith(' ') || user_password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(user_password)) {
            return 'Password must contain at least 1 upper case letter, 1 lower case letter, 1 number and 1 special character'
        }
        return null
    },

    hashPassword(user_password) {
        return bcrypt.hash(user_password, 12)
    },

    validateEmail(email){
        if (!REGEX_EMAIL.test(email)) {
            return 'Email must be a valid address'
        }
        return null
    },

    serializeUser(user) {
        return {
            id: user.id,
            fullname: xss(user.fullname),
            username: xss(user.username),
            email: xss(user.email),
            about_user: xss(user.about_user),
            privacy: user.privacy,
            date_created: new Date(user.date_created),
        }
    },

    getAllUsers(db) {
        return db  
            .from('user_information as usr')
            .select(
                'usr.id',
                'usr.fullname',
                'usr.username',
                'usr.email',
                'usr.about_user',
                'usr.privacy',
                'usr.date_created',
            )       
    },

    getById(db, id) {
        return UserService.getAllUsers(db)
          .where('usr.id', id)
          .first()
    },
}

module.exports = UserService
