const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000','https://localhost:3433','http://localhost:3001'];

var corsOptionsDelegate = (req,callback) => {
        var corOptions;
        if(whitelist.indexOf(req.header('Origin')) !== -1) {
                corsOptions = { origin : true };localhost
        }
        else{
                corsOptions = { origin : false }
        }
        callback(null,corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate); 