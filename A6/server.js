const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// serve static files (images, css, client-side javascript)
app.use(express.static("public"))

// enables your server to receive data from a <form> html element
app.use(express.urlencoded({ extended: false }));

// enables your server to received data that is sent to it in json format
app.use(express.json());


// ejs
app.set("view engine", "ejs");

// mongo
const mongoose = require('mongoose');
const CONNECTION_STRING 
  =  "mongodb+srv://dbUser:Y0OSvUvnvIbUmNRO@cluster0.g281hol.mongodb.net/?retryWrites=true&w=majority"       // TODO!!!

const onServerStart = () => {
  console.log("Express http server listening on: " + HTTP_PORT);
  console.log(`http://localhost:${HTTP_PORT}`);
};


const connectDBAndStartServer = async () => {
  try {
    // 1. Attempt to connect to the database. If error, then jump to the catch block
    const conn = await mongoose.connect(CONNECTION_STRING);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  
    // 2. Try to start the server
    app.listen(HTTP_PORT, onServerStart)
 
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

// start the server
connectDBAndStartServer()


// ---------------------------------------------
// Schema & Model
// ---------------------------------------------
// schema
const Schema = mongoose.Schema;
const productSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  thumbnail: String,
});

// model
const Product = mongoose.model("products", productSchema);


// ----------------------------------------------
// endpoints
// ----------------------------------------------

// Home endpoint - API documentation
app.get("/", (req,res)=> {
  res.render("index")
})


// API endpoint: Retrieve products that meet the minimum specified price
app.get("/api/product/min/:price", async (req, res)=> {
  // get the type we should find
  const priceFromParams = req.params.price

  try {
    // receive the products that meets the requirement
    const results = await Product.find({ price: { $gte: priceFromParams } }).lean().exec()
    if (results.length === 0){
      return res.status(404).json({ errMsg: "No products match your search criteria." })
    }
    // return the HTTP response status code as success
    return res.status(200).json(results)

  } catch(err) {    
    console.log(err)
  
    // return an error message with HTTP response status code as internal server error
    return res.status(500).json({ errMsg: "error: Check server console for logs" })
  }  
})