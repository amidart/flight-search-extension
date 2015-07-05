var Leg = function( from, to, daysMin, daysMax ){
  this.from = from || '';
  this.to = to || '';
  this.daysMin = daysMin || 1;
  this.daysMax = daysMax || 14;
  return this;
};


Leg.prototype.renderForm = function() {
  return Mustache.to_html( document.querySelector('#leg-template').textContent, this);
};


/**
 *
 */

var UserData = (function(){

  var view = '';

  var init = function(){
    initUI();
    setView('roundtrip');
  };


  var initUI = function(){
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
    var html = '';
    for (var i = 0, len = results.length; i < len; i++) {
      var result = results[i];
      html += Buruki[data.type]( result ) + '\n';
    }
    $('#result').html( html );
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
    $('.leg').each(function(index, form){
      var $form = $(form);
      legs.push({
        from: $form.find('.iata-from').val(),
        to: $form.find('.iata-to').val(),
        daysMin: parseInt( $form.find('.daysMin').val() ),
        daysMax: parseInt( $form.find('.daysMax').val() )
      });
    });
    res.class = $('#flightClass').val();
    res.adults = parseInt( $('#adults').val() );
    res.price = parseInt( $('#targetPrice').val() );
    res.legs = legs;
    console.log(res);
    return res;
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
          dateBack: getDate( start, i),
          adults: data.adults,
          class: data.class
        });
      }
      var newDate = start.setDate(start.getDate() + 1);
      start = new Date(newDate);
    }
    return res;
  };


  var getDate = function( start, days ){
    var tmpDate = new Date( start.getTime() );
    var newDate = tmpDate.setDate( tmpDate.getDate() + days );
    return (new Date(newDate)).yyyymmdd();
  };


  return {
    oneway: oneway,
    roundtrip: roundtrip
  };

})();



var Buruki = (function(){

  // oneway
  // mow/bkk/2015-07-18/-/3/2/1/b/
  // roundtrip
  // mow/bkk/2015-07-18/2015-07-25/3/2/1/e/
  // complex:
  // MOW-BKK/2015-07-18/BKK-SGN/2015-07-21/SGN-HKG/2015-07-24/HKG-MOW/2015-07-31/3/2/1/b/

  var onewayTemplate = '{{from}}/{{to}}/{{date}}/-/{{adults}}/0/0/{{class}}';
  var roundtripTemplate = '{{from}}/{{to}}/{{dateOut}}/{{dateBack}}/{{adults}}/0/0/{{class}}';

  var oneway = function( data ){
     return Mustache.to_html( onewayTemplate, data );
  };

  var roundtrip = function( data ){
    return Mustache.to_html( roundtripTemplate, data );
  };

  return {
    oneway: oneway,
    roundtrip: roundtrip
  };

})();
