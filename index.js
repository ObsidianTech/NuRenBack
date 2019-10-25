const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('mongodb');
const config = require('./config.json');

const app = express();

const env = process.env.PROJECTENV;

app.use(bodyParser.json());
app.use(cors());

app.get('/health', async (req, res) => {
    res.send("Health check: Main API active.");
});

app.post('/', async (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

app.post('/upload', async (req, res) => {
    const result = await newVideoUpload(req.body);
    res.send(result);
});

const newVideoUpload = async (data) => {
    const videos = await loadNewVideoEvents();
    const keys = await loadNewVideoKeys();
    await videos.insertOne({
        eventTime: data.Records[0].eventTime,
        bucket: data.Records[0].s3.bucket.name,
        video: data.Records[0].s3.object.key,

    });
    await keys.insertOne({
        key: data.Records[0].s3.object.key,
    });
    return "Uploaded Successfully.";
};

const loadNewVideoEvents = async () => {
    const client = await mongodb.MongoClient.connect
    (config.env[currentENV()].connectionString.toString(), {
        useNewUrlParser: true
    });
    return client.db(config.env[currentENV()].db).collection('newvideoevents');
};

const loadNewVideoKeys = async () => {
    const client = await mongodb.MongoClient.connect
    (config.env[currentENV()].connectionString.toString(), {
        useNewUrlParser: true
    });
    return client.db(config.env[currentENV()].db).collection('nurenvideokeys');
};

const currentENV = () => {
    if(!env){
        return 'development';
    }
    return env
}

app.listen(process.env.PORT || 7570);
console.log("Video Upload Api running", currentENV());