/**
 * Created by gimtaeu on 2016. 10. 19..
 */

const
    MongoClient = require('mongodb').MongoClient,
    {mongodb}  = require('./config'),
    assert = require('assert'),
    mongoUrl = `mongodb://${mongodb.host}:${mongodb.port}/${mongodb.database}`;

let timer;

function log() {
    MongoClient.connect(mongoUrl, function (err, db) {
        console.log("Connected correctly to server");

        if(err) {
            console.error(err);
            return;
        }

        let page = db.collection('page');
        let stat = db.collection('stat');

        page.count({}, function (err, allPagesNumber) {
            if(err) {
                console.error(err);
                return;
            }

            page.count({formulasNumber: {$gt: 0}}, function (err, formulaPagesNumber) {
                if(err) {
                    console.error(err);
                    return;
                };

                page.aggregate({$group: { _id: null, total: {$sum: "$formulasNumber"}}}, function( err, [{total: formulasNumber}]) {
                    if(err) {
                        console.err(err);
                        return;
                    }

                    stat.insertOne({
                        allPagesNumber, formulaPagesNumber, formulasNumber, createdAt: new Date()
                    })
                });
            });
        });

    });
}

function start(interval=60000) {
    if(timer) return;

    log();

    timer = setInterval(log, interval)
}

function stop() {
    if(timer) {
        clearInterval(timer);
    }
}

module.exports = {
    start: start,
    stop: stop
};