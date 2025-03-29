########################################################################################################################
# natural_frequency_endpoint.py
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
    set_user_natural_frequency,
)
from backend.API.Models.natural_frequency_input import NaturalFrequencyInput

########################################################################################################################
# ROUTER
########################################################################################################################

natural_frequency_endpoint_router = APIRouter()


########################################################################################################################
# ENDPOINTS
########################################################################################################################


@natural_frequency_endpoint_router.post("/natural_frequency")
def natural_frequency_endpoint(
    natural_frequency_input: NaturalFrequencyInput,
    username: str = Depends(decode_token),
):
    """
    Sets the natural frequency for a user
    :param natural_frequency_input: The input data for the natural frequency of the building
    :param username: The username of the user
    :return: The natural frequency object set by the user
    """
    try:
        # If storage for the user does not exist in memory, create a slot for the user
        check_user_exists(username)
        # Process the natural frequency data and create an natural frequency object
        natural_frequency = natural_frequency_input.frequency
        assert(natural_frequency is not None)
        # Store the natural frequency object in the user's memory slot
        set_user_natural_frequency(
            username=username, natural_frequency=natural_frequency
        )
        # Return the natural frequency object
        return natural_frequency
    # If something goes wrong, raise an error
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
