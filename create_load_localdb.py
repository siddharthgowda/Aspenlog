########################################################################################################################
#create_load_localdb.py
# When deploying the backend locally, first run this script to create a local version
# of the db and populate tables
# You MUST connect to the default database before creating the new database
# SHOULD BE USED FOR LOCAL USE ONLY!!!!! DO NOT RUN THIS WHEN TRYING TO SET UP A REMOTE SERVER
# FOR REMOTE SERVER RUN linx_run_backend.sh TO CREATE POSTRESS DB ON A DOCKER IMAGE
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from dotenv import load_dotenv
from config import get_file_path
from sqlalchemy.sql import text
import os
from database.Population import populate_authentication_data
from database.Population import populate_canadian_postal_code_data
from database.Population import populate_climate_data
from database.Population import populate_save_data
from database.Population import populate_wind_speed_data
########################################################################################################################

#Load environment variables
load_dotenv(get_file_path("database/.env"))

# Create a connection URL for the default PostgreSQL database
default_url = URL.create(
    drivername="postgresql",
    username=os.getenv("ADMIN_USERNAME"),  # Use environment variables
    password=os.getenv("ADMIN_PASSWORD"),  # Use environment variables
    host=os.getenv("HOST"),
    port=os.getenv("PORT"),
    database="postgres"  # Connect to the default 'postgres' database
)

print(default_url)
# Create an engine for the default database
default_engine = create_engine(default_url)
db_name = "NBCC-2020"

# Connect to the default database
with default_engine.connect() as default_conn:
    # Disable autocommit
    default_conn.execution_options(isolation_level="AUTOCOMMIT")
    
    # Create the new database
    db_name_creation = f'"{db_name}"'
    default_conn.execute(text(f"DROP DATABASE IF EXISTS {db_name_creation} WITH (FORCE)"))
    default_conn.execute(text(f"CREATE DATABASE {db_name_creation}"))
    print(f"Database '{db_name_creation}' created successfully. Will wait some time before connecting")

    #time.sleep(30)  # Use time.sleep instead of sleep

# Create a new URL for the newly created database
new_url = URL.create(
    drivername="postgresql",
    username=os.getenv("ADMIN_USERNAME"),
    password=os.getenv("ADMIN_PASSWORD"),
    host=os.getenv("HOST"),
    port=os.getenv("PORT"),
    database=db_name
)

# Create an engine for the new database
new_engine = create_engine(new_url)

# Test the connection to the new database
try:
    with new_engine.connect() as conn:
        print(f"Successfully connected to the new database '{db_name}'.")
except Exception as e:
    print(f"Error connecting to the new database: {e}")


# POPULATING THE DB
try:
    populate_authentication_data.main()
    populate_canadian_postal_code_data.main()
    populate_climate_data.main()
    populate_save_data.main()
    populate_wind_speed_data.main()
except Exception as e:
    print(f"Error populating the new database: {e}")