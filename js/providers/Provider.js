var Provider = (function(){

  var providers = {};


  var add = function( id, provider ){
    providers[id] = provider;
  };


  var get = function( id ){
    return providers[id];
  };


  var getRandom = function(){
    var keys = Object.keys(providers);
    return providers[keys[ keys.length * Math.random() << 0]];
  };


  var fromUrl = function( url ){
    for (var key in providers) {
      if ( url.indexOf( key ) !== -1 ) return providers[key].fromUrl(url);
    }
    return url;
  };


  return {
    add: add,
    get: get,
    getRandom: getRandom,
    fromUrl: fromUrl
  };

})();
