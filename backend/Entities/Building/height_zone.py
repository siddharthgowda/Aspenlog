########################################################################################################################
# height_zone.py
# This file contains classes that represent the height zones of a building.
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Noah Subedar [https://github.com/noahsub]
# Edited by: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from typing import Optional
from backend.Entities.Seismic.seismic_load import SeismicLoad
from backend.Entities.Wind.wind_load import WindLoad
from backend.Entities.Wind.main_structure_wind_factor import MainStructureWindFactor


########################################################################################################################
# MAIN CLASS
########################################################################################################################


class HeightZone:
    """
    Represents a height zone of a building
    """

    # Number of the height zone
    zone_num: int
    # Elevation of the height zone
    elevation: float
    # NOTE: this wind_load and seismic_load are for wall cladding only
    # the names and attributes have been kept for legacy purposes only
    wind_load: Optional[WindLoad]
    seismic_load: Optional[SeismicLoad]
    wp: Optional[float]
    main_structure_wind_factor: Optional[MainStructureWindFactor]

    def __init__(self, zone_num: int, elevation: float):
        self.zone_num = zone_num
        self.elevation = elevation
        self.wind_load = None
        self.seismic_load = None
        self.wp = None
        self.main_structure_wind_factor = None

    def __str__(self):
        """
        String representation of the HeightZone class
        :return:
        """
        # Print each attribute and its value on a new line
        return (
            f"zone_num: {self.zone_num}\n,"
            f"elevation: {self.elevation}\n"
            f"wind_load: {str(self.wind_load)}\n"
            f"seismic_load: {str(self.seismic_load)}\n"
            f"wp: {self.wp}\n"
            f"main_structure_wind_factor: {str(self.main_structure_wind_factor)}\n"
        )

    def __repr__(self):
        """
        String representation of the HeightZone class
        :return:
        """
        # Print each attribute and its value on a new line
        return (
            f"zone_num: {self.zone_num}\n,"
            f"elevation: {self.elevation}\n"
            f"wind_load: {str(self.wind_load)}\n"
            f"seismic_load: {str(self.seismic_load)}\n"
            f"wp: {self.wp}\n"
            f"main_structure_wind_factor: {str(self.main_structure_wind_factor)}\n"
        )
