########################################################################################################################
# main_structure_wind_factor_input.py
# This file contains the input model for the main structure wind factor object.
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


class MainStructureWindFactorInput(BaseModel):
    """
    The input model for the wind load object
    """

    # The topographic factor
    ct: float
    # The exposure factor
    exposure_factor: str
    # The manual exposure factor for intermediate exposure
    manual_ce_cei: Optional[float]
