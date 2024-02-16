const mongoose = require('mongoose')
const joi = require('joi')

const MeetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    link: {
        type: String,
        required: true,
        unique: true
    },

    dateCreated: {
        type: Date,
        required: true
    },
    user: { type: mongoose.Types.ObjectId, ref: 'User' }
})


const MeetingModel = mongoose.model('Meetings',MeetingSchema)


// validatins
const validateMeeting = (data) => {
    const schema = joi.object({
        title: joi.string().required().label('Title'),
        userId: joi.string().required().label('UserId'),
    })
    return schema.validate(data)
}


module.exports = { MeetingModel, validateMeeting }