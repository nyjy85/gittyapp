'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var File = mongoose.model('File');

module.exports = router;

router.post('/', function(req, res){
	console.log('this is req.body', req.body)
	File.create(req.body)
		.then(function(file){
			console.log("this is the file in the post", file)
			res.send({message: "file successfully added"});
		}).then(null, function(err){
			res.status(500).send(err.message);
		});
});

// find by file_id - grabs all the data and sends to front
// 	perhaps make it so that we find by fileUrl?
router.get('/', function(req, res, next){
	console.log('this be req.query', req.query)
	File.findOne({fileUrl: req.query.url})
	.populate('highlighted')
	.exec()
	.then(function(file){
		console.log('this be file yo', file)
		res.send(file)
	})
	.then(null, next);
});

//api/file/repo/repowhatevers
// find files by repo
// :id/file (repo.id)
router.get('/repo/:repo', function(req, res, next){
	console.log('find files by repo')
	File.find({"repo.name": req.params.repo})
	.exec()
	.then(function(files){
		console.log('files', files)
		res.send(files);
	})
	.then(null, next);
});

router.delete('/', function(req, res, next){
	console.log('delete files by url', req.query.url);
	File.remove({fileUrl: req.query.url})
	.exec()
	.then(function(deleted){
		console.log('files', deleted)
		res.send({deleted: deleted});
	})
	.then(null, next);
})

