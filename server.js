var express = require('express'),
    mongoskin = require('mongoskin'),
    bodyParser = require('body-parser'),
    winston = require('winston')

var app = express()
app.use(bodyParser())

var db = mongoskin.db('mongodb://yourmongoserveruri', {safe:true})

app.param('collectionName', function(req, res, next, collectionName) {
	req.collection = db.collection(collectionName)
	return next()
})

// curl -X GET http://api-endpoint
app.get('/', function(req, res, next) {
    res.send('Hello!')
})

// curl -X GET http://api-endpoint/collection-name
app.get('/:collectionName', function(req, res, next) {
	winston.info("GET " + req.params.collectionName)
	req.collection.find({},{sort:{'_id':-1}}).toArray(function(e, results) {
		if (e) return next(e)
			res.send(results)
	})
})

// curl -X GET http://api-endpoint/collection-name/id
app.get('/:collectionName/:id', function(req, res, next) {
	winston.info("GET " + req.params.collectionName + "/" + req.params.id)
	req.collection.findById(req.params.id, function(e, result) {
		if (e) return next(e)
			res.send(result)
	})
})

// curl -X DELETE http://api-endpoint/collection-name/id
app.delete('/:collectionName/:id', function(req, res, next) {
	winston.info("DELETE " + req.params.collectionName + "/" + req.params.id)
	req.collection.removeById(req.params.id, function(e, result) {
		if (e) return next(e)
			res.send((result == 1)?{'msg':'success'}:{'msg':'error'})
	})
})

// curl -X POST -d "question=Would you rather sink or swim?" http://api-endpoint/collection-name
app.post('/:collectionName', function(req, res) {
	winston.info("POST " + req.params.collectionName)
	req.collection.insert(req.body, {}, function(e, results) {
		if (e) return next(e)
			res.send(results)
	})
})

// curl -X PUT -d "question=Would you rather sink or swim?" http://api-endpoint/collection-name/id
app.put('/:collectionName/:id', function(req, res) {
	winston.info("PUT " + req.params.collectionName + "/" + req.params.id)
	req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, result) {
		if (e) return next(e)
			res.send((result == 1)?{'msg':'success'}:{'msg':'error'})
	})
})

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP)