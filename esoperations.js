// ------------------------------------------------------------------
// Module dependencies
// ------------------------------------------------------------------

var Db         = require('tingodb')().Db;
var express    = require('express');
var app        = express();
var router     = express.Router();
var bodyParser = require('body-parser');


// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

var db = new Db(process.env.DB_DATA_PATH || __dirname + '/data', {});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// ------------------------------------------------------------------
// Routes for the API
// ------------------------------------------------------------------

var clusters = db.collection('clusters');

router.route('/clusters')
    
    .get(function (req, res) {
        clusters.find().toArray(function (err, clusters) {
            if (err) {
                return next(err);
            }
            res.json(clusters);
        });
    })

    .post(function (req, res) {
        console.log(req.body);
        clusters.save(req.body, function (err, result) {
            if (err) {
                return next(err);
            }
            res.status(201).json({ message : 'New cluster added' });
        });
    });

router.route('/clusters/:id')
    .get(function (req, res, next) {
        var id = req.params.id;
        clusters.findOne({ _id: id }, function (err, item) {
            if (err) {
                return next(err);
            }
            if (!item) {
                return next({status : 404, message : 'Not found'});
            }

            res.json(item);
        })
    })

    .delete(function (req, res, next) {
        var id = req.params.id;
        clusters.remove({ _id: id }, function (err, result) {
            if (err) {
                return next(err);
            }

            res.json({ message : 'Cluster deleted' });
        })
    })


app.use('/api', router);

app.use(function (err, req, res, next) {
    if (err.status) {
        res.status(err.status).json(err);
    }
    else {
        console.error('Error : ' + err);
        res.status(500).send('Something wrong happened...');
    }
});


// ------------------------------------------------------------------
// Gooooo !
// ------------------------------------------------------------------

var port = process.env.PORT || 5678;
app.listen(port);
console.log('Open localhost:' + port);