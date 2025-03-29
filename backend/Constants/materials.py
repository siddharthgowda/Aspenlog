########################################################################################################################
# materials.py
# This file contains the constants and enums pertaining to materials
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Noah Subedar [https://github.com/noahsub] & Siddharth Gowda [https://github.com/siddharthgowda]
# Last edited by: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from enum import Enum


########################################################################################################################
# ENUMS
########################################################################################################################


class Materials(Enum):
    """
    Enum for the materials
    """

    GLASS = "GLASS"
    GRANITE = "GRANITE"
    SANDSTONE = "SANDSTONE"
    STEEL = "STEEL"
    OTHER = "OTHER"
    CONCRETE = "CONCRETE"
    COMPOSITE = "COMPOSITE"

    @classmethod
    def get_materials_list(cls):
        """
        Gets a list of the materials
        :return: A list of the materials according to their name rather than value
        """
        materials_list = []
        for material in cls:
            materials_list.append(material.name)
        return materials_list
    
    @classmethod
    def get_density(self, material):
        
        match material:
            case self.CONCRETE:
                return 2400 #kg/m^3
            case self.STEEL:
                return 7930
            case self.COMPOSITE:
                return (2400 + 7930) / 2
        
            

