########################################################################################################################
# loads_inputs.py
# This file contains the input model for the mLoadsInput object.
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from typing import Optional

from pydantic import BaseModel

########################################################################################################################
# MODEL
########################################################################################################################


class LoadsInput(BaseModel):
    """
    The input model for the wind load object
    """

    # The dead coef
    dead_coef: Optional[float]
    

    # The live coef
    live_coef: Optional[float]

    # The wind coef
    wind_coef: Optional[float]

    # wind face, windward, leeward, side_walls
    wind_face: Optional[str]

    # The snow coef
    snow_coef: Optional[float]

    # The siesmic coef
    seismic_coef: Optional[float]
    
    # is it ULS or SLS
    uls_or_sls: Optional[str]



