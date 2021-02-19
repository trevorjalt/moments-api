
const FeedService = {
    getUserFeed(db, id) {
        return db
            .from('post_photo')
            .select(
                'post_photo.id',
                'post_photo.img_file',
                'post_photo.img_type',
                'post_photo.date_created',
                'post_photo.user_id',
                'post_caption.caption',
                'post_caption.post_photo_id',
                'user_information.username',
                'user_profile_picture.img_type AS profile_pic_type',
                'user_profile_picture.img_file AS profile_pic_file',
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
