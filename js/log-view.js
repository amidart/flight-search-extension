(function(){

  var init = function(){
    initUI();
    chrome.runtime.sendMessage({
        cmd: 'Log.getRecent',
        data:{count: 1000}
      }, function( records ){
        loadLog( records );
    });
  };


  var initUI = function(){
    $('#btn-export-csv').click(function(){
      exportTable('csv');
    });
    $('#btn-export-xls').click(function(){
      exportTable('xls');
    });
    $('#btn-success-only').click(function(){
      $('body')[0].className = 'success-only';
    });
    $('#btn-failed-only').click(function(){
      $('body')[0].className = 'failed-only';
    });
    $('#btn-show-all').click(function(){
      $('body')[0].className = '';
    });
    $('#log thead .tr-title th').hover(
      function(){
        $('<div>')
          .html('<span class="glyphicon glyphicon-remove leg-remove" aria-hidden="true"></span>')
          .addClass('delete-col')
          .appendTo($(this))
          .click(function(e){
            e.stopPropagation();
            var nthChild = $(this).closest('th')[0].cellIndex + 1;
            $('#log').find('th:nth-child(' + nthChild + ')').remove();
            $('#log').find('td:nth-child(' + nthChild + ')').remove();
          });
      },
      function(){
        $(this).find('.delete-col').remove();
      }
    );
    $('.tr-filter input').keyup(filterTableRows);
  };


  var loadLog = function( records ){
    var html = '';
    console.log(records);
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      var time = new Date(record.timestamp);
      var error = record.data.error;
      var rowClassName = error ? 'bg-warning' : (record.data.success? 'bg-success' : '');
      var data = {
        rowClassName: rowClassName,
        time: moment(time).format('YYYY-MM-DD HH:mm:ss'),
        url: record.data.url,
        params: Provider.fromUrl( record.data.url ),
        targetPrice: record.data.targetPrice,
        error: !!error,
        result: !!error ? '' : record.data.price,
        extra: renderExtra( record.data.extra )
      };
      html += Mustache.to_html( $('#recordTemplate').html(), data );
    }
    $('#log tbody').html(html);
    $('#log').stupidtable();
    $('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    });
  };


  var renderExtra = function( flights ){
    var res = '';
    if (!flights) return res;
    var template = '<div>{{airline}} {{depTime}} {{depAirport}} {{flightTime}}</div>';
    for (var i = 0, len = flights.length; i < len; i++) {
      var flight = flights[i];
      res += Mustache.to_html(template, flight);
    }
    return '<div class="wrap-extra">' + res + '</div>';
  };


  var authorNote = function( isHtml ){
    var text = i18n('text_author_note');
    text = Mustache.to_html(text, {
      url: 'https://chrome.google.com/webstore/detail/laafmimmfoigfibljpeaohdehdnlbddg'
    });
    return text;
  };


  var exportTable = function( format ){
    var $result = $('<table>');
    $('#log tbody tr:visible').each(function(i, row){
      $result.append( $(row).clone() );
    });
    var filename = 'flights.' + format;
    if (format === 'csv') {
      exportTableToCSV( $result, filename );
    }
    else if (format === 'xls') {
      exportTableToXLS( $result[0], filename );
    }
  };


  function exportTableToCSV($table, filename) {
    var $rows = $table.find('tr:has(td)'),
    // Temporary delimiter characters unlikely to be typed by keyboard
    // This is to avoid accidentally splitting the actual contents
    tmpColDelim = String.fromCharCode(11), // vertical tab character
    tmpRowDelim = String.fromCharCode(0), // null character
    // actual delimiter characters for CSV format
    colDelim = '";"',
    rowDelim = '"\n"',
    // Grab text from table into CSV formatted string
    csv = '"' + $rows.map(function (i, row) {
      var $row = $(row),
      $cols = $row.find('td');
      return $cols.map(function (j, col) {
        var $col = $(col),
        text = $.trim( $col.text() );
        return text.replace(/"/g, '""'); // escape double quotes
      }).get().join(tmpColDelim);
    }).get().join(tmpRowDelim)
    .split(tmpRowDelim).join(rowDelim)
    .split(tmpColDelim).join(colDelim) + '"',

    // Data URI
    csvData = 'data:application/csv;charset=utf-8,' + '\ufeff' + encodeURIComponent('\n' + authorNote() + '\n\n') + encodeURIComponent(csv);
    saveToFile(csvData, filename);
  }


  var exportTableToXLS = (function() {
    var uri = 'data:application/vnd.ms-excel;base64,';
    var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>' + authorNote('html') + '<br><br><br><table>{table}</table></body></html>';
    var base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))); };
    var format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }); };
    return function(table, fileName) {
      var ctx = {worksheet: 'Worksheet', table: table.innerHTML};
      saveToFile( uri + base64(format(template, ctx)), fileName);
    };
  })();


  var saveToFile = function(fileContents, fileName) {
    var link = document.createElement('a');
    link.download = fileName;
    link.href = fileContents;
    link.click();
  };


  var filterTableRows = function(){
    var input = this;
    var str = input.value;
    var regexp = new RegExp(str, 'i');
    var $table = $(input).closest('table');
    var nthChild = $(input).closest('th')[0].cellIndex + 1;
    $table.find('tbody tr').each(function(i, tr){
      var $tr = $(tr);
      var value = $tr.find('td:nth-child('+ nthChild + ')').text();
      value = $.trim(value);
      var className = 'filtered-' + nthChild;
      if (!value.match(regexp)) $tr.addClass(className);
      else $tr.removeClass(className);
    });
  };



  return {
    init: init
  };

})().init();
