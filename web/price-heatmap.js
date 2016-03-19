
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


var x_0 = 60;
var x_days = function(i) { return x_0 + (cellHeight + 1) * i }
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

var y_pos_days_down = function(d) {
 // console.log(d);
  if (!d["dep_time"]) return 0; //why are we getting an empty object here
  var mnth = this_month(d)
  var days = day_of_month(date_obj(d));
  var total_days = date_obj(d) - start_date
 // console.log(date_obj(d), start_date, total_days);
  var previous_month_space = mnth ==  x_days(31 - start_day) 
  var this_month_days = mnth == 0 ? this_day(d) : days
  var position = previous_month_space + x_days(this_month_days);
 //console.log(d, mnth, position);
  return position;
}


var x_pos_hours_across = function(d){
 // console.log(d);
  if (!d["dep_time"]) return 0; //why are we getting an empty object here
  var hrs = dep_time_obj(d).getHours();
  return x_0 + (cellWidth + 1) * (hrs - 5);
}


d3.json("schedules.json", function(error, json) {

  scraped_at = json["scraped_at"]
  parser_scraped_at = scraped_at.slice(0,4) + "-" + scraped_at.slice(4,6) + "-" + scraped_at.slice(6,8)
  var date_scraped_at = new Date(parser_scraped_at);
  console.log(scraped_at, parser_scraped_at, date_scraped_at)
  route = json.route
  data = json.buses//.slice(150,201)
  var end = data.length-1;
  var first_day = new Date(data[0].date);
  var last_day = new Date(data[end].date);
  var date_range = Math.floor(last_day - first_day ) / 86400000; //ugh http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
  height = 100 + 26 * date_range


  var y = d3.time.scale().domain([first_day, last_day]).range([100, height]);
  var get_y_for_date = function(d) { if (!d.date) return 100; return y(new Date(d.date))}
    start_date = date_obj(data[0])
  last_date = date_obj(data[end])
  start_month = month(start_date)
  start_day = day_of_month(start_date)
//  console.log(start_date, start_month, start_day)
 // console.log(last_date);

  var color = d3.scale.linear()
      .domain([0, 16, 25, 40])
      .range(colorbrewer.PuBu[4].reverse());

  //Create SVG element
  var svg = d3.select("#d3-container")
              .append("svg")
              .attr("width", width)
              .attr("height", height);
  svg.append('text')
      .text('(Prices last updated at ' + date_scraped_at.toDateString() + ")")
      .attr('x', 50)
      .attr('y', get_y_for_date(0) - 80)

  var items = svg.selectAll("g")
     .data(data)
     .enter().append('g')
  items.append("rect")
    .attr("x", function(d) { return x_pos_hours_across(d) })
    .attr("y", function(d) { var y_val = get_y_for_date(d); return y_val;})//return y_pos_days_down(d) })
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", function(d) { return color(price_val(d))})
  items.append('text')
    .text(function(d) { 
      (d.price && d.price.indexOf('.') > 0) ? val = d.price.split('.')[0] : val = d.price | "";
     return  val; 
    })
    .attr("x", function(d) { return x_pos_hours_across(d) + 4})
    .attr("y", function(d) { var y_val = get_y_for_date(d) + cellHeight - 6; return y_val;})//function(d) { return y_pos_days_down(d) + cellHeight - 6})
    .attr("width", cellWidth)
    .attr("height", cellHeight)
  items.append("svg:title")
    .text(function(d) { return d.price + ", departs at " + d.dep_time})

console.log("items createds")

  var last_date = data[data.length - 1]
  var dt = new Date(data[0].date)
    var dt_str = d3.time.format(json_date_format)(dt)
    // time labels
    // am
    for (var t = 6; t < 12; t++){
      svg.append("text")
        .attr('x', x_pos_hours_across({"date": dt_str, "dep_time": t+":00 AM"}))
        .attr('y', get_y_for_date(0) - 10)
        .text(t)
        .attr('class', 'time-label')
    }
    //noon
    svg.append('text')
      .attr('x', x_pos_hours_across({"date": dt_str, "dep_time": "12:00 PM"}))
      .attr('y', get_y_for_date(0) - 10)
      .text('12')
      .attr('class', 'time-label')
    // pm
    for (var t = 1; t < 10; t++){
      svg.append("text")
        .attr('x', x_pos_hours_across({"date": dt_str, "dep_time": (t)+":00 PM"}))
        .attr('y', get_y_for_date(0) - 10)
        .text(t)
        .attr('class', 'time-label')
    
    }

    svg.append('text')
      .attr('x',  x_pos_hours_across({"date": dt_str, "dep_time": "12:00 PM"}))
      .attr('y', get_y_for_date(0) - 35)
      .text('bus departure time')
      .attr('class', 'axis-label')

    console.log("time labels done")


    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', x_days(0) - 45)
      .attr('y', x_days(0) + 10)
      .text('date')
      .attr('class', 'axis-label')

  // month labels ?
  for (var m = parseInt(start_month); m <= parseInt(month(date_obj(last_date))); m++){

    svg.append("text")
      .attr('x', x_days(0) - 55)
      .attr('y', get_y_for_date({"date": dt_str, "dep_time": "10:00 AM"}) + 65)
      .text(function(d) { return month_name(dt)})
      //.attr('transform', 'rotate(90, 40, 60)')
      .attr('class', 'month-label h3')

     // date labels
    for (var i=1; i<=31; i++){
      dt = new Date(dt.getFullYear(), dt.getMonth(), i)
      dt_str = d3.time.format(json_date_format)(dt)
      if (dt < start_date) continue;

     var day = day_in_week(dt)
      if (day == 6 || day == 1) {
        svg.append('rect')
          .attr('x', x_days(0) + 40)
          .attr('y', get_y_for_date({"date":dt_str, "dep_time": "10:00 AM"}) - 2)
          .attr('width', width - 40)
          .attr('height', 2)
      }

      svg.append("text")
        .attr('x', x_days(0))
        .attr('y', get_y_for_date({"date":dt_str, "dep_time": "10:00 AM"}) + 18)
        .text(i)
        .attr('class', 'date-label')
    }
    console.log("date labels done")

    dt = new Date(dt.getFullYear(), dt.getMonth()+1, 1)
  }

})
