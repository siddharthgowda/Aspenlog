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

from backend.Entities.Wind.main_structure_wind_factor import MainStructureWindFactor
from backend.Constants.materials import Materials
from backend.algorithms.load_combination_algorithms import (calculate_dead_load, 
                                                              calculate_live_load, 
                                                              calculate_wind_load)


########################################################################################################################
# MANAGER
########################################################################################################################


def process_main_structure_loads(
    reference_height: float,
    width: float,
    material_load: float,
    wind_factor: MainStructureWindFactor,
    wind_face: str,
    uls_or_sls: str,
    dead_coef: float,
    live_coef: float,
    wind_load_coef: float
) -> float:
    """
    Processes the main structure loads for a building based on input parameters.

    This function calculates the total load on a structure by combining dead, live, 
    and wind loads using the specified coefficients for ULS (Ultimate Limit State) 
    or SLS (Serviceability Limit State). The wind load is calculated based on 
    dynamic pressures for different faces of the structure.

    Args:
        reference_height (float): The height of the structure being analyzed (m).
        width (float): The width of the structure perpendicular to the wind (m).
        material load (float): dead load of height zone
        wind_factor (MainStructureWindFactor): Wind factor object containing dynamic pressure values.
        wind_face (str): The face of the structure being analyzed ("W" for Windward, "L" for Leeward, "S" for Side Walls).
        uls_or_sls (str): The load type being analyzed ("U" for ULS, "S" for SLS).
        dead_coef (float): Coefficient for dead load in the load combination.
        live_coef (float): Coefficient for live load in the load combination.
        wind_load_coef (float): Coefficient for wind load in the load combination.

    Returns:
        Loads: An object representing the total combined loads on the structure.

    Raises:
        ValueError: If invalid `wind_face` or `uls_or_sls` values are provided.
    
    Example Usage:
        >>> process_main_structure_loads(
                reference_height=10.0,
                width=20.0,
                material_load=10,
                wind_factor=wind_factor_object,
                wind_face="W",
                uls_or_sls="U",
                dead_coef=1.25,
                live_coef=1.5,
                wind_load_coef=0.4
            )
    """

    # Initialize dynamic pressure dictionary
    dynamic_pressure_dict = {
        "W": {"U": wind_factor.p_windward_uls, "S": wind_factor.p_windward_sls},
        "L": {"U": wind_factor.p_leeward_uls, "S": wind_factor.p_leeward_sls},
        "S": {"U": wind_factor.p_side_walls_uls, "S": wind_factor.p_side_walls_sls},
    }

    # Validate inputs for wind_face and uls_or_sls
    if wind_face[0].capitalize() not in dynamic_pressure_dict:
        raise ValueError(f"[ERROR] Invalid wind face '{wind_face}'. Must be one of ['W', 'L', 'S'].\n")
    
    if uls_or_sls[0].capitalize() not in ["U", "S"]:
        raise ValueError(f"[ERROR] Invalid load type '{uls_or_sls}'. Must be 'U' (ULS) or 'S' (SLS).\n")


    # Calculate dynamic pressure based on inputs
    dynamic_pressure = dynamic_pressure_dict[wind_face[0].capitalize()][uls_or_sls[0].capitalize()]
    

    # Calculate individual loads
    wind_load = calculate_wind_load(width, reference_height, dynamic_pressure)
    


    dead_load = material_load
    


    live_load = calculate_live_load(width, reference_height)
    

    # Combine loads using coefficients
    total_combined_load = (
        wind_load_coef * wind_load +
        dead_coef * dead_load +
        live_coef * live_load
    )


    # Return total combined loads as a Loads object
    return total_combined_load