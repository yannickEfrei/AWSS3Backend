/*node express app tat uploads and downloads objects from amazon S3*/
var express = require('express');
const cors = require( 'cors');
var fs = require('fs');
var bodyParser = require('body-parser');
var fileupload = require("express-fileupload");
var amazonS3 = require('aws-sdk');

require("dotenv").config();

var app = express();
app.use(cors());
app.use(fileupload());

// Initializing the amazonS3 object.
amazonS3.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  subregion: process.env.REGION
});

var s3Bucket = new amazonS3.S3({ params: { Bucket: process.env.S3_BUCKET } });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// upload route
app.post('/api/upload', function (req, res) {

    if (req.files) {
        var file = req.files.file,
            filename = file.name;
        var params = {
            Key: filename,
            Body: file.data,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        // upload file to S3
        s3Bucket.upload(params, function (err, data) {
            if (err) {
                console.log('Error occured while trying to upload to AWS: ', err);
                res.send(err);
            } else {
                console.log("Upload Success", data.Location);
                res.json(data);
            }
        });
    } else {
        console.log('no files')
    }
});

// list route
app.get('/api/list', function (req, res) {
    // list all files from the S3 bucket
    s3Bucket.listObjects(function (err, data) {
        if (err) {
            console.log('Error occured while trying to retrieve files from AWS: ' + err);
            res.json("Error occured while trying to retrieve files from AWS: " + err);
        } else {
            var files = [];
            data.Contents.forEach(function (file) {
                files.push({ key: file.Key });
            });
            console.log('files', files);
            res.json(files);
        }
    });
});

app.get('/api/delete', (req,res) => {
    s3Bucket.deleteObject({  Key: '7fb2f134-fc69-4bc9-abc6-c2f49c12b7f8.jpg' }, (err, data ) => {
        if (err) console.log(err, err.stack);
        else console.log('data',data);
    })
})

// app listen
app.listen(8080, function () {
    console.log('Working on port 8080');
});