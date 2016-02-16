
# find $1 fares on the BoltBus website
from selenium import webdriver
import selenium
import logging
from datetime import timedelta, datetime

import csv
import json
import sys
import time #sleep between requests

#setup constants
url = "https://www.boltbus.com/"
#osPath = os.path.dirname(__file__)
now = datetime.now()
generated_on = str(now)
dateFormat = "%m/%d/%Y"

def write_to_csv(buses):
	filename = "data/" + now.strftime("%Y%m%d") + "_boltbus_schedules.csv"
	with open(filename, 'w') as csvfile:
		fieldnames = ["date", "dep_city", "arr_city", "dep_time", "arr_time", "price"]
		writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
		for bus_details in buses:
			writer.writerow(bus_details)
		print ("saved to csv") 

def write_to_json(buses):
	filename = "data/schedules.json"
	with open(filename, 'w') as outfile:
		json.dump(buses, outfile)
		print ("saved to json file")

def findAvailableFare(driver):
	# find fares (will show for today)
	buses = []
	winning = False
	dates_checked = 0
	while not winning and dates_checked < 1:
		dates_checked = dates_checked + 1
		Schedule_id = "ctl00_cphM_forwardScheduleUC_ScheduleGrid"
		price_class = "faresColumn0" #and not 
		disabled_class= "faresColumnUnavailable"
		price_elements = driver.find_elements_by_class_name(price_class)
		if (price_elements) == 0:
			logging.info(get_date(get_date_element(driver)), "schedule not yet available")
			dates_checked = 100 #shitty way to break out of the while loop

		for index, price_element in enumerate(price_elements):
			price_classes = price_element.get_attribute("class")
			price_text = price_element.text 
			if disabled_class in price_classes:
				logging.debug("bus not available")
			elif "Sold Out" in price_text:
				logging.debug("bus sold out")
			else:
				logging.info("price is ", price_text[1:])
				price = float(price_text[1:])
				logging.info("found price of " + str(price))
				good_price = 10
				awesome_price = 2
				trip = get_trip_details(driver, index)
				buses.append(trip)
				if (price < awesome_price):
					logging.info("WE WON")
					logging.info(trip)
				elif (price < good_price):
					logging.info("we found a price below", good_price)
					logging.info(trip)
				else: 
					logging.debug(trip)
		logging.info("day not acceptable")
		viewNextDay(driver)
	if not winning:
		print ("failed to read bus")
		print (get_date_element(driver))
	return buses

def get_trip_details(driver, index):
	departure_class = "faresColumn1"
	arrival_class = "faresColumn2"
	price_class = "faresColumn0" 
	price_elements = driver.find_elements_by_class_name(price_class)
	price = price_elements[index].text
	arrival_elements = driver.find_elements_by_class_name(arrival_class)
	arrival = arrival_elements[index].text
	departure_elements = driver.find_elements_by_class_name(departure_class)
	departure = departure_elements[index].text
	trip_info = {
		"date": str(get_date(get_date_element(driver))),
		"dep_city": "Seattle",
		"arr_city": "Portland", 
		"dep_time": str(departure), 
		"arr_time": str(arrival), 
		"price": str(price)
	}
	return trip_info

def get_date(dateElement):
	date_str = dateElement.get_attribute("value")
	logging.info(date_str)
	date_value = datetime(*(time.strptime(date_str, dateFormat)[0:6]))
	return date_value

def get_date_element(driver):
	dateBoxId = "ctl00_cphM_forwardRouteUC_txtDepartureDate"
	dateElement = driver.find_element_by_id(dateBoxId)
	return dateElement

def viewNextDay(driver):
	dateElement = get_date_element(driver)
	date_value = get_date(dateElement)
	logging.debug("date", date_value)
	next_day = date_value + timedelta(days=1)
	driver.execute_script("arguments[0].value = arguments[1];", dateElement, next_day.strftime(dateFormat))
	# need to trigger the page to notice it updated... 
	time.sleep(1)
	driver.execute_script("arguments[0].onchange()", dateElement)
	time.sleep(3)

	# can just type in the new date - argh need date knowledge

def findAndClick(driver, elementId, elementName, max_dates_checked=100):
	dates_checked = 0
	found = False
	while (dates_checked < max_dates_checked and not found):
		dates_checked = dates_checked + 1
		try:
			Element = driver.find_element_by_id(elementId)
			logging.info("click " + elementName + " element (attempt " + str(dates_checked) + ")")
			Element.click()
			found = True
		except selenium.common.exceptions.NoSuchElementException:
			logging.error("could not find " + elementName + " element, id " + elementId)
			time.sleep(1)
		except selenium.common.exceptions.WebDriverException:
			if driver.find_element_by_id("pleaseWaitEE_backgroundElement"): 
				# assume it worked
				found = True


def main(argv):

	loglevel = "INFO"
	numeric_level = getattr(logging, loglevel.upper(), None)
	if not isinstance(numeric_level, int):
		raise ValueError('Invalid log level: %s' % loglevel)
	logging.basicConfig(level=numeric_level)

	logging.info("connecting to %s", url)

	driver = webdriver.Firefox()
	driver.get(url)

	time.sleep(2)

	regionId = "ctl00_cphM_forwardRouteUC_lstRegion_textBox"
	regionElement = driver.find_element_by_id(regionId)
	regionElement.click()
	logging.info("click region list")

	time.sleep(1)

	WestCoastId = "ctl00_cphM_forwardRouteUC_lstRegion_repeater_ctl02_link"
	WestCoastElement = driver.find_element_by_id(WestCoastId)
	WestCoastElement.click()
	logging.info("click west coast element")

	time.sleep(4)

	OriginListId = "ctl00_cphM_forwardRouteUC_lstOrigin_textBox"
	OriginListElement = driver.find_element_by_id(OriginListId)
	OriginListElement.click()
	logging.info("click origin list")

	time.sleep(4)

	SeattleOriginId = "ctl00_cphM_forwardRouteUC_lstOrigin_repeater_ctl13_link"
	findAndClick(driver, SeattleOriginId, "Seattle")
	
	time.sleep(4)

	DestinationListId = "ctl00_cphM_forwardRouteUC_lstDestination_textBox"
	findAndClick(driver, DestinationListId, "destinations", 3)

	time.sleep(3)

	#VancouverDestinationId = "ctl00_cphM_forwardRouteUC_lstDestination_repeater_ctl04_link"
	#EugeneDestinationId = "ctl00_cphM_forwardRouteUC_lstDestination_repeater_ctl02_link"
	PortlandDestinationId = "ctl00_cphM_forwardRouteUC_lstDestination_repeater_ctl03_link"
	findAndClick(driver, PortlandDestinationId, "Portland destination")

	time.sleep(5)
	buses = findAvailableFare(driver)

	logging.debug(buses)
	write_to_csv(buses)
	write_to_json(buses)



if __name__ == "__main__":
	main(sys.argv[1:])
