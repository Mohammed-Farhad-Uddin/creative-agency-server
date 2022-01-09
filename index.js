const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const fileUpload=require('express-fileupload');
require("dotenv").config();
const { MongoClient, ObjectId } = require('mongodb');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('addServices'));
app.use(fileUpload());
const urlencodedParser = bodyParser.urlencoded({ extended: false });


app.get('/', (req, res) => {
  res.send('Hello World!')
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8xf6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_CollectionOne}`);
  const allServicesCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_CollectionTwo}`);
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_CollectionThree}`);
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_CollectionFour}`);
    // console.log(err);
   
   
    //admin
    app.post('/addAdmin',(req,res)=>{
      const admin=req.body;
      console.log(admin)
      adminCollection.insertOne(admin)
      .then(result=>{
        // console.log(result);
        res.send(result.acknowledged);
      })
    });


    //Services 
    app.post('/adminAddService',(req,res)=>{
        // const imageInfos=req.files;
        const imageFile=req.files.file;
        const title=req.body.title;
        const description=req.body.description;
        // console.log(title,description,imageInfos,imageFile)
        const readImage=req.files.file.data;
        const encodedImage=readImage.toString('base64');
        const imageInfo={
          contentType:req.files.file.mimetype,
          size:req.files.file.size,
          image:Buffer.from(encodedImage,'base64')
        }
        console.log(imageInfo);
        allServicesCollection.insertOne({title,description,imageInfo})
        .then((result)=>{
          // console.log(result);
          res.send(result.acknowledged);
        })
    });

    app.get('/getAllServices',(req,res)=>{
      allServicesCollection.find({}).toArray((err,documents)=>{
          // console.log(documents,"documebnts")
          res.send(documents)
      })
    });

    //Specific id service for Order
    app.get('/clickedService/:id',(req,res)=>{
      const id=req.params.id;
      allServicesCollection.find({_id: ObjectId(id)}).toArray((err,document)=>{
        // console.log(document[0]);
        res.send(document[0])
      })
    });

    

    //Review
    app.post('/postReview',(req,res)=>{
        const data=req.body;
        // console.log(data);
        reviewCollection.insertOne(data)
        .then(result=>{
          res.send(result.acknowledged)
        })
    });
    app.get('/getReview',(req,res)=>{
        reviewCollection.find({}).toArray((err,reviews)=>{
          // console.log(reviews);
            res.send(reviews)
        })
    });

    //Order Part
    app.post('/postOrder', (req, res) => {
      const orderInfo = req.body;
      console.log(orderInfo);
      orderCollection.insertOne(orderInfo)
      .then(result=>{
        // console.log(result);
        res.send(result.acknowledged)
      })
    });

    app.post('/getClientOrderedList', (req, res) => {
      const email = req.body.email;
      orderCollection.find({email:email}).toArray((err,documents)=>{
        res.send(documents);
      })
    });

    app.get('/getAllOrderedList',(req,res)=>{
          orderCollection.find({}).toArray((err,documents)=>{
            res.send(documents);
          })
    });



    ///confirm isAdmin for dashboardList
    app.post('/isAdmin', (req, res) => {
      const email = req.body.email;
      //  console.log(email);
      adminCollection.find({ email: email })
        .toArray((err, admin) => {
          res.send(admin.length>0) //length jodi 0 tekhe boro hoi mane condition jodi true hoi.tahole true send korbe
        })
    });




});
app.listen( process.env.PORT|| port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})