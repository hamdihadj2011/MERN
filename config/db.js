const mongoose=require('mongoose')
const config=require('config')

const db=config.get('mongoURI')

const connectdb=async ()=>{
    try {
        await mongoose.connect(db,{
            useNewUrlParser: true ,
        useCreateIndex:true,
        useFindAndModify:false
        
    })
        console.log('mongodb connected ....')
    } catch (error) {
        console.error(error.message)
        //Exit proccess with failure
        process.emit(1)
    }
}

module.exports=connectdb
