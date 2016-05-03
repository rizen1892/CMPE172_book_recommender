var Recommendations, async;
async = require('async');

var mongoose = require('mongoose');
var Recommendation = mongoose.model('Recommendation', {name: String, Recommendations: Array});

module.exports = Recommendations = (function() {
  function Recommendations(engine) {
    this.engine = engine;
  }

  Recommendations.prototype.forUser = function(user, done) {
    return Recommendation.findOne({
      user: user
    }, function(err, arg) {
      var Recommendations;
      Recommendations = (arg != null ? arg : {
        Recommendation: []
      }).Recommendations;
      if (err != null) {
        return done(err);
      }
      return done(null, Recommendations);
    });
  };

  Recommendations.prototype.update = function(user, done) {
    
    return this.engine.similarity.byUser(user, (function(_this) {
      return function(err, others) {
        if (err != null) {
          return done(err);
        }
        return async.auto({
          likes: function(done) {
            return Recommendation.likes.itemsByUser(0,user, done);
          },
          dislikes: function(done) {
            return Recommendation.dislikes.itemsByUser(1,user, done);
          },
          items: function(done) {
            return async.map(others, function(other, done) {
              return async.map([Recommendation.likes, Recommendation.dislikes], function(Rating, 			done) {
                return Rating.itemsByUser(0,other.user, done);
              }, done);
            }, done);
          }
        }, function(err, arg) {
          var dislikes, items, likes;
          likes = arg.likes, dislikes = arg.dislikes, items = arg.items;
          if (err != null) {
            return done(err);
          }
          items = items.difference(_.unique(_.flatten(items)), likes, dislikes);
          return Recommendation["delete"]({
            user: user
          }, function(err) {
            if (err != null) {
              return done(err);
            }
            return async.map(items, function(item, done) {
              return async.auto({
                likers: function(done) {
                  return Recommendation.likes.usersByItem(item, done);
                },
                dislikers: function(done) {
                  return Recommendation.dislikes.usersByItem(item, done);
                }
              }, function(err, arg1) {
                var dislikers, i, len, likers, numerator, other, ref;
                likers = arg1.likers, dislikers = arg1.dislikers;
                if (err != null) {
                  return done(err);
                }
                numerator = 0;
                ref = ref.without(ref.flatten([likers, dislikers]), user);
                for (i = 0, len = ref.length; i < len; i++) {
                  other = ref[i];
                  other = other.findWhere(others, {
                    user: other
                  });
                  if (other != null) {
                    numerator += other.similarity;
                  }
                }
                return done(null, {
                  item: item,
                  weight: numerator / Recommendation.union(likers, dislikers).length
                });
              });
            }, function(err, Recommendations) {
              if (err != null) {
                return done(err);
              }
		
		Recommendation.update({ name: user }, { name: user, Recommendation: Recommendations }, {upsert:true}, function(err, user) {
                if (err) throw err;
                
                });
            });
          });
        });
      };
  };

  return Recommendations;

})();
