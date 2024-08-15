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
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      console.log(page, size);
      




      const result = await gadgetsCollection.find().skip(page*size).limit(size).toArray()
      res.send(result)
      
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
  