'use strict';

const globals = require('./globals');
const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
const _ = require('lodash');

AWS.config.update({region: 'us-east-1'});

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports.log = async (event, context, callback) => {
    const response = {};
    const getData = async () => {
    try {
        let TrackID = uuidv1();
        const object = await JSON.parse(event.body);
        const UserID = object.user.ID;
        const ToTalSpendingTime = object.totalSpendingTime;
        let dataNeeded = [];
        _.forEach( object.activities, (piece) => {
            const UUID = uuidv1();
            const { type, dateAndTime } = piece;
            const marshalled = AWS.DynamoDB.Converter.marshall({
                UUID, TrackID, UserID, Activity:type, DateAndTime:dateAndTime, ToTalSpendingTime
            });
            const params = {
                TableName: globals.DYNAMO_DB_TABLE_NAME,
                Item: marshalled
            };
            dataNeeded.push(params);
        });
        return dataNeeded;
    }
    catch(err) {
        response.statusCode = 500;
        response.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        };
        response.body = JSON.stringify({err});
    }
    };
    try {
        let dataReady = await getData();
        for(let i = 0; i <dataReady.length; i++) {
             await ddb.putItem(dataReady[i]).promise();
        }
        response.statusCode = 200;
        response.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        };
        response.body = JSON.stringify({
            message: 'YESSSS'
        });
    }
    catch(err) {
        response.statusCode = 500;
        response.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        };
        response.body = JSON.stringify({err});
    }
    callback(null, response);
};