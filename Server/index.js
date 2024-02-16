require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connection = require('./dbConnection')
const registerRoutes = require('./routes/register')
const authRoutes = require('./routes/auth')
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
let userId = ''

const app = express()

// connect to database
connection()

// models imported
const { UserModel, validateUserEditProfile } = require('./models/User')
const { MeetingModel, validateMeeting } = require('./models/Meeting')

app.use(cors())
app.use(express.json())
app.use(express.static("Real-Time Communication/client/src/accets/userImages"))

// register and auth modules are used here with the relevent endpoints 
app.use('/api/register', registerRoutes)
app.use('/api/auth', authRoutes)

// user endpoints

// get an individual user by id
app.get('/api/getUser/:id',(req, res) => {
    const id = req.params.id
    UserModel.findById({_id:id})
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

// update user info 
app.put('/api/updateUser/:id', (req, res) => {
     const {error} = validateUserEditProfile(req.body)
     if(error){
        return res.status(400).send({ message: error.details[0].message })
     }
    userId = req.params.id
    UserModel.findByIdAndUpdate({ _id: userId },{
        userName: req.body.userName,
        email: req.body.email,
        fullName: req.body.fullName,
        phone: req.body.phone
    }).then(users=> res.json(users))
    .catch(err => res.json(err))
})

// specify the storage
// this will specify a certin path as to store the actual image
let imageId = crypto.randomUUID();
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        return cb(null, path.join(__dirname, '../../Real-Time Communication/client/src/accets/userImages'))
    },
    filename: function(req, file, cb){
        return cb(null, `${imageId}_${file.originalname}`)
    }
})

const upload = multer({storage})

// upload user image profile
app.post('/api/upoad-image', upload.single('imageFile'), (req, res) => {
    UserModel.findByIdAndUpdate({ _id: userId },{
        imageName: `${imageId}_${req.file.originalname}`
    }).then(users=> res.json(users))
    .catch(err => res.json(err))
})


// create new meeting
app.post('/api/create-meeting', async (req, res) => {
    const { error } = validateMeeting(req.body)
    if(error){
        return res.status(400).send({ message: error.details[0].message })
    }
    
    let linkId = crypto.randomUUID();
    await MeetingModel.create({
        title: req.body.title,
        link: linkId,
        dateCreated: new Date(),
        user: req.body.userId
    })
    .then(s=>res.json(s))
    .catch(err=>console.log(err))

})

// get meetings by userId
// this endpoint gets all of the meetings that are related to a specific user
app.get('/api/getMeetings/:id', async (req, res) => {
    await MeetingModel.find({ user: req.params.id })
        .then(meetings => res.json(meetings))
        .catch(err => console.log(err))
})

// delete meeting functionality
app.delete('/api/deleteMeeting/:id', async (req, res) => {
    await MeetingModel.deleteOne({ _id: req.params.id })
        .then(meetings => res.json(meetings))
        .catch(err=>console.log(err))
})

// get a meeting by its link
// it would get an individual meeting by its link; that is a uniqe Id related to the meeting 
app.get('/api/getMeetingByLink/:id', async (req,res) => {
    await MeetingModel.find({ link: req.params.id })
        .then(meetings => res.json(meetings))
        .catch(err => console.log(err))
})

const port = process.env.PORT
app.listen(port, () => console.log(`Lestening on port ${port}`));

