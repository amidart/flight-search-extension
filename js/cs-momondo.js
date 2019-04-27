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
      var searchInProgress = !$('.Common-Results-SpinnerWithProgressBar').hasClass('finished');
      if (!searchInProgress) {
        clearInterval(timer);
        processResults();
      }
    }, 1000);
  };


  var processResults = function(){
    var items = $('.Flights-Results-FlightResultItem');
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
    res.price = parseInt( $node.find('.Flights-Results-FlightPriceSection .display-price').text().replace(/[^\d]/g, '') );
    if (!res.price) {
      res.price = parseInt( $node.find('.Flights-Results-FlightPriceSection .price').text().replace(/[^\d]/g, '') );
    }
    res.airline = [];
    $node.find('.leg-carrier img').map(function( index, elem ){
      var name = elem.alt;
      if (name) name = name.replace(/ logo$/, '');
      if (name) res.airline.push( name );
    });
    res.airline = res.airline.join(' / ');
    res.flightTime = [];
    $node.find('.duration .top').map(function( index, elem ){
      res.flightTime.push( elem.textContent.replace(/.*?(\d+. \d+.).*/, '$1') );
    });
    res.flightTime = res.flightTime.join(' / ');
    res.depTime = ($node.find('.depart-time')[0] || {}).textContent;
    res.depAirport = ($node.find('.duration .bottom span')[0] || {}).textContent;
    return res;
  };


  return {
    init: init
  };

})().init();
