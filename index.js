const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors({
  origin:[
    'https://online-marketplaces-auth.web.app',
    'http://localhost:5173',
    'https://online-marketplaces-auth.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uk63wkj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db('jobsDB').collection('jobs')
    const jobsBid = client.db('jobsDB').collection('bids')

    app.get('/jobs', async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/jobs', async (req, res) => {
      const newJob = req.body;
      // console.log(newJob);
      const result = await jobsCollection.insertOne(newJob)
      res.send(result);
    })

    //for delete
     app.delete('/jobs/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
     })


    //for update
    app.get('/jobs/:id',async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollection.findOne(query);
      res.send(result)
  })

    app.put('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateJobs = req.body;
      const jobs = {
        $set: {
          image: updateJobs.image,
          email: updateJobs.email,
          jobTitle: updateJobs.jobTitle,
          category: updateJobs.category,
          deadline: updateJobs.deadline,
          description: updateJobs.description,
          minimumPrice: updateJobs.minimumPrice,
          maximumPrice: updateJobs.maximumPrice
        }
      }
      const result = await jobsCollection.updateOne(filter, jobs, options);
      res.send(result);
    })

    //Bids
    app.get('/bids', async (req, res) => {
      const cursor = jobsBid.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/bids', async (req, res) => {
      const newBid = req.body;
      const result = await jobsBid.insertOne(newBid)
      res.send(result);
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



app.get('/', (req, res) => {
  res.send('online-marketplaces-server-site')
})

app.listen(port, () => {
  console.log(`online-marketplaces-server-site is running on port ${port}`);
})