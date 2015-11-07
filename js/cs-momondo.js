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
      var searchInProgress = !$('#flight-results').hasClass('search-completed');
      if (!searchInProgress) {
        processResults();
      }
    }, 1000);
  };


  var processResults = function(){
    var items = $('.result-box');
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
    res.price = parseInt( $node.find('.ticketinfo .price-total .price span:first-child').text().replace(/[ ,.]/g, '') );
    if (!res.price) {
      res.price = parseInt( $node.find('.ticketinfo .price-pax .price span:first-child').text().replace(/[ ,.]/g, '') );
    }
    res.provider = [];
    $node.find('.airlines .names').map(function( index, elem ){
      res.provider.push( elem.textContent );
    });
    res.provider = res.provider.join(' / ');
    res.flightTime = [];
    $node.find('.travel-time').map(function( index, elem ){
      res.flightTime.push( elem.textContent.replace(/.*?(\d+. \d+.).*/, '$1') );
    });
    res.flightTime = res.flightTime.join(' / ');
    res.depTime = $node.find('.departure .time')[0].textContent;
    res.depAirport = $node.find('.departure .iata')[0].textContent;
    return res;
  };


  return {
    init: init
  };

})().init();
