const express = require('express')
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lvtch.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const app = express()
app.use(cors());
app.use(bodyParser.json());


//server key
const serviceAccount = require("./configs/burj-al-bangladesh-firebase-adminsdk-9nrwd-1e8700582e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");


    // Create
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    //Read
    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;

        if (bearer && bearer.startsWith('Bearer')) {
            const idToken = bearer.split(' ')[1];

            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail === queryEmail) {
                        bookings.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else {
                        res.status(401).send('un Authorized access')
                    }
                })
                .catch(function (error) {
                    // Handle error
                    res.status(401).send('un Authorized access')
                });
        }
        else{
           res.status(401).send('un Authorized access')
        }
    });

    //

});







app.get('/', (req, res) => {
    res.send('Hello World! iam the author of this website')
})

app.listen(4000)