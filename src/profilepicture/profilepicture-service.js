
const ProfilePictureService = {
    getProfilePicture(db, id) {
        return db
            .from('user_profile_picture AS profilepicture')
            .select('*')
            .where('profilepicture.user_id', id)
    },

    insertProfilePicture(db, uploadData) {
        return db
            .insert(uploadData)
            .into('user_profile_picture')
            .returning('*')
            .then(([data]) => data)
    },

    getById(db, id) {
        return db
            .from('user_profile_picture AS profilepicture')
            .select('*')
            .where('profilepicture.id', id)
    },

    updateProfilePicture(db, id, newProfilePictureFields) {
        return db
            .from('user_profile_picture')
            .where({ id })
            .update(newProfilePictureFields)
    },
}

module.exports = ProfilePictureService
