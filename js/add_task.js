var Leg = function( from, to, daysMin, daysMax ){
  this.from = from || '';
  this.to = to || '';
  this.daysMin = daysMin || 1;
  this.daysMax = daysMax || 14;
  return this;
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

    $('#generate').click(function(){
      generateTasks();
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
    $('.legs').append( html );
  };


  var generateTasks = function(){
    var data = getFormsData();
    var results = Generator[ data.type ]( data );
    console.log(results);
    var html = '';
    for (var i = 0, len = results.length; i < len; i++) {
      var result = results[i];
      html += Buruki[data.type]( result ) + '\n';
    }
    $('#result').html( html );
    $('#result-count').html( ' (' + results.length + ')' );
  };


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
      $('#result').val('');
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



var Buruki = (function(){

  // oneway
  // mow/bkk/2015-07-18/-/3/2/1/b/
  // roundtrip
  // mow/bkk/2015-07-18/2015-07-25/3/2/1/e/
  // complex:
  // MOW-BKK/2015-07-18/BKK-SGN/2015-07-21/SGN-HKG/2015-07-24/HKG-MOW/2015-07-31/3/2/1/b/

  var onewayTemplate = 'http://buruki.ru/search/{{from}}/{{to}}/{{date}}/-/{{adults}}/0/0/{{class}}';
  var roundtripTemplate = 'http://buruki.ru/search/{{from}}/{{to}}/{{dateOut}}/{{dateBack}}/{{adults}}/0/0/{{class}}';
  var complexTemplate = 'http://buruki.ru/complex/';

  var oneway = function( data ){
     return Mustache.to_html( onewayTemplate, data );
  };

  var roundtrip = function( data ){
    return Mustache.to_html( roundtripTemplate, data );
  };

  var complex = function( data ){
    var res = complexTemplate;
    for (var i = 0, len = data.legs.length; i < len; i++) {
      var leg = data.legs[i];
      res += leg.from + '-' + leg.to + '/' + leg.date + '/';
    }
    res += data.adults + '/0/0/' + data.class;
    return res;
  };


  return {
    oneway: oneway,
    roundtrip: roundtrip,
    complex: complex
  };

})();
