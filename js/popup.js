(function(){

  var bg = chrome.extension.getBackgroundPage();


  var init = function(){
    initUI();
    updateState();
  };


  var initUI = function(){
    $('#controls .btn').click(function(){
      var method = this.dataset.method;
      if (method && bg.TaskManager[method]) bg.TaskManager[method]();
      updateState();
    });

    $('#btn-reset').click(function(){
      bg.TaskManager.reset();
      updateState();
    });
  };


  var updateState = function(){
    var state = bg.TaskManager.getState();
    var status = bg.Task.getStatus();
    var text = '<div>State: ' + state + '</div>';
    text += '<div class="next">Next task: ' + status.current + ' of ' + status.count + '</div';
    $('#state').html( text );
    $('body')[0].className = state;
    var className;
    if (state === 'running') className = 'bg-success';
    else if (state === 'paused') className = 'bg-warning';
    else if (state === 'stopped') className = 'bg-danger';
    $('#state')[0].className = className;
  };


  return {
    init: init
  };

})().init();
