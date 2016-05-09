
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
var date_obj = function(d) { return moment(d.date).clone().toDate();}
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


var scraped_routes;
var scraped_at;
var schedule_container;

function receiveScheduleData(response) {
  console.log(response);
  scraped_routes = response.routes;
  scraped_at = response.scraped_at;
  display_schedules()
}

var tag = document.createElement("script");
tag.src = 'https://boltproject.gitlab.io/BoltScraper/schedules.json?callback=receiveScheduleData';

document.getElementsByTagName("head")[0].appendChild(tag);

display_schedules = function(){
  if (scraped_at){
    parser_scraped_at = scraped_at.slice(0,4) + "-" + scraped_at.slice(4,6) + "-" + scraped_at.slice(6,8)
    var date_scraped_at = moment(parser_scraped_at).clone();

    var svg = d3.select("route-container") 
              .append("svg")
              .attr("width", width)
              .attr("height", 30);
    svg.append('text')
      .text('(Prices last updated at ' + date_scraped_at.format('MMMM Do YYYY, h:mm:ss a') + ')')
      .attr('x', 50)
      .attr('y', 25)
  }
  display_choices(scraped_routes);
  //default to route 0
  route = scraped_routes[0]
  console.log(route);
  display_schedule(scraped_routes[0]);
}

display_choices = function(routes) {
  routeSelector = document.getElementById('route-selector');
  routeSelector.style.visibility = 'visible';
  var routeOptions = []
  for (var i = 0; i < routes.length; i++) {
    routeSelector.options[i] = new Option(scraped_routes[i].origin + ' to ' + scraped_routes[i].destination, i)
  }
  routeSelector.value = 0;
}

change_route = function(){
  console.log("changing!")
  clear_schedule()
  routeSelector = document.getElementById('route-selector');
  var routeId = routeSelector.value;
  console.log("loading new route: ", routeId)
  display_schedule(scraped_routes[routeId])
}

clear_schedule = function(){
  console.log("clearing")
  var deletable = d3.select('#d3-container').select('svg')
  deletable.remove();
}



  var x = d3.scale.linear().domain([6, 20]).range([x_0, width-x_0])
  var get_x_for_time = function(d) { if (!d.date) return x_0; return x(dep_time_obj(d).getHours())}


  var colors = ['green'].concat(colorbrewer.PuBu[4].reverse()).concat('grey')
  //manually chosen pricing buckets for different colors
  var color = d3.scale.linear()
      .domain([0, 5, 16, 25, 40, Number.MAX_SAFE_INTEGER])
      .range(colors);
  console.log(colors);   


display_schedule = function(route){
  data = route.buses//.slice(150,201)
  //console.log(data);
  var end = data.length-1;
  var first_day = moment(data[0].date).clone();
  var last_day = moment(data[end].date).clone();
  // ugh http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
  // todo use moment.js instead of eugh agh hack ew
  var date_range = Math.abs(first_day.diff(last_day, 'days')) + 1;  //Math.floor(last_day - first_day ) / 86400000; height = 100 + 26 * date_range
  height = date_range * 26 + 100;
  console.log(height)

  var y = d3.time.scale().domain([first_day, last_day]).range([100, height]);
  var get_y_for_date = function(d) { 
    if (!d.date) { return 100; } 
    return y(moment(d.date).clone())
  }

  start_date = date_obj(data[0])
  last_date = date_obj(data[end])
  start_month = month(start_date)
  start_day = day_of_month(start_date)

  schedule_container = d3.select("#d3-container") 
              .append("svg")
              .attr("width", width)
              .attr("height", height);
  var items = schedule_container.selectAll("g")
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
    .attr('x', "-100px")
    .attr('y', "-100px")
    .text(function (d) { return JSON.stringify(d)})

  console.log("items createds")

  var last_date = data[data.length - 1]
  var dt = moment(data[0].date).clone()
  console.log("first_day", data[0].date);
  var dt_str = d3.time.format(json_date_format)(dt.toDate())
  console.log("dt_str created:", dt_str, "from:", dt);
    // time labels
    // am
  for (var t = 6; t < 12; t++){
    schedule_container.append("text")
      .attr('x', get_x_for_time({"date": dt_str, "dep_time": t+":00 AM"}))
      .attr('y', get_y_for_date(0) - 10)
      .text(t + ' am')
      .attr('class', 'time-label')
  }
  //noon
  schedule_container.append('text')
    .attr('x', get_x_for_time({"date": dt_str, "dep_time": "12:00 PM"}))
    .attr('y', get_y_for_date(0) - 10)
    .text('12 pm')
    .attr('class', 'time-label')
  // pm
  for (var t = 1; t < 10; t++){
    schedule_container.append("text")
      .attr('x', get_x_for_time({"date": dt_str, "dep_time": (t)+":00 PM"}))
      .attr('y', get_y_for_date(0) - 10)
      .text(t + 'pm')
      .attr('class', 'time-label')
  
  }

  schedule_container.append('text')
    .attr('x',  get_x_for_time({"date": dt_str, "dep_time": "12:00 PM"}))
    .attr('y', get_y_for_date(0) - 35)
    .text('bus departure time')
    .attr('class', 'axis-label')

  console.log("time labels done")


  schedule_container.append('text')
    .attr('class', 'axis-label')
    .attr('x', x_labels) 
    .attr('y', get_y_for_date(0) )
    .text('date')
    .attr('class', 'axis-label')

  schedule_container.append('rect')
    .attr('x', x_labels + 40)
    .attr('y', get_y_for_date(0) )          
    .attr('width', 2)
    .attr('height', height - get_y_for_date(0))
    .attr('class', 'divider-line')

  console.log("divider lines done")

  // month labels ?
  for (var m = parseInt(start_month); m <= parseInt(month(date_obj(last_date))); m++){

    schedule_container.append("text")
      .attr('x', x_labels - 55)
      .attr('y', get_y_for_date({"date": dt_str, "dep_time": "10:00 AM"}) + 65)
      .text(function(d) { return month_name(dt.toDate())})
      //.attr('transform', 'rotate(90, 40, 60)') //uhhh I dunno
      .attr('class', 'month-label h3')

     // date labels
     // todo moment.js for how many days are actually in a month
    while(dt.toDate().getMonth() < m){
      dt_str = d3.time.format(json_date_format)(dt.toDate())
      if (dt < start_date) continue;

     var day = day_in_week(dt.toDate())
      if (day == 6 || day == 1) {
        schedule_container.append('rect')
          .attr('x', x_labels + 40)
          .attr('y', get_y_for_date({"date":dt_str, "dep_time": "10:00 AM"}) - 2)
          .attr('width', width - 40)
          .attr('height', "2px")
          .attr('fill', 'grey')
          .attr('class', 'divider-line')
      }

      schedule_container.append("text")
        .attr('x', x_labels)
        .attr('y', get_y_for_date({"date":dt_str, "dep_time": "10:00 AM"}) + 18)
        .text(dt.get('date'))
        .attr('class', 'date-label')

      dt = dt.add(1, 'day'); //moment(dt.getFullYear(), dt.getMonth(), dt.getDate()+1).clone()
    }
    dt = moment([dt.get('year'), dt.get('month'), 1])
  }

}