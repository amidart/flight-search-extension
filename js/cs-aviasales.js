(function(){

  var init = function(){
    chrome.runtime.sendMessage({cmd: 'task_manager.has_tab'}, function( response ){
      if (response) {
        runTimer();
      }
    });
  };


  var runTimer = function(){
    var timer = setInterval(function(){
      var searchInProgress = $('.js-progress-bar-container').is(':visible');
      if (!searchInProgress) {
        clearInterval(timer);
        switchFocusToTab( processResults );
      }
    }, 1000);
  };


  var switchFocusToTab = function( cbContinue ){
    chrome.runtime.sendMessage({cmd: 'set_focus'}, function( response ){
      setTimeout( cbContinue, 500 );
    });
  };


  var processResults = function(){
    var items = $('.expl-ticket_wrapp');
    var flights = [];
    var len = items.length;
    if (len > 1) len = 1;
    for (var i = 0; i < len; i++) {
      var item = items[i];
      flights.push( processPriceItem( item ) );
    }
    chrome.runtime.sendMessage({
      cmd: 'flights',
      data: flights
    });
  };


  var processPriceItem = function( node ){
    var $node = $(node);
    var res = {};
    res.price = parseInt( $node.find('.expl-ticket-main-price').text().replace(/ /g, '') );
    var airline = $node.find('.expl-main-airline-logo').attr('src');
    res.provider = airline.replace(/.*\/([\w]+)(@2x)?\.png$/, '$1');
    res.flightTime = [];
    $node.find('.expl-flight-segment-duration').map(function( index, elem ){
      res.flightTime.push( elem.textContent.replace(/.*?(\d+. \d+.).*/, '$1') );
    });
    res.flightTime = res.flightTime.join(' / ');
    res.depTime = $node.find('.expl-depart-time')[0].textContent;
    res.depAirport = $node.find('.expl-departure-port')[0].textContent.replace(/[^A-Z0-9]/g, '');
    return res;
  };


  return {
    init: init
  };

})().init();
