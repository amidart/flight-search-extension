Provider.add('buruki', (function(){

  // oneway
  // mow/bkk/2015-07-18/-/3/2/1/b/
  // roundtrip
  // mow/bkk/2015-07-18/2015-07-25/3/2/1/e/
  // complex:
  // MOW-BKK/2015-07-18/BKK-SGN/2015-07-21/SGN-HKG/2015-07-24/HKG-MOW/2015-07-31/3/2/1/b/

  var fromUrl = {};
  var toUrl = {};

  var onewayTemplate = 'http://buruki.ru/search/{{from}}/{{to}}/{{date}}/-/{{adults}}/{{children}}/{{infants}}/{{class}}';
  var roundtripTemplate = 'http://buruki.ru/search/{{from}}/{{to}}/{{dateOut}}/{{dateBack}}/{{adults}}/{{children}}/{{infants}}/{{class}}';
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
    res += [data.adults, data.children, data.infants, data.class].join('/');
    return res;
  };


  fromUrl = function( url ){
    var res = url.replace(/^.*(search|complex)\//, '');
    res = res.replace(/\//g, ' ');
    res = res.replace(/ (\d) (\d) (\d) [be]$/, function(m, p1, p2, p3){
      if (p1 === '1' && p2 === '0' && p3 === '0') return '';
      else return '<i>' + [p1,p2,p3].join('+') + '</i>';
    });
    res = res.replace(/\s+-/g, '');
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
