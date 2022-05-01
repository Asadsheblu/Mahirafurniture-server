const express=require("express")
const app=express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express')
app.use(cors())
const port = process.env.PORT || 5000;
app.use(express.json());


app.get('/',(req,res)=>{
    res.send("Hello Mahira furiture backend sever")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7auxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const Productcollection=client.db("mahirafu").collection("product-item")
        
       app.get('/inventory',async(req,res)=>{
        const query={}
        const result=Productcollection.find(query)
        const item=await result.toArray()
        res.send(item)
       })
       //specific item find
       app.get('/inventory/:id',async(req,res)=>{
           const id=req.params.id ;
           const query={_id:ObjectId(id)}
           const result=await Productcollection.findOne(query)
           res.send(result)
       })
     //add new item
     app.post('/inventory',async(req,res)=>{
         const doc =req.body;
         const result=await Productcollection.insertOne(doc)
         res.send(result)
         
     })
     
     //delete specific item
     app.delete('/inventory/:id',async(req,res)=>{
         const id=req.params.id;
         const query={_id:ObjectId(id)}
         const result = await Productcollection.deleteOne(query);
         res.send(result)

     })
     //update specific item
     app.put('/inventory/:id',async(req,res)=>{
         const id=req.params.id 
         const updateUser=req.body
         const filter ={_id:ObjectId(id)}
         const options = { upsert: true };
         const updateDoc = {
            $set: {
              quantity:updateUser.quantity 
            },
          };
          const result = await Productcollection.updateOne(filter, updateDoc, options);
          res.send(result)

     })

    }
    finally{

    }

}
run().catch(console.dir)
app.listen(port,()=>{
    console.log(`Running server ${port}`);
})