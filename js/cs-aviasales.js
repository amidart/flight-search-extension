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
      var searchInProgress = $('.countdown').is(':visible');
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
    var items = $('div.ticket');
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
    res.price = parseInt( $node.find('.ticket__buy-price-num').text().replace(/[^\d]/g, '') );
    var airline = $node.find('img.ticket__airline-logo').attr('src');
    if (!airline) airline = $node.find('.ticket__airline-logo img').attr('src');
    if (airline) res.airline = airline.replace(/.*\/([\w]+)(@2x)?\.png$/, '$1');
    res.flightTime = [];
    $node.find('.fly-segment__total-time').map(function( index, elem ){
      res.flightTime.push( elem.textContent.replace(/.*?(\d+. \d+.).*/, '$1') );
    });
    res.flightTime = res.flightTime.join(' / ');
    res.depTime = $node.find('.fly-segment__time')[0].textContent;
    res.depAirport = $node.find('.fly-segment__path-iata')[0].textContent.replace(/[^A-Z0-9]/g, '');
    return res;
  };


  return {
    init: init
  };

})().init();
