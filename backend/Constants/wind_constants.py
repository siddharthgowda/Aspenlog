########################################################################################################################
# wind_constants.py
# This file contains the constants and enums pertaining to wind
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Noah Subedar [https://github.com/noahsub]
# Edite by: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from enum import Enum

########################################################################################################################
# CONSTANTS
########################################################################################################################

# The wind gust factor
GUST_FACTOR = 2.5
INTERNAL_GUST_EFFECT_FACTOR = 2

########################################################################################################################
# ENUMS
########################################################################################################################


class WindExposureFactorSelections(Enum):
    """
    Enum for the wind exposure factor selections
    """

    OPEN: str = "open"
    ROUGH: str = "rough"
    INTERMEDIATE: str = "intermediate"


class InternalPressureSelections(Enum):
    """
    Enum for the internal pressure selections
    """

    ENCLOSED: str = "enclosed"
    PARTIALLY_ENCLOSED: str = "partially_enclosed"
    LARGE_OPENINGS: str = "large_openings"

class WindFaceConstants(Enum):
    """
    Enum for width of building compared to direction of wind
    """

    WINDWARD_FACE: str = "Windward Face"
    LEEWARD_FACE: str = "Leeward Face"
    WALLS_PARALLEL_TO_WIND: str = "Walls Parallel to Wind Direction"
