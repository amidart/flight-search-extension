var App = (function(){

  var init = function(){
    initMessaging();
  };


  var initMessaging = function(){
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
      if (request.cmd === '') {
      }
    });
  };


  return {
    init: init
  };

})();


App.init();
