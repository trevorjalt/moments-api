
const PostPhotoService = {
    getUserPostPhotos(db, id) {
        return db
            .from('post_photo AS post_photo')
            .select('*')
            .where('post_photo.user_id', id)
            .orderBy('post_photo.date_created', 'desc')
    },

    insertPostPhoto(db, uploadData) {
        return db
            .insert(uploadData)
            .into('post_photo')
            .returning('*')
            .then(([data]) => data)
            .then(data =>
                PostPhotoService.getById(db, data.id)
            )
    },

    getRequestedUserPostPhotos(db, requested_user_id) {
        return db
            .from('post_photo')
            .select('*')
            .where('post_photo.user_id', requested_user_id)
            .orderBy('post_photo.date_created', 'desc')
    },

    getById(db, id) {
        return db
            .from('post_photo AS post_photo')
            .select('*')
            .where('post_photo.id', id)
            .first()
    },

    serializePost(post) {
        return {
            id: post.id,
        }
    }
}

module.exports = PostPhotoService
