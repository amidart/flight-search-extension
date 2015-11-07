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

  var onewayTemplate = 'http://www.momondo.com/flightsearch/?Search=true&TripType=1&SegNo=1&SO0={{from}}&SD0={{to}}&SDP0={{date}}&AD={{adults}}&TK={{class}}&DO=false&NA=false';
  var roundtripTemplate = 'http://www.momondo.com/flightsearch/?Search=true&TripType=2&SegNo=2&SO0={{from}}&SD0={{to}}&SDP0={{dateOut}}&SO1={{to}}&SD1={{from}}&SDP1={{dateBack}}&AD={{adults}}&TK={{class}}&DO=false&NA=false';
  var complexTemplate = 'http://www.momondo.com/flightsearch/?Search=true&TripType=4';


  toUrl.oneway = function( data ){
    var tmplData = $.extend({}, data);
    tmplData.date = convertDate( data.date );
    tmplData.class = getClass( data.class );
    return Mustache.to_html( onewayTemplate, tmplData );
  };


  toUrl.roundtrip = function( data ){
    var tmplData = $.extend({}, data);
    tmplData.dateOut = convertDate( data.dateOut );
    tmplData.dateBack = convertDate( data.dateBack );
    tmplData.class = getClass( data.class );
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
    res += '&TK=' + getClass( data.class );
    res += '&DO=false&NA=false';
    return res;
  };



  fromUrl = function( url ){
    var res = url.replace(/^.*SegNo=\d+(.*)/, '$1');
    res = res.replace(/&AD=.*$/, '');
    res = res.replace(/&\w+=/g, ' ');
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

  return {
    toUrl: toUrl,
    fromUrl: fromUrl
  };

})() );
