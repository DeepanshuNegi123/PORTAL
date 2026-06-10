
import { initSocket } from './socketconn.js';
import app from './app.js';
// import connectdb from './db.js';
import io from './socketconn.js';

const port = process.env.PORT || 3001;


const madeserver=app.listen(port, ()=>{

    console.log(` port has been opened on ${port} `);
    initSocket(madeserver);
    // connectdb();
    

})


export default madeserver;