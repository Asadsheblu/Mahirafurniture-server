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
function verifyJWT(req,res,next){
    const authHeader=req.headers.authorization
    if(authHeader){
        return res.status(401).send({message:"unauthorized access"})
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:"forbidden access"})
        }
        console.log(decoded);
        req.decoded=decoded
    })
    console.log(authHeader);
    next()
}

app.get('/',(req,res)=>{
    res.send("Hello Mahira furiture backend sever")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7auxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const Productcollection=client.db("mahirafu").collection("product-item")
        //auth
        app.post('/token',async(req,res)=>{
           
           console.log(authHeader);
            const user=req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN,{
                expiresIn:"1d"
            });
            res.send({token})
        })
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
     //my item
     app.get('/myitem',verifyJWT,async(req,res)=>{
        const decodedEmail=req.decoded.email
            const email=req.query.email
           if(email===decodedEmail){
            const query={email:email}
            const orderResult=Productcollection.find(query)
            const result=await orderResult.toArray()
            res.send(result)
           }
           else{
            return res.status(403).send({message:"forbidden access"})
           }
        
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