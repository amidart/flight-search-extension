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


  var start = function(){
    state = 'running';
    for (var i = 0; i < tabs; i++) {
      enqueueTask( i*interval*1000 );
    }
  };


  var run = function(){
    if (state === 'paused') unpause();
    else if (state === 'stopped') start();
  };


  var enqueueTask = function( delay ){
    var timer = setTimeout( function(){
      deleteTimer( timer );
      runTask();
    }, delay );
    timers.push(timer);
    console.log(timer, timers);
  };


  var runTask = function(){
    if (state !== 'running') return;
    if (Object.keys(activeTabs).length < tabs) {
      var task = Task.get();
      console.log(task);
      if (!task) {
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


  var pause = function(){
    state = 'paused';
  };


  var unpause = function(){
    state = 'running';
  };


  var stop = function(){
    state = 'stopped';
    for (var i = 0, len = timers.length; i < len; i++) {
      deleteTimer(timers[i]);
    }
  };


  var reset = function(){
    stop();
    Task.clearAll();
  };


  var processResult = function( tabId, result ){
    if (activeTabs[tabId]) {
      var task = activeTabs[tabId];
      Log.add({
        url: task.url,
        targetPrice: task.price,
        price: result.price
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
          error: 'no response',
          url: task.url,
          targetPrice: task.price,
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
    start: start,
    run: run,
    pause: pause,
    unpause: unpause,
    stop: stop,
    reset: reset,
    processResult: processResult
  };

})();
