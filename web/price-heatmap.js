
var week_days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    week_initials = ['S', 'M' ,'T', 'W', 'T', 'F', 'S']
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

var width = 900,
    height = 1000,
    cellWidth = (width-100)/16; // cell size
    cellHeight = 25

var day_in_week = d3.time.format("%w"), // day number of the week
    day_of_week = d3.time.format("%a")
    day_of_month = d3.time.format("%e") // day of the month
    day_of_year = d3.time.format("%j")
    week = d3.time.format("%U"), // week number of the year
    month = d3.time.format("%m"), // month number
    month_name = d3.time.format("%b"), //%B for full name
    year = d3.time.format("%Y"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");



var json_date_format = "%Y-%m-%d %H:%M:%S"

var price_val = function(d) { (d.price && d.price.indexOf('$') >= 0) ? val = parseFloat(d.price.slice(1)) : val = Number.MAX_SAFE_INTEGER; return val}
var date_obj = function(d) { return d3.time.format(json_date_format).parse(d.date)}
var dep_time_obj = function(d) {return d3.time.format("%H:%M %p").parse(d.dep_time)}
var arr_time_obj = function(d) {return d3.time.format("%H:%M %p").parse(d.arr_time)}

var this_month = function(d) { return month(date_obj(d)) - start_month }
var this_day = function(d) { return day_of_month(date_obj(d)) - start_day }


var x_labels = 60;
var x_0 = 120;
var x_days = function(i) { return x_labels; } // x_0 + (cellHeight + 1) * i }
var x_loc = function(d) { return x_days(day_of_month(date_obj(d) - 5) )}
var y_loc = function(d) { 
  var mnth = this_month(d)
  var days = day_of_month(date_obj(d));
  var hrs = dep_time_obj(d).getHours()
  var previous_month_space = (18 * cellHeight * mnth)
  var this_month_days = mnth == 0 ? this_day(d) : days
 // console.log(this_month_days); 
  var position = previous_month_space +  (cellHeight * this_month_days);
  return position; 
} 




d3.json("schedules.json", function(error, json) {

  scraped_at = json["scraped_at"]
  route = json.route
  data = json.buses//.slice(150,201)
  var end = data.length-1;
  var first_day = new Date(data[0].date);
  var last_day = new Date(data[end].date);
  //ugh http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
  // todo use moment.js instead of eugh agh hack ew
  var date_range = Math.floor(last_day - first_day ) / 86400000; height = 100 + 26 * date_range


  var y = d3.time.scale().domain([first_day, last_day]).range([100, height]);
  var get_y_for_date = function(d) { if (!d.date) return 100; return y(new Date(d.date))}

  var x = d3.scale.linear().domain([6, 20]).range([x_0, width-x_0])
  var get_x_for_time = function(d) { if (!d.date) return x_0; return x(dep_time_obj(d).getHours())}

  var colors = ['green'].concat(colorbrewer.PuBu[4].reverse()).concat('grey')
  var color = d3.scale.linear()
      .domain([0, 5, 16, 25, 40, Number.MAX_SAFE_INTEGER])
      .range(colors);


  start_date = date_obj(data[0])
  last_date = date_obj(data[end])
  start_month = month(start_date)
  start_day = day_of_month(start_date)


  //Create SVG element
  var svg = d3.select("#d3-container")
              .append("svg")
              .attr("width", width)
              .attr("height", height);
  if (scraped_at){

  parser_scraped_at = scraped_at.slice(0,4) + "-" + scraped_at.slice(4,6) + "-" + scraped_at.slice(6,8)
  var date_scraped_at = new Date(parser_scraped_at);
  svg.append('text')
      .text('(Prices last updated at ' + date_scraped_at.toDateString() + ")")
      .attr('x', 50)
      .attr('y', get_y_for_date(0) - 80)
}
  var items = svg.selectAll("g")
     .data(data)
     .enter().append('g')
  items.append("rect")
    .attr("x", function(d) { return get_x_for_time(d) })
    .attr("y", function(d) { return get_y_for_date(d);})
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", function(d) { return color(price_val(d))})
  items.append('text')
    .text(function(d) { 
      (d.price && d.price.indexOf('.') > 0) ? val = d.price.split('.')[0] : val = "SOLD";
     return  val; 
    })
    .attr("x", function(d) { return get_x_for_time(d) + 4})
    .attr("y", function(d) { return get_y_for_date(d) + cellHeight - 6;})
    .attr("width", cellWidth)
    .attr("height", cellHeight)
  items.append("svg:title")
    .text(function(d) { return d.price + ", departs at " + d.dep_time})
  items.append('text')
    .attr('x', -100)
    .attr('y', -100)
    .text(function (d) { return JSON.stringify(d)})

console.log("items createds")

  var last_date = data[data.length - 1]
  var dt = new Date(data[0].date)
    var dt_str = d3.time.format(json_date_format)(dt)
    // time labels
    // am
    for (var t = 6; t < 12; t++){
      svg.append("text")
        .attr('x', get_x_for_time({"date": dt_str, "dep_time": t+":00 AM"}))
        .attr('y', get_y_for_date(0) - 10)
        .text(t + ' am')
        .attr('class', 'time-label')
    }
    //noon
    svg.append('text')
      .attr('x', get_x_for_time({"date": dt_str, "dep_time": "12:00 PM"}))
      .attr('y', get_y_for_date(0) - 10)
      .text('12 pm')
      .attr('class', 'time-label')
    // pm
    for (var t = 1; t < 10; t++){
      svg.append("text")
        .attr('x', get_x_for_time({"date": dt_str, "dep_time": (t)+":00 PM"}))
        .attr('y', get_y_for_date(0) - 10)
        .text(t + 'pm')
        .attr('class', 'time-label')
    
    }

    svg.append('text')
      .attr('x',  get_x_for_time({"date": dt_str, "dep_time": "12:00 PM"}))
      .attr('y', get_y_for_date(0) - 35)
      .text('bus departure time')
      .attr('class', 'axis-label')

    console.log("time labels done")


    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', x_labels) 
      .attr('y', get_y_for_date(0) )
      .text('date')
      .attr('class', 'axis-label')

    svg.append('rect')
      .attr('x', x_labels + 40)
      .attr('y', get_y_for_date(0) )          
      .attr('width', 2)
      .attr('height', height - get_y_for_date(0))
      .attr('class', 'divider-line')

  // month labels ?
  for (var m = parseInt(start_month); m <= parseInt(month(date_obj(last_date))); m++){

    svg.append("text")
      .attr('x', x_labels - 55)
      .attr('y', get_y_for_date({"date": dt_str, "dep_time": "10:00 AM"}) + 65)
      .text(function(d) { return month_name(dt)})
      //.attr('transform', 'rotate(90, 40, 60)') //uhhh I dunno
      .attr('class', 'month-label h3')

     // date labels
     // todo moment.js for how many days are actually in a month
    while(dt.getMonth() < m){
      dt_str = d3.time.format(json_date_format)(dt)
      if (dt < start_date) continue;

     var day = day_in_week(dt)
      if (day == 6 || day == 1) {
        svg.append('rect')
          .attr('x', x_labels + 40)
          .attr('y', get_y_for_date({"date":dt_str, "dep_time": "10:00 AM"}) - 2)
          .attr('width', width - 40)
          .attr('height', 2)
          .attr('fill', 'grey')
          .attr('class', 'divider-line')
      }

      svg.append("text")
        .attr('x', x_labels)
        .attr('y', get_y_for_date({"date":dt_str, "dep_time": "10:00 AM"}) + 18)
        .text(dt.getDate())
        .attr('class', 'date-label')

      dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()+1)
    }

    dt = new Date(dt.getFullYear(), dt.getMonth(), 1)
  }

})
