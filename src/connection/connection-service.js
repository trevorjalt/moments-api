
const ConnectionService = {
    getUserFollowers(db, id) {
        return db
            .from('user_connection')
            .select(
                'followed_user_id',
                'user_information.id',
                'user_information.fullname',
                'user_information.username',
                'user_information.about_user',
                'user_profile_picture.img_file',
                'user_profile_picture.img_type',
                'user_connection.date_created'
            )
            .leftJoin(
                'user_information', 
                'user_connection.user_id', 
                'user_information.id'
            )
            .leftJoin(
                'user_profile_picture', 
                'user_connection.user_id', 
                'user_profile_picture.user_id'
            )
            .where('user_connection.followed_user_id', id)
            .orderBy('user_connection.date_created', 'desc')
    },

    getUserFollowing(db, id) {
        return db
            .from('user_connection')
            .select(
                'followed_user_id',
                'user_information.id',
                'user_information.fullname',
                'user_information.username',
                'user_information.about_user',
                'user_profile_picture.img_file',
                'user_profile_picture.img_type',
                'user_connection.date_created'
            )
            .leftJoin(
                'user_information', 
                'user_connection.followed_user_id', 
                'user_information.id'
            )
            .leftJoin(
                'user_profile_picture', 
                'user_connection.followed_user_id', 
                'user_profile_picture.user_id'
            )
            .where('user_connection.user_id', id)
            .orderBy('user_connection.date_created', 'desc')
    },
}

module.exports = ConnectionService
