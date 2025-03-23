########################################################################################################################
# main_structure_wind_factor_manager.py
# This file calculates the main structure wind factors for a given height zone (i.e. the wind pressure values)
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Siddharth Gowda [https://github.com/siddharthgowda]
########################################################################################################################

########################################################################################################################
# IMPORTS
########################################################################################################################

from backend.Entities.Building.height_zone import HeightZone
from backend.Entities.Building.dimensions import Dimensions
from backend.Entities.Wind.main_structure_wind_factor import MainStructureWindFactor
from backend.Constants.wind_constants import WindExposureFactorSelections
from backend.Constants.wind_constants import WindFaceConstants
from backend.Constants.materials import Materials
from backend.Constants.importance_factor_constants import ImportanceFactor
from backend.Constants.load_constants import LoadTypes
from backend.algorithms.main_structure.wind_load_algorithims import (get_exposure_factor, 
                                                                     get_pressure_coefficient,
                                                                     calculate_cg_dynamic,
                                                                     calculate_external_pressure)


########################################################################################################################
# MANAGER
########################################################################################################################


def process_main_structure_wind_factors(
    height_zone: HeightZone, 
    dimensions: Dimensions, 
    natural_frequency: float,
    material: Materials, 
    ct: float, 
    exposure_factor: WindExposureFactorSelections, 
    cei: int, 
    wind_velocity_pressure: float, 
    importance_category: ImportanceFactor
) -> MainStructureWindFactor:
    """
    Processes and calculates the wind factors for the main structure based on various input parameters.

    Parameters:
        height_zone (HeightZone): The height zone information.
        dimensions (Dimensions): The structure's dimensions.
        natural_frequency (float): The natural frequency of the structure.
        material (Materials): The material properties.
        ct (float): The topographic factor.
        exposure_factor (WindExposureFactorSelections): The exposure factor category.
        cei (int): Intermediate exposure factor value.
        wind_velocity_pressure (float): The wind velocity pressure.
        importance_category (ImportanceFactor): The importance factor category.

    Returns:
        MainStructureWindFactor: Computed wind factor values for the structure.
    """

    # Debugging: Print all arguments

    # Constants
    uls_Iw = ImportanceFactor.get_importance_factor_uls(importance_category, LoadTypes.WIND)
    sls_Iw = ImportanceFactor.get_importance_factor_sls(importance_category, LoadTypes.WIND)
    Ce_H = get_exposure_factor(dimensions.height, exposure_factor) if exposure_factor != WindExposureFactorSelections.INTERMEDIATE else cei

    wind_factor = MainStructureWindFactor()
    wind_factor.ct = ct

    # Ce
    if exposure_factor == WindExposureFactorSelections.INTERMEDIATE:
        assert cei is not None, "CEI value must be provided for INTERMEDIATE category"
        wind_factor.ce_windward = cei
        wind_factor.ce_leeward = cei
        wind_factor.ce_side_walls = cei
    else:
        wind_factor.ce_windward = get_exposure_factor(height_zone.elevation, exposure_factor)
        wind_factor.ce_leeward = get_exposure_factor(dimensions.height / 2, exposure_factor)
        wind_factor.ce_side_walls = Ce_H
    
    # Cp
    wind_factor.cp_windward = get_pressure_coefficient(
        dimensions.height, dimensions.width_along, WindFaceConstants.WINDWARD_FACE
    )
    wind_factor.cp_leeward = get_pressure_coefficient(
        dimensions.height, dimensions.width_along, WindFaceConstants.LEWARD_FACE
    )
    wind_factor.cp_side_walls = get_pressure_coefficient(
        dimensions.height, dimensions.width_along, WindFaceConstants.WALLS_PARALLEL_TO_WIND
    )

    # Cg
    wind_factor.cg_uls = calculate_cg_dynamic(
        dimensions.height, dimensions.width_across, natural_frequency, material,
        Ce_H,
        wind_velocity_pressure, uls_Iw, exposure_factor
    )
    wind_factor.cg_sls = calculate_cg_dynamic(
        dimensions.height, dimensions.width_across, natural_frequency, material,
        Ce_H,
        wind_velocity_pressure, sls_Iw, exposure_factor
    )

    # p (Wind Pressure)
    wind_factor.p_windward_uls = calculate_external_pressure(
        uls_Iw, wind_velocity_pressure, wind_factor.ce_windward, 
        ct, wind_factor.cg_uls, wind_factor.cp_windward
    )
    wind_factor.p_leeward_uls = calculate_external_pressure(
        uls_Iw, wind_velocity_pressure, wind_factor.ce_leeward, 
        ct, wind_factor.cg_uls, wind_factor.cp_leeward
    )
    wind_factor.p_side_walls_uls = calculate_external_pressure(
        uls_Iw, wind_velocity_pressure, wind_factor.ce_side_walls, 
        ct, wind_factor.cg_uls, wind_factor.cp_side_walls
    )

    wind_factor.p_windward_sls = calculate_external_pressure(
        sls_Iw, wind_velocity_pressure, wind_factor.ce_windward, 
        ct, wind_factor.cg_uls, wind_factor.cp_windward
    )
    wind_factor.p_leeward_sls = calculate_external_pressure(
        sls_Iw, wind_velocity_pressure, wind_factor.ce_leeward, 
        ct, wind_factor.cg_uls, wind_factor.cp_leeward
    )
    wind_factor.p_side_walls_sls = calculate_external_pressure(
        sls_Iw, wind_velocity_pressure, wind_factor.ce_side_walls, 
        ct, wind_factor.cg_uls, wind_factor.cp_side_walls
    )

    height_zone.main_structure_wind_factor = wind_factor

    return wind_factor
