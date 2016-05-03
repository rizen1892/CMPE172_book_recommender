var Engine, app, async, engine, express, port;
Engine = require('./lib');
async = require('async');
express = require('express');
books = require('./data/books.json');

engine = new Engine;
app = express();

app.set('views', "/views");
app.set('view engine', 'jade');

app.route('/reload').post(function(arg, res, next) {
  var query;
  query = arg.query;
  return async.series([
    (function(engine) {
      return function(done) {
        return engine.similarity.update(query.user, done);
      };
    })(this), 

    (function(engine) {
      return function(done) {
        return engine.recommendations.update(query.user, done);
      };
    })(this)
  ], 

    (function(engine) {
    return function(err) {
      if (err != null) {
        return next(err);
      }
      return res.redirect("/?user=" + query.user);
    };
  })(this));

});

app.route('/like').post(function(arg, res, next) {
  var query;
  query = arg.query;
  console.log(query);
  if (query.unset === 'yes') {
    return engine.likes.remove(0,query.user, query.book, (function(engine) {
      return function(err) {
        if (err != null) {
          return next(err);
        }
        return res.redirect("/?user=" + query.user);
      };
    })(this));
  } 

   else {
	var like_or_dislike = 1;
    return engine.dislikes.remove(like_or_dislike,query.user, query.book, (function(engine) {
      return function(err) {
        if (err != null) {
          return next(err);
        }
        return engine.likes.add(like_or_dislike, query.user, query.book, function(err) {
          if (err != null) {
            return next(err);
          }
          return res.redirect("/?user=" + query.user);
        });
      };
    })(this));
  }
});


app.route('/dislike').post(function(arg, res, next) {
  var query;
  query = arg.query;
  if (query.unset === 'yes') {
    return engine.dislikes.remove(1,query.user, query.book, (function(engine) {
      return function(err) {
        if (err != null) {
          return next(err);
        }
        return res.redirect("/?user=" + query.user);
      };
    });
  } 
  
  else {
	var l_or_d = 0;
    return engine.likes.remove(l_or_d,query.user, query.book, (function(engine) {
      return function(err) {
        if (err != null) {
          return next(err);
        }
        return engine.dislikes.add(l_or_d, query.user, query.book, function(err) {
          if (err != null) {
            return next(err);
          }
          return res.redirect("/?user=" + query.user);
        });
      };
    });
  }
});

app.route('/').get(function(arg, res, next) {
  var query;
  query = arg.query;
  return async.auto({
    likes: (function(engine) {
      return function(done) {
        return engine.likes.itemsByUser(0, query.user, done);
      };
    })(this),
    dislikes: (function(engine) {
      return function(done) {
        return engine.dislikes.itemsByUser(1, query.user, done);
      };
    })(this),
    
    recommendations: (function(recommendations) {
      return function(done) {
        return engine.recommendations.forUser(query.user, function(err, recommendations) {
          if (err != null) {
            return done(err);
          }
          return done(null, _.map(_.sortBy(recommendations, function(recommendation) {
            return -recommendation.weight;
          }), function(recommendation) {
            return item.findWhere(books, {
              id: recommendation.item
            });
          }));
        });
      };
    })
  }, 


	(function(engine) {
    return function(err, arg1) {
      var dislikes, likes, recommendations;
      likes = arg1.likes, dislikes = arg1.dislikes, recommendations = arg1.recommendations;
      if (err != null) {
        return next(err);
      }
      return res.render('index', {
        books: books,
        user: query.user,
        likes: likes,
        dislikes: dislikes,
        recommendations: recommendations.slice(0, 4)
      });
    };
  });
});


app.listen((port = process.env.PORT || 5000), function(err) {
  if (err != null) {
    throw err;
  }
  return console.log("Listening at PORT: " + port);
});
