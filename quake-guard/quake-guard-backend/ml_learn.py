
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
import pickle
# TODO: Create the Cloud in the first place
### START CREATING ML MODEL
# save filepath to variable for easier access
quake_data_file = 'silver.csv'
# read the data and store data in DataFrame titled melbourne_data
quake_data = pd.read_csv(quake_data_file)
# Set y value as magnitude
y = quake_data.mag
quake_data_features = ['latitude', 'longitude']
X = quake_data[quake_data_features]
# print description or statistics from X
# Define model. Specify a number for random_state to ensure same results each run
quake_model = DecisionTreeRegressor(random_state=1)
# Fit model
quake_model.fit(X, y)
#
filename = 'finalized_model.sav'
pickle.dump(quake_model, open(filename, 'wb'))