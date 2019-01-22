'use strict';

const globals = require('./globals');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports.log = async (event, context, callback) => {
    const response = {};
    try {
        console.log('Payload: ', JSON.parse(event.body));
    const obj = JSON.parse(event.body);

    // Marshall karos

    const Marshalled = AWS.DynamoDB.Converter.marshall({
        UUID: obj.UUID,
        foo: obj.foo
    });

    const params = {
        TableName: globals.DYNAMO_DB_TABLE_NAME,
        Item: Marshalled
    }

    let res = await ddb.putItem(params).promise();
    response.statusCode = 200;
    response.body = JSON.stringify({
        message: 'YESSSS'
    });
    }
    catch(err) {
        response.statusCode = 500;
        response.err = JSON.stringify({err});
    }
    callback(null, response);
}