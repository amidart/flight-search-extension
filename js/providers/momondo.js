Provider.add('momondo', (function(){

  // oneway
  // flightsearch/?Search=true&TripType=1&SegNo=1&SO0=MOW&SD0=BKK&SDP0=25-11-2015&AD=1&TK=ECO&DO=false&NA=false
  // roundtrip
  // flightsearch/?Search=true&TripType=2&SegNo=2&SO0=VKO&SD0=BKK&SDP0=25-11-2015&SO1=BKK&SD1=VKO&SDP1=30-11-2015&AD=3&CA=4,1&TK=ECO&DO=false&NA=false
  // complex:
  // Search=true&TripType=4&SegNo=3&SO0=MOW&SD0=BKK&SDP0=25-11-2015&SO1=BKK&SD1=HKG&SDP1=30-11-2015&SO2=HKG&SD2=MSQ&SDP2=03-12-2015&AD=3&CA=4,8,1&TK=FLX&NA=false
  //
  // TripType - 1-one-way, 2-roundtrip, 4-complex
  // AD - adults
  // CA - child age (e.g: 5,4,1)
  // TK - flight class ECO|FLX|BIZ|FST
  // DO - direct only
  // NA - nearby airports

  var fromUrl = {};
  var toUrl = {};

  var onewayTemplate = 'http://www.momondo.com/flightsearch/?Search=true&TripType=1&SegNo=1&SO0={{from}}&SD0={{to}}&SDP0={{date}}&AD={{adults}}&CA={{ca}}&TK={{class}}&DO=false&NA=false';
  var roundtripTemplate = 'http://www.momondo.com/flightsearch/?Search=true&TripType=2&SegNo=2&SO0={{from}}&SD0={{to}}&SDP0={{dateOut}}&SO1={{to}}&SD1={{from}}&SDP1={{dateBack}}&AD={{adults}}&CA={{ca}}&TK={{class}}&DO=false&NA=false';
  var complexTemplate = 'http://www.momondo.com/flightsearch/?Search=true&TripType=4';


  toUrl.oneway = function( data ){
    var tmplData = $.extend({}, data);
    tmplData.date = convertDate( data.date );
    tmplData.class = getClass( data.class );
    tmplData.ca = getChildrenAges( data );
    return Mustache.to_html( onewayTemplate, tmplData );
  };


  toUrl.roundtrip = function( data ){
    var tmplData = $.extend({}, data);
    tmplData.dateOut = convertDate( data.dateOut );
    tmplData.dateBack = convertDate( data.dateBack );
    tmplData.class = getClass( data.class );
    tmplData.ca = getChildrenAges( data );
    return Mustache.to_html( roundtripTemplate, tmplData );
  };


  toUrl.complex = function( data ){
    res = complexTemplate + '&SegNo=' + data.legs.length;
    for (var i = 0, len = data.legs.length; i < len; i++) {
      var leg = data.legs[i];
      res += '&SO' + i + '=' + leg.from;
      res += '&SD' + i + '=' + leg.to;
      res += '&SDP' + i + '=' + convertDate( leg.date );
    }
    res += '&AD=' + data.adults;
    res += '&CA=' + getChildrenAges(data);
    res += '&TK=' + getClass( data.class );
    res += '&DO=false&NA=false';
    return res;
  };



  fromUrl = function( url ){
    var res = url.replace(/^.*SegNo=\d+(.*)/, '$1');
    res = res.replace(/&TK=.*$/, '');
    res = res.replace(/&\w+=/g, ' ');
    res = convertPassengers(res);
    res = res.replace(/([A-Z]+)\s+([A-Z]+)/g, '$1-$2');
    res = $.trim(res);
    res = res.replace(/ /g, ', ');
    res = res.replace(/(\d+)-(\d+)-\d+/g, '<span>$1.$2</span>');
    return res;
  };


  /**
   * '2015-11-07' => '07-11-2015'
   */
  var convertDate = function( str ){
    return str.split('-').reverse().join('-');
  };


  var getClass = function( classLetter ){
    return classLetter === 'b' ? 'BIZ' : 'ECO';
  };


  var getChildrenAges = function( data ){
    // I don't have ages in interface, so assume it as
    // child = 7, infant = 1
    if (!data.children && !data.infants) return '';
    var res = Array( data.children + 1 ).join('7,');
    res += Array( data.infants + 1 ).join('1,');
    return res.substr(0, res.length - 1);
  };


  /**
   * MOW BKK 22-11-2015 BKK MOW 28-11-2015 3 7,7,1
   * to
   * MOW BKK 22-11-2015 BKK MOW 28-11-2015 <i>3+2+1</i>
   */
  var convertPassengers = function( str ){
    var res = str.replace(/ (\d)\s?([\d,]+)?$/, function( match, p1, p2 ){
      var ages = (p2 || '').split(',');
      var adults = parseInt(p1);
      var children = 0;
      var infants = 0;
      for (var i = 0, len = ages.length; i < len; i++) {
        var age = ages[i];
        if (age >= 2) children++;
        else if (age > 0 && age < 2) infants++;
      }
      if (adults === 1 && children === 0 && infants === 0) return '';
      return '<i>' + [adults, children, infants].join('+') + '</i>';
    });
    return res;
  };


  return {
    toUrl: toUrl,
    fromUrl: fromUrl
  };

})() );
