const router = require('express').Router()
const { UserModel, validateUserRegisteration } = require('../models/User')
const bcrypt = require('bcrypt')

router.post('/', async (req, res)=>{
    try{
        const {error} = validateUserRegisteration(req.body)
        if(error)
            return res.status(400).send({ message: error.details[0].message })
       
        // checking email not to be similar to another user
        const user = await UserModel.findOne({ email: req.body.email })
        if(user)
            return res.status(409).send({ message: 'User with given email already exists.' })
        
        
        const salt = await bcrypt.genSalt(Number(process.env.SALT))
        const hashPassword = await bcrypt.hash(req.body.password, salt)

        await new UserModel({ ...req.body, registerationDate: new Date(), password: hashPassword }).save()
        res.status(200).send({ message: 'User created successfully' })
    }catch(err){
        console.log(err);
        res.status(500).send({ message: 'Intenal Server Error' })
    }
})

module.exports = router