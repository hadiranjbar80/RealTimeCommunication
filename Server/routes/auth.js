const router = require('express').Router()
const { UserModel } = require('../models/User')
const joi = require('joi')
const bycrypt = require('bcrypt')

router.post('/', async (req,res)=>{ 
    try{
        const { error } = validate(req.body)
        if(error)
            return res.status(400).send({ message: error.details[0].message })

        const user = await UserModel.findOne({ email: req.body.email })
        if(!user)
            return res.status(401).send({ message: 'Invalid Email or Password' })

        const validPassword = await bycrypt.compare(
            req.body.password, user.password
        )

        if(!validPassword){
            return res.status(401).send({ message: 'Invalid Email or Password' })
        }

        const token = user.generateAuthToken()
        res.status(200).send({data: token, message: 'Logged in successfully'})
    }
    catch (err){
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

const validate = (data) => {
    const schema = joi.object({
        email: joi.string().email().required().label('Email'),
        password: joi.string().required().label('Password')
    })
    return schema.validate(data)
}

module.exports = router