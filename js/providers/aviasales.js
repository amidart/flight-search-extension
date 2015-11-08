Provider.add('aviasales', (function(){

  // oneway: 2015-11-7 mow-bkk business 3 adults, 2 childrens, 1 infant
  // http://search.aviasales.ru/MOW0711BKKb321

  // roundtrip: 2015-11-7 2015-11-14 mow-bkk business 3 adults, 2 childrens, 1 infant
  // http://search.aviasales.ru/MOW0711BKK1412b321

  // complex:
  // mow-bkk bkk-sgn sgn-jkt hkg-kul
  // http://search.aviasales.ru/MOW0711BKK1411SGN2111JKT-HKG2811KULb321
  // mow-bkk del-sgn sgn-jkt hkg-kul
  // http://search.aviasales.ru/MOW0711BKK-DEL1411SGN2111JKT-HKG2811KULb321

  var fromUrl = {};
  var toUrl = {};

  var onewayTemplate = 'http://search.aviasales.ru/{{from}}{{date}}{{to}}{{suffix}}';
  var roundtripTemplate = 'http://search.aviasales.ru/{{from}}{{dateOut}}{{to}}{{dateBack}}{{suffix}}';
  var complexTemplate = 'http://search.aviasales.ru/';


  toUrl.oneway = function( data ){
    var tmplData = {};
    tmplData.from = data.from;
    tmplData.to = data.to;
    tmplData.date = convertDate( data.date );
    tmplData.suffix = getSuffix( data );
    return Mustache.to_html( onewayTemplate, tmplData );
  };


  toUrl.roundtrip = function( data ){
    var tmplData = {};
    tmplData.from = data.from;
    tmplData.to = data.to;
    tmplData.dateOut = convertDate( data.dateOut );
    tmplData.dateBack = convertDate( data.dateBack );
    tmplData.suffix = getSuffix( data );
    return Mustache.to_html( roundtripTemplate, tmplData );
  };


  toUrl.complex = function( data ){
    res = '';
    for (var i = 0, len = data.legs.length; i < len; i++) {
      var leg = data.legs[i];
      res += leg.from + convertDate(leg.date) + leg.to;
      if (i !== len - 1) res += '-';
    }
    res = res.toUpperCase();
    res = clearRepeatative( res );
    res += getSuffix(data);
    return complexTemplate + res;
  };


  fromUrl = function( url ){
    var res = url.replace(/^.*search.aviasales.ru\//, '');
    // remove class and passengers
    var passengersStr = '';
    console.log(res);
    res = res.replace(/(\d{4}|[A-Z]{3})b?(\d{1,3}?)$/, function(match, p1, p2){
      if (p2 === '1') return p1;
      else if (p2.length === 1) p2 += '00';
      passengersStr = ' <i>' + p2.split('').join('+') + '</i>';
      return p1;
    });
    console.log(res);
    // replace 1911MOW2011 => 1911MOW-MOW2011
    res = res.replace(/(\d{4})([A-Z]+)(\d{4})/g, '$1$2-$2$3');
    // if first city and last city are the same aviasales don't put it to the end
    if (res.match(/\d+$/)) res = res.replace(/^([A-Z]{3,})(.*)/, '$1$2$1');

    res = res.replace(/-/g, ' ');
    res = res.replace(/([A-Z]{3,})(\d{4})([A-Z]{3,})/g, '$1-$3 $2');
    res = res.replace(/ /g, ', ');
    res = res.replace(/(\d{4})/g, function(match){
      var d = match.substr(0,2);
      var m = match.substr(2,2);
      return '<span>' + d + '.' + m + '</span>';
    });
    res += passengersStr;
    return res;
  };


  /**
   * '2015-11-07' => '0711'
   */
  var convertDate = function( str ){
    return str.replace(/\d{4}-(\d\d)-(\d\d)/, '$2$1');
  };


  var getSuffix = function( data ){
    var res = '';
    if (data.class === 'b') res = 'b';
    res += data.adults;
    if (data.children + data.infants !== 0) {
      res += data.children;
      if (data.infants) res += data.infants;
    }
    return res;
  };


  /**
   * remove repeatative segments, e.g.: BKK-BKK => BKK
   */
  var clearRepeatative = function( str ){
    var matches = str.match(/([A-Z]+-[A-Z]+)/g);
    if (!matches) return str;
    for (var i = 0, len = matches.length; i < len; i++) {
      var match = matches[i];
      var pair = match.split('-');
      if (pair[0] === pair[1]) {
        str = str.replace(match, pair[0]);
      }
    }
    return str;
  };


  return {
    toUrl: toUrl,
    fromUrl: fromUrl
  };

})() );
