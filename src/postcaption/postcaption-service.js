const xss = require('xss')

const PostCaptionService = {
    getUserCaptions(db, id) {
        return db
            .from('post_caption AS post_caption')
            .select('*')
            .where('post_caption.user_id', id)
    },

    getById(db, id) {
        return db
            .from('post_caption AS post_caption')
            .select('*')
            .where('post_caption.id', id)
            .first()
    },

    insertCaption(db, newCaption) {
        return db
            .insert(newCaption)
            .into('post_caption')
            .returning('*')
            .then(([caption]) => caption)
            .then(caption =>
                PostCaptionService.getById(db, caption.id)
            )
    },

    getRequestedUserPostCaptions(db, requested_user_id) {
        return db
            .from('post_caption')
            .select('*')
            .where('post_caption.user_id', requested_user_id)
            .orderBy('post_caption.date_created', 'desc')
    },

    serializeCaption(caption) {
        return {
            id: caption.id,
            caption: xss(caption.caption),
            date_created: caption.date_created,
            date_modified: caption.date_modified,
            post_photo_id: caption.post_photo_id,
            user_id: caption.user_id,
        }
    }
}

module.exports = PostCaptionService
