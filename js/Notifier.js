var Notifier = (function(){

  var isClickable = false;
  var onClick = null;

  var init = function( params ){
    isClickable = params.isClickable || false;
    onClick = params.onClick || null;
    if (isClickable) {
      chrome.notifications.onClicked.addListener(function (id){
        if (typeof onClick === 'function') onClick(id);
      });
    }
  };


  var notify = function(){
    var title = _('text_tickets_found');
    var text = _('text_open_log');
    showNotification( title, text );
  };


  var showNotification = function(title, text) {
    chrome.notifications.create(
      '',
      {
        type: 'basic',
        iconUrl: '/img/icon256.png',
        title: title,
        message: text,
        isClickable: isClickable
      }, function(notificationId){
      }
    );
  };


  return {
    init: init,
    notify: notify
  };

})();
