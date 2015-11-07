Provider.add('buruki', (function(){

  // oneway
  // mow/bkk/2015-07-18/-/3/2/1/b/
  // roundtrip
  // mow/bkk/2015-07-18/2015-07-25/3/2/1/e/
  // complex:
  // MOW-BKK/2015-07-18/BKK-SGN/2015-07-21/SGN-HKG/2015-07-24/HKG-MOW/2015-07-31/3/2/1/b/

  var fromUrl = {};
  var toUrl = {};

  var onewayTemplate = 'http://buruki.ru/search/{{from}}/{{to}}/{{date}}/-/{{adults}}/0/0/{{class}}';
  var roundtripTemplate = 'http://buruki.ru/search/{{from}}/{{to}}/{{dateOut}}/{{dateBack}}/{{adults}}/0/0/{{class}}';
  var complexTemplate = 'http://buruki.ru/complex/';


  toUrl.oneway = function( data ){
     return Mustache.to_html( onewayTemplate, data );
  };

  toUrl.roundtrip = function( data ){
    return Mustache.to_html( roundtripTemplate, data );
  };

  toUrl.complex = function( data ){
    var res = complexTemplate;
    for (var i = 0, len = data.legs.length; i < len; i++) {
      var leg = data.legs[i];
      res += leg.from + '-' + leg.to + '/' + leg.date + '/';
    }
    res += data.adults + '/0/0/' + data.class;
    return res;
  };


  fromUrl = function( url ){
    var res = url.replace(/^.*(search|complex)\//, '');
    res = res.replace(/\/\d\/\d\/\d\/[be]$/, '');
    res = res.replace(/\//g, ' ');
    res = res.replace(/\s+-$/, '');
    res = res.replace(/([A-Z]) ([A-Z])/g, '$1-$2');
    res = res.replace(/ /g, ', ');
    res = res.replace(/(\d+-\d+-\d+)/g, function(match){
      var date = new Date( match );
      var d = date.getDate();
      var m = date.getMonth() + 1;
      if (d < 10) d = '0' + d;
      if (m < 10) m = '0' + m;
      return '<span>' + d + '.' + m + '</span>';
    });
    return res;
  };


  return {
    toUrl: toUrl,
    fromUrl: fromUrl
  };

})() );
