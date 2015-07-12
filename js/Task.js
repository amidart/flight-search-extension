var Task = (function(){

  var queue = [];
  var currentIndex = 0;
  var loop = false;


  var init = function(){
    restore();
  };


  var push = function( data ){
    queue.push({
      state: 'default',
      data: data
    });
    save();
    console.log(queue);
  };


  var pushMultiple = function( tasks ){
    for (var i = 0, len = tasks.length; i < len; i++) {
      push( tasks[i] );
    }
  };


  var get = function(){
    if (!queue.length) return undefined;
    if( currentIndex == queue.length) {
      if (!loop) return undefined;
      else currentIndex = 0;
    }
    var task = queue[ currentIndex++ ];
    task.state = 'in_progress';
    save();
    return task;
  };


  var getStatus = function(){
    return {
      current: queue.length ? currentIndex+1 : 0,
      count: queue.length
    };
  };


  var clearAll = function(){
    queue = [];
    currentIndex = 0;
    save();
  };


  var save = function(){
    localStorage.tasks = JSON.stringify(queue);
    localStorage.currentIndex = currentIndex;
    localStorage.loop = loop;
  };


  var restore = function(){
    queue = JSON.parse(localStorage.tasks || '[]');
    currentIndex = parseInt( localStorage.currentIndex ) || 0;
    loop = localStorage.loop === 'true';
  };


  var resetIndex = function(){
    currentIndex = 0;
  };


  var setLoopSetting = function( value ){
    loop = value;
    save();
  };


  var hasLoopSetting = function(){
    return loop;
  };


  return {
    init: init,
    push: push,
    pushMultiple: pushMultiple,
    get: get,
    getStatus: getStatus,
    resetIndex: resetIndex,
    setLoopSetting: setLoopSetting,
    hasLoopSetting: hasLoopSetting,
    clearAll: clearAll
  };

})();
