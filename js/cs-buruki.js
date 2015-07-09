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
    var len = items.length;
    if (len > 3) len = 3;
    for (var i = 0; i < len; i++) {
      var item = items[i];
      processPriceItem( item );
    }
  };


  var processPriceItem = function( node ){
    var $node = $(node);
    var res = {};
    res.amount = parseInt( $node.find('.bu-main .provider .amount').text().replace(' ', '') );
    res.provider = $node.find('.airline-logo').attr('alt');
    res.flightTime = [];
    $node.find('.leg-summary .flight-time .bu-time').map(function( index, elem ){
      res.flightTime.push(elem.textContent);
    });
    res.flightTime = res.flightTime.join(' / ');
    console.log(res);
  };

  return {
    init: init
  };

})().init();
