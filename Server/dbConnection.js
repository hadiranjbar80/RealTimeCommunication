const mongoose = require('mongoose')

const connectToDataBase = () =>{
    const connectionParams = {
        useNewUrlParser: true,
		useUnifiedTopology: true,
    }

    try{
        mongoose.connect(process.env.DB, connectionParams)
        console.log('Connected to database successfully');
    }catch(err){
        console.log(err);
        console.log('could not connect to datatbase!');
    }
}

module.exports = connectToDataBase