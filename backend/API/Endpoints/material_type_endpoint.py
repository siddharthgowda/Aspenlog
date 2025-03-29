########################################################################################################################
# material_type_endpoint.py
# This file contains the endpoints used for the material type for the building (typically steel, concrete, or compoisite). 
# It includes the following
# endpoints:
#   - /material_type: POST request to set the material type for a user
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
from backend.API.Managers.material_type_manager import (
    process_material_type_data,
)
from backend.API.Managers.user_data_manager import (
    check_user_exists,
    set_user_material_type,
)
from backend.API.Models.material_input import MaterialTypeInput

########################################################################################################################
# ROUTER
########################################################################################################################

material_type_endpoint_router = APIRouter()


########################################################################################################################
# ENDPOINTS
########################################################################################################################


@material_type_endpoint_router.post("/material_type")
def material_type_endpoint(
    material_type_input: MaterialTypeInput,
    username: str = Depends(decode_token),
):
    """
    Sets the material type for a user
    :param material_type_input: The input data for the material type of the building
    :param username: The username of the user
    :return: The material type object set by the user
    """
    try:
        # If storage for the user does not exist in memory, create a slot for the user
        check_user_exists(username)
        # Process the material type data and create an material type object
        material_type = process_material_type_data(
            material_type_input.material_type
        )
        assert(material_type is not None)
        # Store the material type object in the user's memory slot
        set_user_material_type(
            username=username, material_type=material_type
        )
        # Return the material type object
        return material_type
    # If something goes wrong, raise an error
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
