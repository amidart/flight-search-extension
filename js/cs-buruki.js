(function(){

  var init = function(){
    var timer = setInterval(function(){
      var searchInProgress = $('.bu-in-progress').is(':visible');
      if (!searchInProgress) {
        clearInterval(timer);
        processResults();
      }
    }, 1000);
  };


  var processResults = function(){
    var items = $('.search-results-item');
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
    res.price = parseInt( $node.find('.bu-main .provider .amount').text().replace(' ', '') );
    res.provider = $node.find('.airline-logo').attr('alt');
    res.flightTime = [];
    $node.find('.leg-summary .flight-time .bu-time').map(function( index, elem ){
      res.flightTime.push(elem.textContent);
    });
    res.flightTime = res.flightTime.join(' / ');
    res.depTime = $node.find('.bu-first .bu-place-1 .bu-time')[0].textContent;
    res.depAirport = $node.find('.bu-first .bu-place-1 .bu-code')[0].textContent;
    return res;
  };


  return {
    init: init
  };

})().init();
