var Log = (function(){

  var maxLength = 50;
  var records = [];


  var init = function( length ){
    if (length) maxLength = length;
    restore();
  };


  var add = function( data ){
    var item = {
      timestamp: Date.now(),
      data: data
    };
    records.push( item );
    if (records.length > maxLength) records.shift();
    save();
  };


  var save = function(){
    localStorage.log = JSON.stringify( records );
  };


  var restore = function(){
    records = JSON.parse( localStorage.log || '[]');
    console.log( records );
  };


  var getRecent = function( n ){
    var res = [];
    var len = records.length;
    if (!len) return res;
    var startIndex = len - n > 0 ? len - n : 0;
    for (var i = len - 1; i >= startIndex; i--) {
      var item = records[i];
      res.push(item);
    }
    return res;
  };


  return {
    init: init,
    add: add,
    restore: restore,
    getRecent: getRecent
  };

})();
