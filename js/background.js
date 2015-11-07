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
        var tabId = sender.tab && sender.tab.id;
        var cmd = request.cmd;
        var data = request.data;
        if (cmd === 'enqueueTasks') {
          enqueueTasks( data );
          if (typeof sendResponse === 'function') sendResponse();
        }
        else if (cmd === 'task_manager.has_tab') {
          sendResponse( TaskManager.hasTab( tabId ) );
        }
        else if (cmd === 'flights') {
          TaskManager.processResult( tabId, data );
        }
        else if (cmd === 'Log.getRecent') {
          var records = Log.getRecent( data.count );
          if (typeof sendResponse === 'function') sendResponse( records );
        }
        else if (cmd === 'set_focus') {
          chrome.tabs.query({currentWindow: true, active: true}, function( tabs ){
            chrome.tabs.update( tabId, {active: true} );
            sendResponse('ok');
            setTimeout(function(){
              chrome.tabs.update( tabs[0].id, {active: true} );
            }, 1000);
          });
          return true;
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
    TaskManager.start();
  };


  var onNotificationClickHandler = function(id){
    chrome.tabs.create({url: '/html/log.html'});
  };


  return {
    init: init
  };

})();


App.init();
