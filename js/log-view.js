(function(){

  var init = function(){
    chrome.runtime.sendMessage({
        cmd: 'Log.getRecent',
        data:{count: 1000}
      }, function( records ){
        loadLog( records );
    });
  };


  var loadLog = function( records ){
    var html = '';
    console.log(records);
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      var time = new Date(record.timestamp);
      var error = record.data.error;
      var rowClassName = error ? 'bg-warning' : (record.data.success? 'bg-success' : '');
      var data = {
        rowClassName: rowClassName,
        time: moment(time).format('YYYY-MM-DD HH:mm:ss'),
        url: record.data.url,
        targetPrice: record.data.targetPrice,
        error: !!error,
        result: !!error ? error : record.data.price,
        extra: renderExtra( record.data.extra )
      };
      html += Mustache.to_html( $('#recordTemplate').html(), data );
    }
    $('#log tbody').html(html);
  };


  var renderExtra = function( flights ){
    var res = '';
    if (!flights) return res;
    var template = '<div>{{provider}} {{depTime}} {{depAirport}} {{flightTime}} {{price}}</div>';
    for (var i = 0, len = flights.length; i < len; i++) {
      var flight = flights[i];
      res += Mustache.to_html(template, flight);
    }
    return '<div class="wrap-extra">' + res + '</div>';
  };

  return {
    init: init
  };

})().init();
