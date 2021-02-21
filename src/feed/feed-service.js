
const FeedService = {
    getUserFeed(db, id) {
        return db
            .from('post_photo')
            .select(
                'post_photo.id AS photo_id',
                'post_photo.img_file AS photo_img_file',
                'post_photo.img_type AS photo_img_type',
                'post_photo.date_created AS photo_date_created',
                'post_photo.user_id',
                'post_caption.caption',
                'post_caption.post_photo_id',
                'user_information.id',
                'user_information.fullname',
                'user_information.username',
                'user_information.about_user',
                'user_profile_picture.img_file',
                'user_profile_picture.img_type',   
            )
            .leftJoin(
                'post_caption',
                'post_photo.id',
                'post_caption.post_photo_id',
            )
            .leftJoin(
                'user_information',
                'post_photo.user_id',
                'user_information.id'
            )
            .leftJoin(
                'user_profile_picture',
                'post_photo.user_id',
                'user_profile_picture.user_id'
            )
            .where('post_photo.user_id', '!=', id)
            .orderBy('post_photo.date_created', 'desc')
    },
}

module.exports = FeedService
