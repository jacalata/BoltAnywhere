var table = document.getElementById("displayTable"); //give this ID to your table
$.getJSON( "schedules.json", function( schedule ) {
	// 	console.log(schedule.length)
	 var table_obj = $('table');
	 var table_head = $('<thead>');
	 var table_row = $('<tr>', {id: "header"});				 
		 var table_cell_date = $('<th>', {html: "date"}); 
			 table_row.append(table_cell_date);
		 var table_cell_deptime = $('<th>', {html: "dep_time"});
			 table_row.append(table_cell_deptime);
		/* var table_cell_depcity = $('<th>', {html: "dep_city"});
			 table_row.append(table_cell_depcity)
		 var table_cell_arrcity = $('<th>', {html: "arr_city"});
			 table_row.append(table_cell_arrcity);
		 */var table_cell_arrtime = $('<th>', {html: "arr_time"}); 
			 table_row.append(table_cell_arrtime);
		 var table_cell_price = $('<th>', {html: "price"});
			 table_row.append(table_cell_price);
		table_head.append(table_row);
		table_obj.append(table_head);
		var tbody = $('<tbody>');
		$.each(schedule, function(index, item){
			// console.log(item)
			 var table_row = $('<tr>', {id: index});
			 var table_cell_date = $('<td>', {html: item.date}); 
			 table_row.append(table_cell_date);
			 var table_cell_deptime = $('<td>', {html: item.dep_time});
			 table_row.append(table_cell_deptime);
			 /*var table_cell_depcity = $('<td>', {html: item.dep_city});
			 table_row.append(table_cell_depcity)
			 var table_cell_arrcity = $('<td>', {html: item.arr_city});
			 table_row.append(table_cell_arrcity);
			 */
			 var table_cell_arrtime = $('<td>', {html: item.arr_time}); 
			 table_row.append(table_cell_arrtime);
			 var table_cell_price = $('<td>', {html: item.price});
			 table_row.append(table_cell_price);
			 tbody.append(table_row);
		})
		table_obj.append(tbody);
})
