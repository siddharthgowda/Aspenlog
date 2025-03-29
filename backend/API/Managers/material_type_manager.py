########################################################################################################################
# material_type_manager.py
# This file manages the processing of importance category data.
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from backend.Constants.materials import Materials


########################################################################################################################
# MANAGER
########################################################################################################################


def process_material_type_data(material_type: str):
    """
    Processes the material type data and returns the importance factor
    :param importance_category: The material type as a string
    :return: The importance factor enum
    """
    match material_type:
        case "STEEL":
            return Materials.STEEL
        case "CONCRETE":
            return Materials.CONCRETE
        case "COMPOSITE":
            return Materials.COMPOSITE
