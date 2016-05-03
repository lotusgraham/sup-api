var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');
var Message = require('./models/message')

var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here
app.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.json(users);
    });
});

app.post('/users', jsonParser, function(req, res) {
    if (!req.body.username) {
      // return res.sendStatus(422);
      var message = {
        message: 'Missing field: username'
      }
      return res.status(422).json(message)
    }

    if (typeof req.body.username != 'string' ){
        var message2 = { message: 'Incorrect field type: username'}

      return res.status(422).json(message2)
    }

    var user = new User({
        username: req.body.username
    });

    user.save(function(err, user) {
      res.body= {}
        if (err) {
            return res.sendStatus(500);
        }


        return res.status(201).location('/users/' + user._id).json({});
    });
});


app.get('/users/:userId', function(req, res) {
    User.findOne({
        _id: req.params.userId
    }, function(err, user) {
        if (err) {
            return res.sendStatus(500);
        }
        var message = {message: 'User not found'};
        if(!user) {
             return res.status(404).json(message);
        }

        return res.json(user);
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
    if (!req.body.username) {
      // return res.sendStatus(422);
      var message = {
        message: 'Missing field: username'
      }
      return res.status(422).json(message)
    }
    if (typeof req.body.username != 'string' ){
        var message2 = { message: 'Incorrect field type: username'}

      return res.status(422).json(message2)
    }
    var newUser = req.body;
    User.findByIdAndUpdate(req.params.userId, newUser, {upsert:true}, function(err) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).json({});
    })
});

app.delete('/users/:userId', jsonParser, function(req, res) {
   User.findByIdAndRemove(req.params.userId, function(err, user) {
       if (err) {
         return res.sendStatus(500);
       }
       if (!user) {
         return res.status(404).json({message: 'User not found'});
       }
       return res.status(200).json({});
   });
});

//messages

app.get('/messages', function(req, res) {
    Message.find({}, function(err, messages) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.json(messages);
    });
});

app.post('/messages', jsonParser, function(req, res) {
    var message = new Message({
        from: req.body.from,
        to: req.body.to,
        text: req.body.text
    });

    message.save(function(err, message) {
        res.body= {}
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(201).location('/message/' + message.from).json({});
    });
});

var databaseUri = global.databaseUri || 'mongodb://localhost/sup';
mongoose.connect(databaseUri).then(function() {
    app.listen(8080, function() {
        console.log('Listening on localhost:8080');
    });
});

module.exports = app;
