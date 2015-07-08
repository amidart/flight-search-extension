var Task = (function(){

  var queue = [];
  var currentIndex = 0;


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
    var task = queue[ currentIndex++ ];
    if (currentIndex === queue.length) currentIndex = 0;
    task.state = 'in_progress';
    save();
    return task;
  };


  var getStatus = function(){
    return {
      current: currentIndex ? currentIndex+1 : 0,
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
  };


  var restore = function(){
    queue = JSON.parse(localStorage.tasks || '[]');
    currentIndex = parseInt( localStorage.currentIndex ) || 0;
  };


  return {
    init: init,
    push: push,
    pushMultiple: pushMultiple,
    get: get,
    getStatus: getStatus,
    clearAll: clearAll
  };

})();
