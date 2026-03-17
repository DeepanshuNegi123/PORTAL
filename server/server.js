
import app from './app.js';
// import connectdb from './db.js';
import io from './socketconn.js';

const port = process.env.PORT || 3000;


const madeserver=app.listen(port, ()=>{

    console.log(` port has been opened on ${port} `);

    // connectdb();
    

})


export default madeserver;