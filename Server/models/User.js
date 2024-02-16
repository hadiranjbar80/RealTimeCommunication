const mongoose = require('mongoose')
const JWT = require('jsonwebtoken')
const joi = require('joi')
const passwordComplexity = require('joi-password-complexity')

const UserSchema = new mongoose.Schema({
    phone: {
        type: String, 
    },

    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    registerationDate: {
        type: Date,
    },

    userName: {
        type: String,
        required: true,
        unique: true
    },

    imageName: {
        type: String,
    },

    password: {
        type: String,
        required: true
    }
})

// generating Json Web Token
UserSchema.methods.generateAuthToken =  function() {
    const token = JWT.sign({_id:this._id}, process.env.JWTPRIVATEKEY, {expiresIn: '7d'})
    return token
}

const UserModel = mongoose.model('Users',UserSchema)

// Registeration validatins
const validateUserRegisteration = (data) => {
    const schema = joi.object({
        fullName: joi.string().required().label('Full Name'),
        email: joi.string().required().label('Email'),
        userName: joi.string().required().label('User Name'),
        password: passwordComplexity().required().label('Password'),
    })
    return schema.validate(data)
}

// Validate edit user page
const validateUserEditProfile = (data) => {
    const schema = joi.object({
        fullName: joi.string().required().label('Full Name'),
        email: joi.string().required().label('Email'),
        userName: joi.string().required().label('User Name'),
        phone: joi.string().required().label('Phone'),
    })
    return schema.validate(data)
}

module.exports = { UserModel, validateUserRegisteration, validateUserEditProfile }