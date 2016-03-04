
var week_days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    week_initials = ['S', 'M' ,'T', 'W', 'T', 'F', 'S']
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

var width = 1100,
    height = 1000,
    cellWidth = (width-100)/31; // cell size
    cellHeight = 25

var day = d3.time.format("%w"), // day number of the week
    day_of_week = d3.time.format("%a")
    day_of_month = d3.time.format("%e") // day of the month
    day_of_year = d3.time.format("%j")
    week = d3.time.format("%U"), // week number of the year
    month = d3.time.format("%m"), // month number
    year = d3.time.format("%Y"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");


var json_date_format = "%Y-%m-%d %H:%M:%S"
var start_month

var price_val = function(d) { return parseFloat(d.price.slice(1))}
var date_obj = function(d) { return d3.time.format(json_date_format).parse(d.date)}
var dep_time_obj = function(d) {return d3.time.format("%H:%M %p").parse(d.dep_time)}
var arr_time_obj = function(d) {return d3.time.format("%H:%M %p").parse(d.arr_time)}

var x_days = function(i) { return 60 + (cellWidth + 1) * i }
var x_loc = function(d) { return x_days(day_of_month(date_obj(d)) )}
var this_month = function(d) { return month(date_obj(d)) - start_month }
var y_loc = function(d) { 
  var mnth = this_month(d)
  var hrs = dep_time_obj(d).getHours()
  var x = ( (18 * cellHeight * mnth) + (cellHeight * hrs) );
  return x; 
} 


var data
d3.json("schedules.json", function(error, json) {
    console.log(json.length)
    data = json//.slice(1,20)

  start_month = month(date_obj(data[0]))


  var color = d3.scale.linear()
      .domain([0, 30])
      .range(['darkgreen', 'lightgreen']);

  //Create SVG element
  var svg = d3.select("#d3-container")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

  var items = svg.selectAll("rect")
     .data(data)
     .enter().append("rect")
       .attr("x", function(d) { return x_loc(d) })
       .attr("y", function(d) { return y_loc(d) })
       .attr("width", cellWidth)
       .attr("height", cellHeight)
       .attr("hidden-text", function(d) { return JSON.stringify(d)})
       .attr("fill", function(d) { return color(price_val(d))})
     .append("svg:title")
        .text(function(d) { return d.price})


     // date labels
  for (var i=1; i<=31; i++){
    svg.append("text")
      .attr('x', function() { return x_days(i) })
      .attr('y', 70)
      .text(function() { return i})
      .attr('class', 'date-label')
  }

  // month labels ?
  var last_date = data[data.length - 1]
  var dt = new Date(data[0].date)
  for (var m = parseInt(start_month); m <= parseInt(month(date_obj(last_date))); m++){
    var dt_str = d3.time.format(json_date_format)(dt)

    svg.append("text")
      .attr('x', x_days(0) - 55)
      .attr('y', y_loc({"date": dt_str, "dep_time": "10:00 AM"}))
      .text(months[m-1])
      .attr('class', 'month-label')

    // time labels
    for (var t = 6; t < 12; t++){
      svg.append("text")
        .attr('x', x_days(0))
        .attr('y', y_loc({"date": dt_str, "dep_time": t+":00 AM"}))
        .text(t)
        .attr('class', 'time-label')
    }
    svg.append('text')
      .attr('x', x_days(0))
      .attr('y', y_loc({"date": dt_str, "dep_time": "12:00 PM"}))
      .text("12")
      .attr('class', 'time-label')

    for (var t = 1; t < 10; t++){
      svg.append("text")
        .attr('x', x_days(0))
        .attr('y', y_loc({"date": dt_str, "dep_time": (t)+":00 PM"}))
        .text(t)
        .attr('class', 'time-label')
    
    }

    dt = new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate())
  }

})
