var cheerio = require('cheerio'),
    request = require('request');

module.exports = function (name) {
  this.name         = name || '';
  this.html         = '';
  this.rating       = 0;
  this.numReviews   = 0;
};

module.exports.prototype.ranking = function () {
  return this.numReviews * this.rating;
};

module.exports.prototype.fetch = function (cb) {
  this.getYelpResultHTML(this.name, function (html) {
    var $ = cheerio.load(html),
        $result;

    $result = $('[data-key=1]');

    $('.search-result').each(function (idx, el) {
      console.log($(el).find('a.biz-name').text());
    });

    this.html       = $result.html();
    this.rating     = parseFloat($result.find('i.star-img').attr('title'));
    this.numReviews = parseInt($result.find('span.review-count').text(), 10);
    this.url        = 'http://www.yelp.com' + $result.find('a.biz-name').attr('href');

    cb && cb();

  }.bind(this));
};

module.exports.prototype.getYelpResultHTML = function (restaurantName, cb) {
  var url = 'http://www.yelp.com/search?find_desc=' + encodeURI(restaurantName) + '&find_loc=New+York';
  console.log(restaurantName + ': ' + url);
  request(url, function (err, resp, body) {
    cb && cb(body);
  });
};