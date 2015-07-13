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
    $('#loop').prop('checked', bg.Task.hasLoopSetting() );
  };


  var initUI = function(){

    $('.version').text( chrome.runtime.getManifest().version );

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
      updateState();
      status.success(_('status_ok'), 1000);
    });

    $('#btn-clear-log').click(function(){
      bg.Log.clear();
      status.success(_('status_ok'), 1000);
    });

    $('#loop').change(function(){
      bg.Task.setLoopSetting( this.checked );
    });

    $('#btn-save').click(function(){
      var tabs = parseInt( $('#tabs').val() );
      var interval = parseInt( $('#interval').val() );
      bg.TaskManager.configure({
        tabs: tabs,
        interval: interval
      });
      status.success(_('status_ok'), 1000);
      bg.TaskManager.start();
    });
  };


  var updateState = function(){
    var state = bg.TaskManager.getState();
    var status = bg.Task.getStatus();
    var next = status.current <= status.count ? _('label_next_task') + ': ' + status.current + ' ' + _('label_of') + ' ' + status.count : _('state_done');
    $('#state').html( _('state_' + state) );
    $('.next').html( next );
    $('body')[0].className = state;
    var className;
    if (state === 'running') className = 'bg-success';
    else if (state === 'stopped') className = 'bg-danger';
    $('#state-container')[0].className = className;
  };


  return {
    init: init
  };

})().init();
