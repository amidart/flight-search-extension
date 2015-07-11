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
      var data = {
        time: moment(time).format('YYYY-MM-DD hh:mm:ss'),
        url: record.data.url,
        targetPrice: record.data.targetPrice,
        error: !!error,
        result: !!error ? error : record.data.price,
        extra: record.data.extra
      };
      html += Mustache.to_html( $('#recordTemplate').html(), data );
    }
    $('#log').html(html);
  };


  return {
    init: init
  };

})().init();
