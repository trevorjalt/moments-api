
const ConnectionService = {
    getUserFollowing(db, id) {
        return db
            .from('user_connection AS user_connection ')
            .select(
                'followed_user_id',
                db.raw(
                    `row_to_json(
                        (SELECT tmp FROM (
                            SELECT
                                usr.id,
                                usr.username,
                                usr.fullname,
                                usr.date_created,
                                usr.about_user
                        ) tmp)
                    ) AS "user"`
                ),
                db.raw(
                    `row_to_json(
                        (SELECT tmp FROM (
                            SELECT
                                profilepic.img_type,
                                profilepic.img_file,
                                profilepic.user_id
                        ) tmp)
                    ) AS "profilepicture"`
                ),
                // db.raw(
                //     `row_to_json(
                //         (SELECT tmp FROM (
                //             SELECT
                //                 postphoto.id,
                //                 postphoto.date_created,
                //                 postphoto.img_type,
                //                 postphoto.img_file,
                //                 postphoto.user_id
                //         ) tmp)
                //     ) AS "postphoto"`
                // ),
                // db.raw(
                //     `row_to_json(
                //         (SELECT tmp FROM (
                //             SELECT
                //                 caption.caption,
                //                 caption.post_photo_id,
                //                 caption.user_id
                //         ) tmp)
                //     ) AS "caption"`
                // ),
            )
            .leftJoin(
                'user_information AS usr',
                'followed_user_id',
                'usr.id'
            )
            .leftJoin(
                'user_profile_picture AS profilepic',
                'followed_user_id',
                'profilepic.user_id'
            )
            // .leftJoin(
            //     'post_photo AS postphoto',
            //     'followed_user_id',
            //     'postphoto.user_id'
            // )
            // .leftJoin(
            //     'post_caption AS caption',
            //     'postphoto.id',
            //     'caption.post_photo_id'
            // )
            .where('user_connection.user_id', id)
            .orderBy('user_connection.date_created', 'desc')
            // .groupBy('blah.id', 'blah.id')
    },

    getUserFollowers(db, id) {
        return db
            .from('user_connection AS user_connection ')
            .select(
                'followed_user_id',
                db.raw(
                    `row_to_json(
                        (SELECT tmp FROM (
                            SELECT
                                usr.id,
                                usr.username,
                                usr.fullname,
                                usr.date_created,
                                usr.about_user
                        ) tmp)
                    ) AS "user"`
                ),
                db.raw(
                    `row_to_json(
                        (SELECT tmp FROM (
                            SELECT
                                profilepic.img_type,
                                profilepic.img_file,
                                profilepic.user_id
                        ) tmp)
                    ) AS "profilepicture"`
                ),
            )
            .leftJoin(
                'user_information AS usr',
                'user_connection.user_id',
                'usr.id'
            )
            .leftJoin(
                'user_profile_picture AS profilepic',
                'user_connection.user_id',
                'profilepic.user_id'
            )
            .where('followed_user_id', id)
            .orderBy('user_connection.date_created', 'desc')
    },


}

module.exports = ConnectionService
