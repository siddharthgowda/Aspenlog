########################################################################################################################
# natural_frequency_input.py
# This file contains the input model for the natural frequency object.
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from pydantic import BaseModel


########################################################################################################################
# MODEL
########################################################################################################################


class NaturalFrequencyInput(BaseModel):
    """
    The input model for the natural frequency
    """

    # The natural frequency
    frequency: float
