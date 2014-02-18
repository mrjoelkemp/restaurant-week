var request   = require('request'),
    cheerio   = require('cheerio'),
    YelpResult = require('./YelpResult');


getYelpSearchResult('Dhaba', function (yelpObj) {
  console.log(yelpObj)
});

function getYelpSearchResult (restaurantName, cb) {
  if (! restaurantName) return;

  var url = 'http://www.yelp.com/search?find_desc=' + encodeURI(restaurantName) + '&find_loc=New+York';

  request(url, function (err, resp, body) {
    // cb && cb(body);
    var $ = cheerio.load(body),
        yelpResult = new YelpResult({
          name: restaurantName,
          html: $('div.search-result').first().html()
        });

    cb && cb(yelpResult);
  });
}

