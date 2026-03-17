import express, { urlencoded } from 'express';
import cors from 'cors';

const app = express();

// middlewares type global
app.use(express.json());
app.use(cors());
app.use(urlencoded({extended:true}));


app.get('/',(req,res)=>{
    res.send('api is running ');
})

export default app;