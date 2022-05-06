const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_ID}:${process.env.DB_PASS}@cluster0.ygxz8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const productCollection = client.db("techHub").collection("products");

        //Post API
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            console.log('adding new user', newProduct);
            res.send(result);
        });

        //products API
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query).limit(6);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const stockItem = await productCollection.findOne(query);
            res.send(stockItem);
        });

        //update stock
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const previousProduct = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedStock = {
                $set: {
                    quantity: updatedProduct.quantity
                }
            };
            const result = await productCollection.updateOne(previousProduct, updatedStock, option);
            res.send(result);
        });

        //Delete a product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });
    }
    finally {

    }
}
run().catch(console.dir);
//https://protected-ridge-43119.herokuapp.com/

app.get('/', (req, res) => {
    res.send('Tech Hub Server is running..');
});
app.listen(port, () => {
    console.log('Tech-Hub-Server is Listening from port:', port);
});