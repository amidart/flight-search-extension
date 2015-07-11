(function(){

  var bg = chrome.extension.getBackgroundPage();
  var status = null;

  var init = function(){
    restoreSettings();
    initUI();
    updateState();
  };


  var restoreSettings = function(){
    var config = bg.TaskManager.getConfig();
    $('#tabs').val( config.tabs );
    $('#interval').val( config.interval );
  };


  var initUI = function(){

    status = new Helpers.Status( $('#status'), {
      show: {method: 'show', params: []},
      hide: {method: 'hide', params: []}
    } );

    $('#controls .btn').click(function(){
      var method = this.dataset.method;
      if (method && bg.TaskManager[method]) bg.TaskManager[method]();
      updateState();
    });

    $('#btn-reset').click(function(){
      bg.TaskManager.reset();
      bg.Log.clear();
      updateState();
      status.success('Cleared', 1000);
    });

    $('#btn-save').click(function(){
      var tabs = parseInt( $('#tabs').val() );
      var interval = parseInt( $('#interval').val() );
      bg.TaskManager.configure({
        tabs: tabs,
        interval: interval
      });
      status.success('Saved', 1000);
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
