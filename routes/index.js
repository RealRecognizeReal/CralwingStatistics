const
    express = require('express'),
    router = express.Router(),
    MongoClient = require('mongodb').MongoClient,
    {mongodb}  = require('../config'),
    Promise = require('bluebird'),
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

                    page.find({formulasNumber: {$gt: 0}}).sort({_id: -1}).limit(10).toArray(function(err, recentPages) {
                        //console.log(allPagesNumber, formulaPagesNumber, formulasNumber, recentPages);

                        res.render('index',
                            {
                                title: 'alan statistics',
                                allPagesNumber, formulaPagesNumber, formulasNumber, recentPages
                            });

                        db.close();
                    })

                })

            })
        })
    })
});

router.get('/api/stat', Promise.coroutine(function*(req, res, next) {
    let db = yield MongoClient.connect(mongoUrl);

    let stat = db.collection('stat');

    let data = yield stat.find().sort({createdAt: -1}).limit(1000).toArray();

    db.close();

    res.send(data);
}));

router.get('/stat', Promise.coroutine(function*(req, res, next) {
    res.render('stat', {title: 'alan perf statistics'});
}));

module.exports = router;
