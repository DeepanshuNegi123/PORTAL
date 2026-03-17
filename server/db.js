
import mongoose from 'mongoose'

export const connectdb = async()=>{

const MONGO_URI=process.env.MONGO_URI;

try

{

const attach = await  mongoose.connect(MONGO_URI).then(()=>{console.log("connected to the mongodb")});
console.log('data base has been connected ');

}

catch(err){

    console.log(`error got is ${err}`);

}

}