########################################################################################################################
# calculate_main_structure_wind_factor.py
# This file contains the endpoints used for the natural frequency of the building. 
# It includes the following
# endpoints:
#   - /natural_frequency: POST request to set the natural frequency for a user
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################
from fastapi import APIRouter, Depends, HTTPException

from backend.API.Managers.authentication_manager import decode_token
from backend.API.Managers.user_data_manager import (
    check_user_exists,
    get_user_building,
    get_user_dimensions,
    get_user_natural_frequency,
    get_user_material_type,
    get_user_importance_category,
    get_user_location
)
from backend.API.Managers.main_structure_wind_factor_manager import process_main_structure_wind_factors
from backend.API.Models.main_structure_wind_factor_input import MainStructureWindFactorInput

from backend.Constants.wind_constants import WindExposureFactorSelections

########################################################################################################################
# ROUTER
########################################################################################################################

calculate_main_structure_wind_factor_router = APIRouter()


########################################################################################################################
# ENDPOINTS
########################################################################################################################


@calculate_main_structure_wind_factor_router.post("/calculate_main_structure_wind_factor")
def calculate_main_structure_wind_factor(
    wind_factor_inputs: MainStructureWindFactorInput,
    username: str = Depends(decode_token),
):
    """
    Calculates the wind factor for the main structure.

    Parameters:
        wind_factor_inputs (MainStructureWindFactorInput): The input data required for wind factor calculation.
        username (str): The username of the user (decoded from the token).

    Returns:
        List[MainStructureWindFactor]: A list of wind factor objects for different height zones.
    """
    try:
        # Ensure user exists in memory
        check_user_exists(username)

        # Fetch required data from user storage
        building = get_user_building(username=username)

        height_zones = building.height_zones

        dimensions = get_user_dimensions(username=username)

        natural_frequency = get_user_natural_frequency(username=username)

        material = get_user_material_type(username=username)

        importance_category = get_user_importance_category(username=username)

        location = get_user_location(username=username)

        # Convert exposure factor input
        exposure_factor = WindExposureFactorSelections(wind_factor_inputs.exposure_factor)

        response = []
        for idx, zone in enumerate(height_zones):
            wind_factor = process_main_structure_wind_factors(
                zone,
                dimensions,
                natural_frequency,
                material,
                wind_factor_inputs.ct,
                exposure_factor,
                wind_factor_inputs.manual_ce_cei,
                location.wind_velocity_pressure,
                importance_category
            )

            response.append(wind_factor)
        
        return response

    except Exception as e:
        print("❌ ERROR: Exception occurred while calculating wind factor.")
        print(f"Error Details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
