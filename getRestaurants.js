var request   = require('request'),
    fs        = require('fs'),
    cheerio   = require('cheerio'),
    // Yelp api keys (hidden)
    keys      = require('./keys');


// Datafile locations
var root = './data/',
    restaurantPageFile = root + 'restaurants.html',
    restaurantNamesFile = root + 'restaurantNames.txt';


getYelpSearchResult('Dhaba', function (yelpObj) {
  console.log(yelpObj)
});

////////////
// One-offs
////////////

function saveRestaurantsPage () {
  var restaurantSite = 'http://www.opentable.com/promo.aspx?m=8&ref=1351&pid=69&cmpid=em_RWDEDICATED_rw&spMailingID=8278818&spUserID=NTg1MjE2ODA2NjkS1&spJobID=205157368&spReportId=MAS2#state{PromoID:69|MetroAreadID:8|NeighborhoodList:11,18,66,102,107,110,111,112,118,119,126,143,163,164,167,172,180,192,193,195,198,202,204,208,281,283,290,292,412,440,441,443,445,449,454,457,461,485,496,515,521,524,545,547,548,549,558,559,570,576,594,600,604,623,644,649,655,662,671,698,709,714,716,725,729,733,750,752,754,762,763,786,798,805,817,818,855,861,876,877,879,880,885,886,904,907,929,930,931,949,957,967,970,974,975,986,1008,1010,1019,1020,1025,1050,1053,1079,1080,1085,1087,1091,1152,1153,1159,1160,1161,1162,1163,1164,1166,1167,1168,1169,1170,1171,1172,1173,1174,1176,1177,1178,1179,1245,1272,1280,1291,1321,1327,1333,1347,1353,1358,1395,1424,1433,1460,1484,1490,1491,1520,1528,1553,1566,2126,2129,2183,2309,2321,2357,2390,2435,2444,2459,2468,2474,2501,2504,2531,2558,2594,2630,2642,2660,2696,2744,2765,2768,2771,2774,2777,2780,2783,2789,2801,2876,2900,2903,2906,2942,2948,2960,2981,2987,2999,3032,3044,3047,3068,3071,3101,3104,3113,3128,3131,3161,3218,3236,3266,3293,3335,3356,3359,3365,3377,3407,3434,3437,3446,3482,3494,3524,3545,3566,3596,3683,3686,3716,3725,3731,3746,3752,3755,3761,3764,3779,3833,3845,3998,4013,4097,4178,4184,4247,4250,4253,4358,4451,4463,4478,4526,4535,4538,4541,4589,4655,4691,4703,4706,4814,4835,4838,4850,4853,4856,4943,5024,5030,5036,5087,5120,5162,5171,5183,5198,5210,5234,5237,5267,5285,5300,5315,5327,5330,5339,5426,5444,5486,5507,5510,5522,5555,5612,5615,5642,5657,5660,5708,5747,5789,5795,5801,5828,5843,5861,5888,5897,5924,5948,5969,5981,6023,6038,6059,6116,6122,6158,6164,6209,6260,6302,6383,6413,6452,6461,6464,6500,6572,6587,6593,6596,6605,6611,6650,6707,6758,6788,6869,6881,6890,6899,6977,6983,6995,7007,7034,7049,7094,7205,7226,7295,7298,7364,7376,7382,7394,7397,7433,7439,7466,7628,7682,7706,7763,7766,7769,7775,7781,7784,7799,7814,7832,7871,7919,7931,7946,7994,8015,8021,8060,8099,8150,8186,8198,8210,8225,8276,8288,8300,8306,8330,8378,8387,8393,8438,8441,8480,8486,8639,8672,8675,8711,8753,8792,8819,8864,8894,8933,8948,8990,9020,9032,9044,9047,9107,9125,9128,9161,9188,9194,9200,9227,9299,9317,9380,9482,9560,9563,9599,9653,9689,9767,9827,9887,9890,9914,9944,10034,10097,10106,10136,10178,10226,10301,10319,10346,10352,10361,10385,10394,10421,10445,10448,10472,10475,10496,10499,10517,10529,10574,10613,10646,10652,10661,10670,10730,10739,10844,10865,10982,10985,10988,11003,11219,11225|MealList:1}';

  request(restaurantSite, function (err, resp, body) {
    if (! err && resp.statusCode === 200) {
      fs.writeFile(restaurantPageFile, body);
    }
  });
}

function saveRestaurantNames() {
  var $ = cheerio.load(fs.readFileSync(restaurantPageFile).toString()),
      names = [];

  $('a.r').each(function () {
    names.push($(this).text());
  });

  fs.writeFile(restaurantNamesFile, names.join('\n'));
}

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

function YelpResult (options) {
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
}