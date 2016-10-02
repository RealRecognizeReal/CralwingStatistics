const
    express = require('express'),
    router = express.Router(),
    MongoClient = require('mongodb').MongoClient,
    {mongodb}  = require('../config'),
    assert = require('assert');

const mongoUrl = `mongodb://${mongodb.host}:${mongodb.port}/${mongodb.database}`;

router.get('/', function (req, res, next) {
    if(req.method.toLowerCase() === 'head') {
        return res.end();
    }

    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        let page = db.collection('page');
        let link = db.collection('link');

        page.count({}, function (err, allPagesNumber) {
            if(err) return next(err);

            page.count({formulasNumber: {$gt: 0}}, function (err, formulaPagesNumber) {
                if(err) return next(err);

                page.aggregate({$group: { _id: null, total: {$sum: "$formulasNumber"}}}, function( err, [{total: formulasNumber}]) {
                    if(err) return next(err);

                    console.log(allPagesNumber, formulaPagesNumber, formulasNumber);

                    res.render('index', {title: 'Express', allPagesNumber, formulaPagesNumber, formulasNumber});

                    db.close();
                })

            })
        })
    })
});

module.exports = router;
