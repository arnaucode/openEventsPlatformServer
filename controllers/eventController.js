var express = require("express");
var app = express();
var config = require('../config'); // get our config file
app.set('superSecret', config.secret); // secret variable
var mongoose = require('mongoose');

var userModel = mongoose.model('userModel');
var eventModel = mongoose.model('eventModel');

var pageSize = config.pageSize;

var request = require('request');

exports.getCategoriesList = function(req, res) {
    var categoriesList = [{
            name: "esport"
        },
        {
            name: "xerrada"
        },
        {
            name: "taller"
        },
        {
            name: "festa"
        },
        {
            name: "concert"
        },
        {
            name: "musica"
        }
    ]
    res.status(200).jsonp(categoriesList);
};
exports.getAllEvents = function(req, res) {
    eventModel.find({
            date: {
                $gte: new Date()
            },
            type: {
                $nin: ["alert"]
            } //cal filtrar per type d'event, aquí només agafem els type: alert
        })
        .lean()
        .populate('user', 'username img shortDescription')
        .sort('date')
        .limit(pageSize)
        .skip(pageSize * Number(req.query.page))
        .exec(function(err, events) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(events);
        });
};
exports.getAllAlerts = function(req, res) {
    eventModel.find({
            date: {
                $gte: new Date()
            },
            type: "alert"
        })
        .lean()
        .populate('user', 'username img shortDescription')
        .sort('date')
        .limit(pageSize)
        .skip(pageSize * Number(req.query.page))
        .exec(function(err, events) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(events);
        });
};

exports.getEventById = function(req, res) {
    eventModel.findOne({
            _id: req.params.eventid
        })
        .lean()
        .populate('user', 'username img shortDescription')
        .exec(function(err, event) {
            if (err) return res.send(500, err.message);
            if (!event) {
                res.json({
                    success: false,
                    message: 'event not found.'
                });
            } else if (event) {

                res.status(200).jsonp(event);
            }
        });
};


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function postImage(req, res, user, filename, fileImg) {
    url = "http://127.0.0.1:3050/image";
    var importFile = function(fileImg) {
        var decodedFile = new Buffer(fileImg, 'base64');
        var r = request.post(url, function(err, httpResponse, body) {
            if (err) {
                console.log(err);
            }
            //console.log(body);
            addNewEvent(req, res, user, body);
        });
        var form = r.form();
        form.append('file', decodedFile, {
            filename: filename + '.png'
        });
    }
    importFile(fileImg);
}
function addNewEvent(req, res, user, imgUrl){
    //adding random number to the url, to force ionic reload the image
    req.body.img = imgUrl+ "?" + getRandomInt(1, 9999);
	var event = new eventModel({
		title: req.body.title,
		description: req.body.description,
		img: req.body.img,
		date: req.body.date,
		categories: req.body.categories,
		generateddate: Date(),
		location: req.body.location,
		user: user._id
	});
	event.save(function(err, event) {
		if (err) return res.send(500, err.message);

		user.events.push(event._id);
		user.save(function(err, user) {
			if (err) return res.send(500, err.message);
			req.params.eventid=event._id;
			exports.getEventById(req, res);
		});
	}); //end of event.save
}
exports.addEvent = function(req, res) {
    userModel.findOne({
            'tokens.token': req.headers['x-access-token']
        })
        .exec(function(err, user) {
            if (err) return res.send(500, err.message);
            if (!user) {
                console.log("user not found");
                res.json({
                    success: false,
                    message: 'User not found.'
                });
            } else if (user) {
                if (req.body.img) {
					imgname = getRandomInt(1, 9999) + "_" + getRandomInt(1, 9999);
                    postImage(req, res, user, "event_" + imgname, req.body.img);
                }else{
					addNewEvent(req, res, user, "");
				}
            }
        }); //end of usermodel.find
};
exports.addAlert = function(req, res) {
    userModel.findOne({
            'tokens.token': req.headers['x-access-token']
        })
        .exec(function(err, user) {
            if (err) return res.send(500, err.message);
            if (!user) {
                console.log("user not found");
                res.json({
                    success: false,
                    message: 'User not found.'
                });
            } else if (user) {
                var event = new eventModel({
                    title: req.body.title,
                    description: req.body.description,
                    date: req.body.date,
                    generateddate: Date(),
                    user: user._id,
                    type: "alert"
                });

                event.save(function(err, event) {
                    if (err) return res.send(500, err.message);

                    user.events.push(event._id);
                    user.save(function(err, user) {
                        if (err) return res.send(500, err.message);
                        exports.getAllEvents(req, res);
                    });
                }); //end of event.save
            }
        }); //end of usermodel.find
};
exports.deleteEvent = function(req, res) {
    userModel.findOne({
            'tokens.token': req.headers['x-access-token']
        })
        .exec(function(err, user) {
            if (err) return res.send(500, err.message);
            eventModel.findOne({
                    _id: req.params.eventid,
                    user: user._id
                })
                .exec(function(err, event) {
                    if (err) return res.send(500, err.message);
                    if (event.user.equals(user._id)) {
                        event.remove(function(err) {
                            if (err) return res.send(500, err.message);

                            console.log("deleted");
                            exports.getAllEvents(req, res);
                        });
                    }
                });
        });
}; //funciona, pero no esborra les referències dels users als events que s'esborren. Més endavant caldria fer-ho.

/*
un get events by following, que seria:
s'envia un post /events/following
amb la data:
{
  "following": ["user1", "user2", "user3"]
}
que bàsicament és una array amb els followings que tens
això retorna els events d'aquests users que segueixes
*/

exports.getEventsByFollowingArray = function(req, res) {
    /*if (req.body.users == null) {
        res.status(200).jsonp([]);
    }*/
    eventModel.find({
            date: {
                $gte: new Date()
            },
            'user': req.body.users,
            type: {
                $nin: ["alert"]
            } //cal filtrar per type d'event, aquí només agafem els type: alert
        })
        .lean()
        .populate('user', 'username img shortDescription')
        .sort('date')
        .limit(pageSize)
        .skip(pageSize * Number(req.query.page))
        .exec(function(err, events) {
            if (err) return res.send(500, err.message);

            console.log(events);
            res.status(200).jsonp(events);
        });
};

/*
un get events by categories, que seria:
s'envia un get /events/category/:category
això retorna els events d'aquests users que segueixes
*/
exports.getEventsByCategory = function(req, res) {
    eventModel.find({
            date: {
                $gte: new Date()
            },
            'categories.name': req.params.category
        })
        .lean()
        .populate('user', 'username img shortDescription')
        .sort('date')
        .limit(pageSize)
        .skip(pageSize * Number(req.query.page))
        .exec(function(err, events) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(events);
        });
};

exports.getEventsByDay = function(req, res) {
    var dayRequested = new Date(req.params.day);
    eventModel.find({
            date: {
                $gte: dayRequested
            }
        })
        .lean()
        .populate('user', 'username img shortDescription')
        .sort('date')
        .limit(pageSize)
        .skip(pageSize * Number(req.query.page))
        .exec(function(err, events) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(events);
        });
};
