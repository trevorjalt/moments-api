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
    },

    getById(db, id) {
        return db
            .from('post_photo AS post_photo')
            .select('*')
            .where('post_photo.id', id)
    },
}

module.exports = PostPhotoService