########################################################################################################################
# populate_authentication_data.py
# This file contains the functions to populate the AuthenticationData table in the database
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Noah Subedar [https://github.com/noahsub]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker

from database.Constants.connection_constants import PrivilegeType
from database.Entities.authentication_data import AuthenticationData
from database.Entities.authentication_data import BASE
from database.Entities.database_connection import DatabaseConnection
from database.Warnings.database_warnings import already_exists_warning

########################################################################################################################
# GLOBALS
########################################################################################################################

# The database connection
DATABASE = DatabaseConnection(database_name="NBCC-2020")


########################################################################################################################
# DATABASE FUNCTIONS
########################################################################################################################


def create_authentication_data_table():
    """
    Creates the CanadianPostalCodeData table
    :return: None
    """
    # Get the engine
    engine = DATABASE.get_engine(privilege=PrivilegeType.ADMIN)

    # Name of the table
    table_name = "AuthenticationData"
    inspector = inspect(engine)
    # If the table already exists, we don't want to create it again

    if table_name in inspector.get_table_names():
        already_exists_warning(item=table_name, database_name=DATABASE.database_name)
        return

    # Otherwise, we create the table
    else:
        BASE.metadata.bind = engine
        BASE.metadata.create_all(bind=engine)


def clean_authentication_data_table():
    """
    Cleans the ClimaticData table
    :return: None
    """
    # Get the connection and cursor
    connection = DATABASE.get_connection(privilege=PrivilegeType.ADMIN)
    cursor = DATABASE.get_cursor(connection)
    # Delete all entries in the table
    cursor.execute('DELETE FROM "AuthenticationData";')
    # Commit the changes
    connection.commit()


def add_entry(authentication_data: AuthenticationData):
    """
    Adds an entry to the AuthenticationData table
    :param authentication_data: The AuthenticationData object
    :return: None
    """
    # Connect to the database
    new_connection = DatabaseConnection(database_name="NBCC-2020")
    engine = new_connection.get_engine(privilege=PrivilegeType.ADMIN)
    session = sessionmaker(autocommit=False, autoflush=True, bind=engine)
    controller = session()
    # Add the entry
    controller.add(authentication_data)
    # Commit the changes
    controller.commit()
    # Close the connection
    new_connection.close()


########################################################################################################################
# MAIN
########################################################################################################################

# ONLY RUN IF DATABASE NEEDS TO BE REPOPULATED
def main():
    print(
        "WARNING: This script will repopulate the AuthenticationData table. THIS WILL DELETE ALL USERS AND RENDER THEM UNRECOVERABLE."
    )
    choice = input("Are you sure you want to continue? (y/n): ")
    if choice.lower() == "y":
        create_authentication_data_table()
        clean_authentication_data_table()
        DATABASE.close()
    else:
        exit(0)

if __name__ == "__main__":
    main()

