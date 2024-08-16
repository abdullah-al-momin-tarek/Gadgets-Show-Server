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


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db("gadgetsDB");
const gadgetsCollection = database.collection("gadgetsCollection")

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

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


    console.log("this is test",sortOptions, req.query.dateSort);
    
      
      const result = await gadgetsCollection.find(query).sort(sortOptions).skip(page*size).limit(size).toArray()
      res.send(result)}
      catch{
        res.status(500).send({
          message: "Something went wrong",
          error: error.message
      });
      }
      
    })

    app.get("/gadgetsCount", async(req,res)=>{
      const count = await gadgetsCollection.estimatedDocumentCount()
      
      res.send({count})
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  