'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Highlight = mongoose.model('Highlight');

module.exports = router;

// gets all highilights. prob won't be necessary
router.get('/', function(req, res, next){
	console.log('hit da highlight yo')
	Highlight.find({})
	.exec()
	.then(function(data){
		res.send(data)
	})
	.then(null, next)
})

// just a test to get a highlight by id and see if persistence works
router.get('/:id', function(req, res, next){
	Highlight.findOne({_id: req.params.id})
	.exec()
	.then(function(highlighted){
		res.send(highlighted)
	})
	.then(null, next) 
});

router.get('/:user', function(req, res, next){
	Highlight.find({commenter: req.params.user})
	.exec()
	.then(function(highlighted){
		res.send(highlighted)
	})
	.then(null, next)
})

// make sure to send back the User._id
// creates a new highlight doc and updates File
router.post('/', function(req, res, next){
	console.log('req.body from da frrronnnt', req.body);
	var newData = req.body.newData;
	var fileInfo = req.body.fileInfo;
	var repoUrl = req.body.repoUrl;

	Highlight.checkForFileOnHighlight(newData, fileInfo, repoUrl, next)
	.then(function(updatedFile){
		//if you want something to res.send, you can change updatedFile in the static
		//in the highlight
		res.send("You made a new file/updated the file model with your highlight info");
	})
});

router.put('/:id', function(req, res, next){
	var id = req.params.id;
	var comment = req.body.data.comment;
	var url = req.body.data.url;
	Highlight.updateComment(id, comment, url, next)
	.then(function(response){
		res.send('You have updated the comments')
	})
})


router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	var url = req.body.url;
	Highlight.deleteHighlight(id, url, next)
	.then(function(updatedFile){
		res.send('You have removed the highlight from the file');
	})
});
