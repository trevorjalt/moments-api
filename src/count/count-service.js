
const CountService = {
    getUserFollowerCount(db, id) {
        return db
            .from('user_connection')
            .count('user_id')
            .where('followed_user_id', id)
    },

    getUserFollowingCount(db, id) {
        return db
            .from('user_connection')
            .count('followed_user_id')
            .where('user_id', id)
    },

    getUserPostCount(db, id) {
        return db
            .from('post_photo')
            .count('id')
            .where('user_id', id)
    },
}

module.exports = CountService
