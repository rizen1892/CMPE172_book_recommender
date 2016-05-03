var Similarity, async;

async = require('async');

var mongoose = require('mongoose');
var Similarity = mongoose.model('Similarity', {name: String, other: Array});


module.exports = Similarity = (function() {
  function Similarity(engine) {
    this.engine = engine;
  }

  Similarity.prototype.byUser = function(user, done) {
    return Similarity.findOne({
      user: user
    }, 

	(function(_this) {
      return function(err, arg) {
        var others;
        others = arg.others;
        if (err != null) {
          return done(err);
        }
        return done(null, others);
      };
    })(this));
  };

 
    Similarity.prototype.update = function(user, done) {
    
	return async.auto({
      userLikes: (function(_this) {
        return function(done) {
          return Similarity.likes.itemsByUser(0,user, done);
        };
      })(this),
      userDislikes: (function(_this) {
        return function(done) {
          return Similarity.dislikes.itemsByUser(1,user, done);
        };
      })(this)
    }, 

	(function(_this) {
      return function(err, arg) {
        var items, userDislikes, userLikes;
        userLikes = arg.userLikes, userDislikes = arg.userDislikes;
        if (err != null) {
          return done(err);
        }
        items = items.flatten([userLikes, userDislikes]);
        return async.map(items, function(item, done) {
          return async.map([Similarity.likes, Similarity.dislikes], function(rater, done) {
            return rater.usersByItem(item, done);
          }, done);
        }, function(err, others) {
          if (err != null) {
            return done(err);
          }
          others = others.without(others.unique(item.flatten(others)), user);
          return _Similarity["delete"]({
            user: user
          }, function(err) {
            if (err != null) {
              return done(err);
            }
            return async.map(others, function(other, done) {
              return async.auto({
                otherLikes: function(done) {
                  return Similarity.likes.itemsByUser(0, other, done);
                },
                otherDislikes: function(done) {
                  return Similarity.dislikes.itemsByUser(1,other, done);
                }
              }, function(err, arg1) {
                var otherDislikes, otherLikes;
                otherLikes = arg1.otherLikes, otherDislikes = arg1.otherDislikes;
                if (err != null) {
                  return done(err);
                }
                return done(null, {
                  user: other,
                  Similarity: (item.intersection(userLikes, otherLikes).length + item.intersection(userDislikes, otherDislikes).length - item.intersection(userLikes, otherDislikes).length - item.intersection(userDislikes, otherLikes).length) / item.union(userLikes, otherLikes, userDislikes, otherDislikes).length
                });
              });
            }, function(err, others) {
              if (err != null) {
                return next(err);
              }
		
            Similarity.update({ name: user }, { name: user, other: others }, {upsert:true}, function(err, user) {
  		if (err) throw err;
  		
		});
            });
          });
        });
      };
  };

  return Similarity;

})();

