var TaskManager = (function(){

  var state = 'stopped';
  var tabs = 1;
  // interval between searches
  var interval = 30;
  var timeout = 120;
  var timers = [];
  var onError = null;

  var activeTabs = {};


  var init = function( cbOnError ){
    if (typeof cbOnError === 'function') onError = cbOnError;
    restore();
    if (state === 'running') start();
  };


  var configure = function( params ){
    tabs = params.tabs || tabs;
    interval = params.interval || interval;
    timeout = params.timeout || timeout;
    save();
  };


  var save = function(){
    localStorage.tm_state = state;
    localStorage.tm_tabs = tabs;
    localStorage.tm_interval = interval;
    localStorage.tm_timeout = timeout;
  };


  var restore = function(){
    state = localStorage.tm_state || 'stopped';
    tabs = parseInt(localStorage.tm_tabs) || tabs;
    interval = parseInt(localStorage.tm_interval) || interval;
    timeout = parseInt(localStorage.tm_timeout) || timeout;
  };


  var getState = function(){
    return state;
  };


  var getConfig = function(){
    return {
      tabs: tabs,
      interval: interval,
      timeout: timeout
    };
  };


  var hasTab = function( tabId ){
    if (activeTabs[tabId]) return true;
    return false;
  };


  var start = function(){
    state = 'running';
    for (var i = 0; i < tabs; i++) {
      enqueueTask( i*interval*1000 );
    }
    save();
  };


  var enqueueTask = function( delay ){
    var timer = setTimeout( function(){
      deleteTimer( timer );
      runTask();
    }, delay );
    timers.push(timer);
  };


  var runTask = function(){
    if (state !== 'running') return;
    if (Object.keys(activeTabs).length < tabs) {
      var task = Task.get();
      console.log(task);
      if (!task) {
        if ( !Task.hasLoopSetting() ) {
          stop();
          return;
        }
        setTimeout(function(){
          runTask();
        }, interval*1000);
        if (typeof onError === 'function') onError('Tasks list is empty');
        return;
      }
      chrome.tabs.create({
        url: task.data.url,
        active: false
      }, function( tab ){
        var tabId = tab.id;
        activeTabs[tabId] = task;
        runWatchdog( tabId, task );
      });
    }
  };


  var resetIndex = function(){
    Task.resetIndex();
  };


  var stop = function(){
    state = 'stopped';
    for (var i = 0, len = timers.length; i < len; i++) {
      deleteTimer(timers[i]);
    }
    save();
  };


  var reset = function(){
    stop();
    Task.clearAll();
  };


  var processResult = function( tabId, flights ){
    var result = flights[0];
    if (!result) return;
    if (activeTabs[tabId]) {
      var task = activeTabs[tabId];
      var success = false;
      var targetPrice = task.data.price;
      var actualPrice = result.price;
      console.log(actualPrice, targetPrice);
      if (actualPrice <= targetPrice) {
        Notifier.notify( {
          url: task.data.url,
          price: actualPrice
        });
        success = true;
      }
      Log.add({
        success: success,
        url: task.data.url,
        targetPrice: targetPrice,
        price: actualPrice,
        extra: flights
      });
      enqueueTask( interval*1000 );
      delete activeTabs[tabId];
      try{ chrome.tabs.remove(tabId); } catch(e){}
    }
  };


  var runWatchdog = function( tabId, task ){
    setTimeout(function(){
      if (activeTabs[tabId]) {
        Log.add({
          error: 'timeout',
          url: task.data.url,
          targetPrice: task.data.price,
        });
        enqueueTask( interval*1000 );
        delete activeTabs[tabId];
        chrome.tabs.remove(tabId);
      }
    }, timeout*1000);
  };


  var deleteTimer = function( timer ){
    for (var i = 0, len = timers.length; i < len; i++) {
      if (timer === timers[i]) {
        timers.splice(i, 1);
        break;
      }
    }
    clearTimeout(timer);
  };


  return {
    init: init,
    configure: configure,
    getState: getState,
    getConfig: getConfig,
    start: start,
    stop: stop,
    resetIndex: resetIndex,
    reset: reset,
    hasTab: hasTab,
    processResult: processResult
  };

})();
