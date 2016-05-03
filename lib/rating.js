var Rating, async, mongoose;

async = require('async');
var mongoose = require('mongoose');
var stringify = require('node-stringify');

mongoose.connect('mongodb://ec2-52-53-196-72.us-west-1.compute.amazonaws.com:27017/test');
var RatingLikes = mongoose.model('like', {name: String, item: String});
var RatingDislikes = mongoose.model('dislike',{name:String, item: String});

module.exports = Rating = (function() {
  function Rating(engine, kind) {
    this.engine = engine;
    this.kind = kind;  
}

  Rating.prototype.add = function(value ,user, item, done) {
    	if(value == 1){
          var user1 = new RatingLikes({name: user, item: item});
          user1.save(function (err, userObj) {
            if (err) {
              console.log(err);
     		   }
       	  });
        }
        else if(value == 0){
          var user2 = new RatingDislikes({name: user, item: item});
          user2.save(function (err, userObj) {
             if (err) {
               console.log(err);
               }
          });
       }	
          
	  return async.series([
            function(done) {
              return RatingLikes.similars.update(user, done);
            }, 

	    function(done) {
              return Ratinglikes.suggestions.update(user, done);
            }
          ], done);
  };

Rating.prototype.remove = function(value2, user, item, done) {

if(value2 == 1){
RatingDislikes.findOneAndRemove({ name: user, item: item }, function(err) {
  if (err) throw err;
});
}
else if(value2 == 0){
RatingLikes.findOneAndRemove({ name: user, item:item }, function(err) {
  if (err) throw err;
});
}	
        return async.series([
          function(done) {
            return RatingDislikes.similars.update(user, done);
          }, function(done) {
            return RatingDislikes.suggestions.update(user, done);
          }
        ], done);
  };

Rating.prototype.itemsByUser = function(value3, user, done) {
	if(value3 == 0){
	RatingLikes.find({ name: user }, function(err, users) {
  	if (err) throw err;
	return done(null, _.pluck(users, 'item'));
	});  
	}
	 if(value3 == 1){
        RatingDislikes.find({ name: user }, function(err, users) {
        if (err) throw err;
        return done(null, _.pluck(users, 'item'));
        });
        }
  };

Rating.prototype.usersByItem = function(item, done) {
	RatingLikes.find({ item: item }, function(err, item) {
        if (err) throw err;
	console.log(_.pluck(item, 'name'));
        return done(null, _.pluck(item, 'name'));
        });
};
  return Rating;
})();
