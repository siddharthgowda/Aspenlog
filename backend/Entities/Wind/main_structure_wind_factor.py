########################################################################################################################
# wind_factor.py
# This file contains classes that represent the wind factor for the main structure.
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

########################################################################################################################
# MAIN CLASS
########################################################################################################################


class MainStructureWindFactor:
    """
    This class stores wind factor information for a structure.
    """
    
    # Topographic factor
    ct: Optional[float]
    # Exposure factor
    # (windward = Ce(elevation of height zone), leeward =  Ce(H/2), side walls Ce(H))

    ce_windward = Optional[float]
    ce_leeward = Optional[float]
    ce_side_walls = Optional[float]

    # pressure factor
    # (windward, leeward, side walls = -0.7)
    cp_windward: Optional[float]
    cp_leeward: Optional[float]
    cp_side_walls: Optional[float]

    # Gust factor 
    cg_uls: Optional[float]
    cg_sls: Optional[float]

    # wind pressure
    p_windward_uls = Optional[float]
    p_windward_sls = Optional[float]

    p_leeward_uls = Optional[float]
    p_leeward_sls = Optional[float]

    p_side_walls_uls = Optional[float]
    p_side_walls_sls = Optional[float]

    def __init__(self):
        """
        Initializes the wind factor attributes.
        """
        # Topographic factor
        self.ct: Optional[float] = None

        # Exposure factors
        self.ce_windward: Optional[float] = None
        self.ce_leeward: Optional[float] = None
        self.ce_side_walls: Optional[float] = None

        # Pressure factors
        self.cp_windward: Optional[float] = None
        self.cp_leeward: Optional[float] = None
        self.cp_side_walls: Optional[float] = None

        # Gust factors
        self.cg_uls: Optional[float] = None
        self.cg_sls: Optional[float] = None

        # Wind pressure values
        self.p_windward_uls: Optional[float] = None
        self.p_windward_sls: Optional[float] = None
        self.p_leeward_uls: Optional[float] = None
        self.p_leeward_sls: Optional[float] = None
        self.p_side_walls_uls: Optional[float] = None
        self.p_side_walls_sls: Optional[float] = None

    def __str__(self):
        """
        Returns a string representation of the wind factor object.
        """
        return (
            f"Topographic Factor (ct): {self.ct}\n"
            f"Exposure Factors - Windward: {self.ce_windward}, Leeward: {self.ce_leeward}, Side Walls: {self.ce_side_walls}\n"
            f"Gust Factors - ULS: {self.cg_uls}, SLS: {self.cg_sls}\n"
            f"Pressure Factors - Windward: {self.cp_windward}, Leeward: {self.cp_leeward}, Side Walls: {self.cp_side_walls}\n"
            f"Wind Pressure (ULS) - Windward: {self.p_windward_uls}, Leeward: {self.p_leeward_uls}, Side Walls: {self.p_side_walls_uls}\n"
            f"Wind Pressure (SLS) - Windward: {self.p_windward_sls}, Leeward: {self.p_leeward_sls}, Side Walls: {self.p_side_walls_sls}"
        )
