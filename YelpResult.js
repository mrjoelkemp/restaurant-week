var cheerio = require('cheerio'),
    request = require('request');

module.exports = function (name) {
  this.name         = name || '';
  this.html         = '';
  this.rating       = 0;
  this.numReviews   = 0;
};

module.exports.prototype.ranking = function () {
  // Rating matters, but don't let a well-reviewed, crappy restaurant overtake ratings
  return (this.rating * 10) * (this.numReviews / 100);
};

module.exports.prototype.fetch = function (cb) {
  this.getYelpResultHTML(this.name, function (html) {
    var $ = cheerio.load(html),
        $result;

    $result = $('[data-key=1]');

    // Preprocess
    $result.find('.review-snippet').remove();
    $result.find('.business-snippet').remove();
    // Fix urls
    $result.find('a').each(function (idx, el) {
      var $el = $(el);

      $el.attr('href', 'http://www.yelp.com' + $el.attr('href'));
      $el.attr('target', '_blank');
      $el.attr('rel', 'nofollow');
    });

    console.log(this.name + ' | ' + $result.find('a.biz-name').text());

    $result.find('.search-result-title').append($result.find('a.biz-name'));
    $result.find('.search-result-title').find('span.indexed-biz-name').remove();

    this.html       = '<div class="search-result">' + $result.html() + '</div>';
    this.rating     = parseFloat($result.find('i.star-img').attr('title'));
    this.numReviews = parseInt($result.find('span.review-count').text(), 10);
    this.url        = 'http://www.yelp.com' + $result.find('a.biz-name').attr('href');

    cb && cb();

  }.bind(this));
};

module.exports.prototype.getYelpResultHTML = function (restaurantName, cb) {
  var encodedName = encodeURIComponent(restaurantName),
      url = 'http://www.yelp.com/search?find_desc=' + encodedName + '&find_loc=New+York';

  console.log(restaurantName + ': ' + url);

  request(url, function (err, resp, body) {
    cb && cb(body);
  });
};