var Engine, Rating, Similarity, Recommendation, async;

async = require('async');
Rating = require('./rating');
Similarity = require('./similarity');
Recommendation = require('./recommendation');

module.exports = Engine = (function() {
  function Engine() {
    this.similarity = new Similarity(this);
    this.recommendation = new Recommendation(this);
    this.likes = new Rating(this, 'likes');
    this.dislikes = new Rating(this, 'dislikes');
  }

  return Engine;

})();

module.exports = require('./engine');


