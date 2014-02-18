var cheerio = require('cheerio');

module.exports = function (options) {
  if (! options || ! options.html) {
    this.html         = '';
    this.rating       = 0;
    this.numReviews   = 0;
    this.name         = '';

    return;
  }

  var $ = cheerio.load(options.html);

  this.html       = options.html;
  this.rating     = parseFloat($('i.star-img').attr('title'));
  this.numReviews = parseInt($('span.review-count').text(), 10);
  this.name       = options.restaurantName || $('a.biz-name').text();
  this.url        = 'http://www.yelp.com' + $('a.biz-name').attr('href');
};