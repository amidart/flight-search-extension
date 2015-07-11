var App = (function(){

  var init = function(){
    initMessaging();
    Task.init();
    TaskManager.init( console.log.bind(console) );
    Log.init( 1000 );
    //TaskManager.start();
  };


  var initMessaging = function(){
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        console.log(request);
        var cmd = request.cmd;
        var data = request.data;
        if (cmd === 'enqueueTasks') {
          enqueueTasks( data );
        }
        else if (cmd === 'flights') {
          TaskManager.processResult( sender.tab.id, data );
        }
        else if (cmd === 'Log.getRecent') {
          var records = Log.getRecent( data.count );
          if (typeof sendResponse === 'function') sendResponse( records );
        }
      });
  };


  var enqueueTasks = function( data ){
    for (var i = 0, len = data.tasks.length; i < len; i++) {
      var url = data.tasks[i];
      if (!url) continue;
      Task.push({
        url: url,
        price: data.price
      });
    }
  };


  return {
    init: init
  };

})();


App.init();
