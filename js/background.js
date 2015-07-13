var App = (function(){

  var init = function(){
    initMessaging();
    Notifier.init({
      isClickable: true,
      onClick: onNotificationClickHandler
    });
    Task.init();
    TaskManager.init( console.log.bind(console) );
    Log.init( 1000 );
  };


  var initMessaging = function(){
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        console.log(request);
        var cmd = request.cmd;
        var data = request.data;
        if (cmd === 'enqueueTasks') {
          enqueueTasks( data );
          if (typeof sendResponse === 'function') sendResponse();
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


  var onNotificationClickHandler = function(id){
    chrome.tabs.create({url: '/html/log.html'});
  };


  return {
    init: init
  };

})();


App.init();
