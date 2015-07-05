(function(){

  var init = function(){
    var timer = setInterval(function(){
      var searchInProgress = $('.bu-in-progress').is(':visible');
      if (!searchInProgress) {
        clearInterval(timer);
      }
    }, 1000);
    initObserver();
  };



  /**
   * ================== Mutation Observer
   */
  var initObserver = function(){
    var target = document.querySelector('.search-results');

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          processChildList(mutation.addedNodes);
        }
      });
    });

    var config = { subtree: true, childList: true, characterData: false };
    observer.observe(target, config);
  };


  var processChildList = function(children){
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];
      processNode(node);
    }
  };


  var processNode = function(node){
    //console.log(node.className);
    if (node.className === 'search-results-item') {
      processPriceItem( node );
    }
    // ignore text nodes
    if (node.nodeType === 3) return;
  };


  var processPriceItem = function( node ){
    var $node = $(node);
    var res = {};
    res.amount = parseInt( $node.find('.bu-main .provider .amount').text().replace(' ', '') );
    res.provider = $node.find('.airline-logo').attr('alt');
    res.flightTime = '';
    $node.find('.leg-summary .flight-time .bu-time').map(function( index, elem ){
      res.flightTime += elem.textContent + ' / ';
    });
    console.log(res);
  };

  return {
    init: init
  };

})().init();
