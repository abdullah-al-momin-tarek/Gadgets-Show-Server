const express = require('express')
const cors = require('cors')
const app = express()
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())

const uri = process.env.DB_URI
console.log(uri);


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { 
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db("gadgetsTest");
const gadgetsTestCollection = database.collection("gadgetsTestCollection")

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get("/gadgets", async (req,res)=>{
      try{
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)

      let query = {};
      let sortOptions = {};

      // search
      if (req.query.search ) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = { ...query, name: { $regex: searchRegex } };
        console.log(query);
      }
      
      // price
      if (req.query.priceOrder) {
        if (req.query.priceOrder === "lowToHigh") {
          sortOptions.price = 1; 
        } else if (req.query.priceOrder === "highToLow") {
          sortOptions.price = -1; 
        }
    }
    // date
    if(req.query.dateSort){
      if(req.query.dateSort === "newestFirst"){
        sortOptions.createdAt= -1;
      }
      else if(req.query.dateSort === "oldestFirst"){
        sortOptions.createdAt= 1;
      }
    }

    // Category
    if(req.query.category){
      if(req.query.category === "Watch"){
        query.category = req.query.category;
      }
      else if(req.query.category === "Mobile"){
        query.category = req.query.category;
      }
    }

    // Brand
    if(req.query.brand){
      if(req.query.brand === "All"){
        console.log("Nothing");
      }
      else{
        query.brand = req.query.brand;
      }
    }

    

    // Price Range
    if(req.query.priceRange){
      if(req.query.priceRange === "50to199"){
        query = { ...query, price: { $gte: 50, $lte: 199 } };
    } else if(req.query.priceRange === "200to399"){
        query = { ...query, price: { $gte: 200, $lte: 399 } };
    } else if(req.query.priceRange === "400to599"){
        query = { ...query, price: { $gte: 400, $lte: 599 } };
    } else if(req.query.priceRange === "600to799"){
        query = { ...query, price: { $gte: 600, $lte: 799 } };
    } else if(req.query.priceRange === "800to1000"){
        query = { ...query, price: { $gte: 800 } };
    }
    
    }


    
      
      const result = await gadgetsTestCollection.find(query).sort(sortOptions).skip(page*size).limit(size).toArray()
      res.send(result)}
      catch (error){
        res.status(500).send({
          message: error.message,
      });
      }
      
    })

    app.get("/gadgetsCount", async(req,res)=>{
      const count = await gadgetsTestCollection.estimatedDocumentCount()
      
      res.send({count})
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Data server is running");
  });
  app.listen(port, () => {
    console.log("Server running on port: ", port);
  });
  