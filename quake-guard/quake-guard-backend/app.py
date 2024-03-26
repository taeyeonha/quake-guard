# Machine learning dependencies
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
# google maps dependencies
import googlemaps
from datetime import datetime
import math
# flask dependencies
from flask import Flask, jsonify, request, json
from flask_cors import CORS

import pickle

print("Starting Quake Guard Backend")

print("Read CSV")
# save filepath to variable for easier access
quake_data_file = 'silver.csv'
# read the data and store data in DataFrame titled melbourne_data
quake_data = pd.read_csv(quake_data_file)

# creates the ml model
quake_model = pickle.load(open('finalized_model.sav', 'rb'))
print("Created ML Model")
# TODO: REMEMBER TO ADD KEY HERE & REMEMBER TO ENABLE Geocoding and Distance Matrix APIs
gmaps = googlemaps.Client(key='#not enabled')

print("Connect to Google Maps API")

# get the lat and long from the address
def get_lat_long(city, region, country):
	# Geocoding an address
	address = ''
	# get the address and validate
	if (city != ''):
		address += city
	if (region != ''):
		address += ", " + region
	if (country != ''):
		address += ", " + country
	
	#validate address
	if (address == ''):
		return "{error: 'No address provided'}", 400

	# get the lat and long
	geocode_result = gmaps.geocode(address)
	# returns a dictornary with the lat and long as fields
	return geocode_result[0]['geometry']['location']

def haversine_distance(mk1, mk2):
	R = 3958.8; # Radius of the Earth in miles
	rlat1 = math.radians(mk1[0]) # Convert degrees to radians
	rlat2 = math.radians(mk2[0]) # Convert degrees to radians
	difflat = rlat2-rlat1 # Radian difference (latitudes)
	difflon = math.radians(mk2[1]-mk1[1]) # Radian difference (longitudes)
	d = 2 * R * math.asin(math.sqrt(math.sin(difflat/2)*math.sin(difflat/2)+math.cos(rlat1)*math.cos(rlat2)*math.sin(difflon/2)*math.sin(difflon/2)))
	return d


# iterate over all the rows and get these values: number of earthquakes, average magnitude, average depth, highest magnitude, lowest magnitude
def get_earthquake_stats(address_lat, address_lng, predicted_magnitude):
	# init num earthquakes
	num_earthquakes = 0
	# init average magnitude
	avg_magnitude = 0
	# init average depth
	avg_depth = 0
	# init highest magnitude
	highest_magnitude = 0
	# init lowest magnitude
	lowest_magnitude = 100000

	# iterate over all the rows
	for index, row in quake_data.iterrows():
		# get latitude and longitude 
		lat = row['latitude']
		lng = row['longitude']

		# get distance between the two points
		distance = haversine_distance((float(lat), float(lng)), (float(address_lat), float(address_lng)))

		if (distance > prediction_scales[predicted_magnitude]):
			continue

		# increment num earthquakes
		num_earthquakes += 1
		# add magnitude to avg magnitude
		avg_magnitude += row['mag']
		# add depth to avg depth
		avg_depth += row['depth']
		# check if highest magnitude
		if (row['mag'] > highest_magnitude):
			highest_magnitude = row['mag']
		# check if lowest magnitude
		if (row['mag'] < lowest_magnitude):
			lowest_magnitude = row['mag']
	
	data = {}
	if (num_earthquakes != 0):
		data['num_earthquakes'] = num_earthquakes
		data['avg_magnitude'] = avg_magnitude / num_earthquakes
		data['avg_depth'] = avg_depth / num_earthquakes
		data['highest_magnitude'] = highest_magnitude
		data['lowest_magnitude'] = lowest_magnitude
	else:
		data['num_earthquakes'] = 0
		data['avg_magnitude'] = 0
		data['avg_depth'] = 0
		data['highest_magnitude'] = 0
		data['lowest_magnitude'] = 0
	
	return data


# Create flask app
app = Flask(__name__)
CORS(app)

print("Created Flask App")

prediction_scales = { 1: 1000, 2: 1000, 3: 1000, 4: 1000, 5: 3000, 6: 10000, 7: 30000, 8: 50000, 9: 100000 }

# create api route
@app.route("/api", methods=['POST'])
def api_microservice():
	print("API Request Received")
	# get the data from the POST request.
	data = request.get_json()
	city = data["city"]
	province = data["region"]
	country = data["country"]
	extended = data["extended"]

	# get the lat and long
	lat_long = get_lat_long(city, province, country)
	lat_long_ml_input = [[lat_long['lat'], lat_long['lng']]]   

	# get predicted next earthquake magnitude
	quake_prediction = quake_model.predict(lat_long_ml_input)[0]
	# get earthquake stats
	print(quake_prediction)
	
	recv_data = {}
	if extended == True:
		recv_data = get_earthquake_stats(lat_long['lat'], lat_long['lng'], round(quake_prediction))
	# return the data
	recv_data['predicted_magnitude'] = round(quake_prediction)
	recv_data['lng'] = lat_long['lng']
	recv_data['lat'] = lat_long['lat']
	# return json data
	return jsonify(recv_data)

# run the app
if __name__ == "__main__":
	print("Starting Flask Server")
	app.run(port=8000)
	print("Flask Server Running")
