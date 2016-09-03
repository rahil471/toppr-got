'use strict';
var express = require('express')
  , router = express.Router();
var battleModel = require('../models/battleModel');

/** list of battles */
router.get('/list', function(req, res) {
	var battleModelObject = new battleModel();
	battleModelObject.list((err, data) => {
		if(err){
			return res.json({responseCode:1, responseDesc:err}); 
		}
		return res.json({responseCode:0, responseDesc:'Success', battles: data});
	});	
});

/** total count of battles */
router.get('/count', function(req, res) {
	var battleModelObject = new battleModel();
	battleModelObject.count((err, data) => {
		if(err){
			return res.json({responseCode:1, responseDesc:err}); 
		}
		return res.json({responseCode:0, responseDesc:'Success', battlesCount: data.count});
	});
});

/** search battle by name */
router.get('/search', function(req, res) {
	if(!req.query.name) {
		return res.json({responseCode:1, responseDesc:'No name passed'}); 
	}
	var battleModelObject = new battleModel();
	battleModelObject.search(req.query.name, (err, data) => {
		if(err){
			return res.json({responseCode:1, responseDesc:err}); 
		}
		return res.json({responseCode:0, responseDesc:'Success', result: data});
	});
});

/** statistics */
router.get('/stats', function(req, res) {
	var battleModelObject = new battleModel();
	battleModelObject.stats((err, data) => {
		if(err){
			return res.json({responseCode:1, responseDesc:err}); 
		}
		return res.json({responseCode:0, responseDesc:'Success', stats: data});
	});
});

module.exports = router;