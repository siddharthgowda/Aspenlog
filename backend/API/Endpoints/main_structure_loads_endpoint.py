########################################################################################################################
# get_loads.py
# This file contains the endpoints used get_main_structure_loads building. 
# It includes the following
# endpoints:
#   - /get_main_structure_loads: POST the loads for the main_structure of the building
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
from backend.API.Managers.main_structure_loads_manager import process_main_structure_loads
from backend.API.Managers.user_data_manager import (
    check_user_exists,
    get_user_building,
    get_user_dimensions,
    get_user_material_type,
)
from backend.API.Models.loads_inputs import LoadsInput

########################################################################################################################
# ROUTER
########################################################################################################################

main_structure_loads_router = APIRouter()


########################################################################################################################
# ENDPOINTS
########################################################################################################################


@main_structure_loads_router.post("/calculate_main_structure_loads")
def get_loads(
    loads_input: LoadsInput,
    username: str = Depends(decode_token),
):
    """
    Calculates the load float for the main structure.

    Parameters:
        loads_input (LoadsInput): The input data required for load calculation.
        username (str): The username of the user (decoded from the token).

    Returns:
        List[float]: A list of load float for different height zones.
    """
    try:

        # Ensure user exists in memory
        check_user_exists(username)

        # Fetch required data from user storage
        building = get_user_building(username=username)

        height_zones = building.height_zones

        dimensions = get_user_dimensions(username=username)

        response = []
        
        # Process each height zone
        for idx, zone in enumerate(height_zones):

            loads = process_main_structure_loads(
                zone.elevation,
                dimensions.width,
                zone.wp,
                zone.main_structure_wind_factor,
                loads_input.wind_face,
                loads_input.uls_or_sls,
                loads_input.dead_coef,
                loads_input.live_coef,
                loads_input.wind_coef
            )

            
            response.append(loads)

        return response

    except Exception as e:
        # Debugging: Exception handling
        print("❌ ERROR: Exception occurred while calculating main structure load combinations.\n")
        print(f"Error Details: {str(e)}\n")
        
        # Raise HTTPException with detailed error message
        raise HTTPException(status_code=500, detail=str(e))

