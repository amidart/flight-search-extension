/**
 * Leg class
 */

var Leg = function( from, to, daysMin, daysMax ){
  this.from = from || '';
  this.to = to || '';
  this.daysMin = daysMin || 1;
  this.daysMax = daysMax || 14;
  return this;
};


Leg.prototype.setRoot = function( $node ) {
  this.$root = $node;
};


Leg.prototype.renderForm = function() {
  return Mustache.to_html(
    document.querySelector('#leg-template').textContent,
    {
      label_from_airport: _('label_from_airport'),
      label_to_airport: _('label_to_airport'),
      label_days_min: _('label_days_min'),
      label_days_max: _('label_days_max')
    }
  );
};


Leg.prototype.initUI = function() {
  var self = this;
  this.$root.find('.leg-remove').click(function(){
    self.remove();
  });
  this.typeahead();
};


Leg.prototype.typeahead = function(){
  this.$root
    .find('.iata-from, .iata-to')
    .typeahead({
      minLength: 3,
      matcher: function( item ){
        return true;
      },
      source: function (query, process) {
        return $.get(
          'http://buruki.ru/esac/city_airport?term=' + query,
          function (data) {
            if (typeof data !== 'object' ||
              !data.results ||
              !data.results.length) {
              return false;
          }
          var res = data.results.map(function(item){
            return {
              id: item.iata,
              name: item.title + ' - ' + item.iata
            };
          });
          process(res);
        }
        );
      }
    });
  // on change
  this.$root.find('.iata-from, .iata-to').change(function(){
    var current = $(this).typeahead("getActive");
    if (!current) return;
    this.value = current.id;
  });
};


Leg.prototype.remove = function(){
  this.$root.remove();
};

/**
 *
 */

var UserData = (function(){

  var view = '';
  var status = null;

  var init = function(){
    initUI();
    setView('roundtrip');
  };


  var initUI = function(){

    status = new Helpers.Status( $('#status'), {
      show: {method: 'show', params: []},
      hide: {method: 'hide', params: []}
    } );

    $('#add-leg').click(addLeg);

    $('.switch-type').click(function(){
      $('.switch-type').removeClass('active');
      setView( this.id );
    });

    $('.datepicker').datepicker({
      dateFormat: 'yy-mm-dd'
    });

    $('#startDate').change(function(){
      if ( $('#endDate').val() ) return;
      var start = new Date( this.value );
      var end = new Date( start.setDate(start.getDate() + 14) );
      $('#endDate').val( end.yyyymmdd() );
    });

    $('#generate').click(function(){
      generateTasks();
    });

    $('#delete10').click(function(){
      deleteRandomLines( 10 );
    });

    $('#shuffle').click(function(){
      shuffleTasks();
    });

    $('#result').change(function(){
      if (!this.value) return;
      var count = this.value.split('\n').length;
      $('#result-count').html( '(' + count + ')' );
    });

    $('#enqueue-btn').click(function(){
      var price = parseInt( $('#targetPrice').val() );
      validateResults(
        function(){
          console.log('enqueue');
          enqueueTasks( $('#result').val().split('\n'), price );
        },
        function( error ){
          status.error(error, 5000);
        }
      );

    });
  };


  var setView = function( viewId ){
    view = viewId;
    $('body')[0].className = view;
    $('#' + view).addClass('active');
    initLegs( view );
  };


  var initLegs = function( view ){
    $('.legs').html('');
    var legs = 1;
    if ( view === 'complex' ) legs = 2;
    for( var i = 0; i < legs; i++) {
      addLeg();
    }
  };


  var addLeg = function(){
    var leg = new Leg();
    var html = leg.renderForm();
    var $node = $(html).appendTo('.legs');
    leg.setRoot($node);
    leg.initUI();
  };


  var generateTasks = function(){
    var data = getFormsData();
    var results = Generator[ data.type ]( data );
    console.log(results);
    var lines = [];
    for (var i = 0, len = results.length; i < len; i++) {
      var result = results[i];
      lines.push( Provider.get(data.provider).toUrl[data.type]( result ) );
    }
    $('#result')
      .val( lines.join('\n') )
      .trigger('change');
  };


  var deleteRandomLines = function( percent ){
    var lines = $('#result').val().split('\n');
    lines = $.grep(lines, function(line){
      var filtered = Math.floor( Math.random() * percent );
      return filtered !== 0;
    });
    $('#result')
      .val( lines.join('\n') )
      .trigger('change');
  };


  var shuffleTasks = function(){
    var lines = $('#result').val().split('\n');
    shuffle(lines);
    $('#result')
      .val( lines.join('\n') );
  };


  var shuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }


  var getFormsData = function(){
    var res = {};
    var legs = [];
    res.type = view;
    res.startDate = $('#startDate').val();
    res.endDate = $('#endDate').val();
    if (view === 'roundtrip') {
      res.daysMin = parseInt( $('#daysMin').val() );
      res.daysMax = parseInt( $('#daysMax').val() );
    }
    $('.leg').each(function(index, leg){
      var $leg = $(leg);
      legs.push({
        from: $leg.find('.iata-from').val(),
        to: $leg.find('.iata-to').val(),
        daysMin: parseInt( $leg.find('.days-min').val() ),
        daysMax: parseInt( $leg.find('.days-max').val() )
      });
    });
    res.class = $('#flightClass').val();
    res.adults = parseInt( $('#adults').val() );
    res.provider = $('#provider').val();
    res.randomProvider = $('#random-provider').is(':checked');
    res.legs = legs;
    console.log(res);
    return res;
  };


  var validateResults = function( onSuccess, onError ){
    var errors = [];
    if ( !parseInt($('#targetPrice').val()) ) {
      errors.push( _('error_price_empty') );
    }
    if ( !$('#result').val() ) {
      errors.push( _('error_tasks_empty') );
    }
    if (errors.length) {
      var errorStr = errors.join('</p><p>');
      onError( '<p>' + errorStr + '</p>');
      return;
    }
    onSuccess();
  };


  var enqueueTasks = function( tasks, price ){
    console.log(tasks);
    chrome.runtime.sendMessage({
      cmd: 'enqueueTasks',
      data: {
        tasks: tasks,
        price: price
      }
    }, function(){
      status.success(_('status_ok'), 1000);
      $('#result').html('');
    });
  };


  return {
    init: init
  };

})();

UserData.init();



Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear();
  var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1);
  var dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
  return yyyy + '-' + mm + '-' + dd;
};


/**
 * Generator
 */


var Generator = (function(){

  var oneway = function( data ){
    var start = new Date( data.startDate );
    var end = new Date( data.endDate );
    var res = [];
    while(start <= end) {
      res.push({
        from: data.legs[0].from,
        to: data.legs[0].to,
        date: start.yyyymmdd(),
        adults: data.adults,
        class: data.class
      });
      var newDate = start.setDate(start.getDate() + 1);
      start = new Date(newDate);
    }
    return res;
  };


  var roundtrip = function( data ){
    var start = new Date( data.startDate );
    var end = new Date( data.endDate );
    var res = [];
    while(start <= end) {
      for (var i = data.daysMin; i <= data.daysMax; i++) {
        res.push({
          from: data.legs[0].from,
          to: data.legs[0].to,
          dateOut: start.yyyymmdd(),
          dateBack: getDate( start, i).yyyymmdd(),
          adults: data.adults,
          class: data.class
        });
      }
      var newDate = start.setDate(start.getDate() + 1);
      start = new Date(newDate);
    }
    return res;
  };


  var complex = function( data ){
    var start = new Date( data.startDate );
    var end = new Date( data.endDate );
    var res = [];
    var ranges = getRanges( data.legs );
    var daysComb = cartesian.apply( null, ranges );
    while(start <= end) {
      console.log(start.yyyymmdd());
      for (var i = 0, len = daysComb.length; i < len; i++) {
        var combination = daysComb[i];
        var legs = generateLegs( data.legs, start, combination);
        res.push({
          legs: legs,
          adults: data.adults,
          class: data.class
        });
      }
      var newDate = start.setDate(start.getDate() + 1);
      start = new Date(newDate);
    }
    return res;
  };


  var getRanges = function( legs ){
    var ranges = [];
    for (var i = 0, len = legs.length - 1; i < len; i++) {
      var leg = legs[i];
      if (!leg.daysMin || !leg.daysMax) throw('Bad range');
      ranges.push( range( leg.daysMin, leg.daysMax) );
    }
    return ranges;
  };


  var range = function( start, end ){
    var list = [];
    for (var i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  };


  /**
   * Generating combinations from n arrays with m elements
   * http://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
   * Usage: cartesian([0,1], [0,1,2,3], [0,1,2]);
   */
  function cartesian() {
    var r = [], arg = arguments, max = arg.length-1;
    function helper(arr, i) {
      for (var j=0, l=arg[i].length; j<l; j++) {
        var a = arr.slice(0); // clone arr
        a.push(arg[i][j]);
        if (i==max)
          r.push(a);
        else
          helper(a, i+1);
      }
    }
    helper([], 0);
    return r;
  }


  var generateLegs = function( legs, start, arrIntervals ){
    console.log(legs, arrIntervals);
    var date = start;
    var res = [{
      from: legs[0].from,
      to: legs[0].to,
      date: start.yyyymmdd()
    }];
    for (var i = 1, len = legs.length; i < len; i++) {
      var leg = legs[i];
      days = arrIntervals[i-1];
      date = getDate(date, days);
      res.push({
        from: leg.from,
        to: leg.to,
        date: date.yyyymmdd()
      });
    }
    console.log(res);
    return res;
  };


  var getDate = function( start, days ){
    var tmpDate = new Date( start.getTime() );
    var newDate = tmpDate.setDate( tmpDate.getDate() + days );
    return (new Date(newDate));
  };


  return {
    oneway: oneway,
    roundtrip: roundtrip,
    complex: complex
  };

})();

