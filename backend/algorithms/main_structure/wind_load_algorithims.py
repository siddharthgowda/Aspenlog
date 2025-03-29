########################################################################################################################
# main_structure/wind_load_algorithms.py
# This file contains the algorithms for calculating wind loads for main structure
#
# Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
# By using this code, you agree to abide by the terms and conditions in those files.
#
# Author: Siddharth Gowda [https://github.com/siddharthgowda] and Asim Ahmad
########################################################################################################################

import math
from scipy.integrate import quad
from backend.Constants.wind_constants import (WindExposureFactorSelections, WindFaceConstants)
from backend.Constants.materials import Materials

# Constants
# 3600s
T_CONST = 3600
# air densitykg/m3
ρ_CONST = 1.2929

def get_exposure_factor(reference_height, terrain_type: WindExposureFactorSelections, value = None) -> float:
    """
    Calculate and return the Exposure Factor (Ce).

    Parameters:
        reference_height (float): Reference height of the building in meters.
        terrain_type (WindExposureFactorSelections): Terrain type ('open' or 'rough', "intermediate).
        value (Optional[float]): custom value of Ce (only exists when intermediate)

    Returns:
        float: Calculated Exposure Factor (Ce).
    """
    Ce = None
    if terrain_type == WindExposureFactorSelections.OPEN:
        Ce = (reference_height / 10) ** 0.28
        Ce = max(1.0, min(Ce, 2.5))
    elif  terrain_type == WindExposureFactorSelections.ROUGH:  # rough terrain
        Ce = 0.5 * (reference_height / 12.7) ** 0.50
        Ce = max(0.5, min(Ce, 2.5))
    elif terrain_type == WindExposureFactorSelections.INTERMEDIATE:
        assert(value is not None)
        return value
    else:
        raise ValueError("Invalid Ce terrian type.")
    return Ce

# NOTE: this function isn't needed since ct is a user input, put will be put just in case future changes
# are made to include this.
def get_topographic_factor(hill_height, hill_length, x_distance, z_height, hill_type):
    """
    Calculate and return the Topographic Factor (Ct).

    Parameters:
        hill_height (float): Height of the hill/escarpment in meters.
        hill_length (float): Horizontal distance upwind in meters.
        x_distance (float): Horizontal distance from peak in meters.
        z_height (float): Height above ground level in meters.
        hill_type (str): Type of hill ('2D Hill', '2D Escarpment', '3D Axi-symmetric Hill').

    Returns:
        float: Calculated Topographic Factor (Ct).
    """
    if hill_type == '2D Hill':
        ΔS_max = (2.2 * hill_height) / hill_length
        alpha = 3
        k_x_negative = 1.5
        k_x_positive = 1.5
    elif hill_type == '2D Escarpment':
        ΔS_max = (1.3 * hill_height) / hill_length
        alpha = 2.5
        k_x_negative = 1.5
        k_x_positive = 4
    elif hill_type == '3D Axi-symmetric Hill':
        ΔS_max = (1.6 * hill_height) / hill_length
        alpha = 4
        k_x_negative = 1.5
        k_x_positive = 1.5
    else:
        raise ValueError("Invalid hill type.")

    k = k_x_negative if x_distance < 0 else k_x_positive
    ΔS = ΔS_max * (1 - (abs(x_distance) / (k * hill_length))) * math.exp(-alpha * z_height / hill_length)
    Ct = (1 + (ΔS / 1.0)) * (1 + ΔS)
    return Ct

def get_pressure_coefficient(H, D, face_choice: WindFaceConstants):
    """
    Calculate external pressure coefficient (Cp).

    Parameters:
        H (float): Height of the building in meters.
        D (float): Width of the building parallel to wind direction in meters.
        face_choice (WindFaceConstants): Location on the building ('Windward Face', 'Leeward Face', 'Walls Parallel to Wind Direction').

    Returns:
        float: Calculated External Pressure Coefficient (Cp).
    """
    H_D_ratio = H / D
    Cp = None

    if face_choice == WindFaceConstants.WINDWARD_FACE:
        if H_D_ratio < 0.25:
            Cp = 0.6
        elif 0.25 <= H_D_ratio < 1.0:
            Cp = 0.27 * (H_D_ratio + 2)
        else:  # H/D ≥ 1.0
            Cp = 0.8
    elif face_choice == WindFaceConstants.LEEWARD_FACE:
        if H_D_ratio < 0.25:
            Cp = -0.3
        elif 0.25 <= H_D_ratio < 1.0:
            Cp = -0.27 * (H_D_ratio + 0.88)
        else:  # H/D ≥ 1.0
            Cp = -0.5
    elif face_choice == WindFaceConstants.WALLS_PARALLEL_TO_WIND:
        Cp = -0.7
    else:
        raise ValueError("Invalid face choice.")

    return Cp


# Background Turbulence Factor (B) integral function (NBCC Commentary I)
def integrand(x, H, w):
    term1 = 1 / (1 + (x * H / 457))
    term2 = 1 / (1 + (x * w / 122))
    term3 = x / ((1 + x ** 2) ** (4 / 3))
    return term1 * term2 * term3

def calculate_B(H, w):
    integral_upper_bound = 914 / H
    result, _ = quad(integrand, 0, integral_upper_bound, args=(H, w))
    B = (4 / 3) * result
    return B

# Size Reduction Factor (s) corrected formula
def calculate_size_reduction_factor(H, w, f_nD, V_H):
    term1 = 1 / (1 + (8 * f_nD * H) / (3 * V_H))
    term2 = 1 / (1 + (10 * f_nD * w) / V_H)
    s = (math.pi / 3) * term1 * term2
    return s

# Correct Gust Energy Ratio (F) formula
def calculate_gust_energy_ratio(f_nD, V_H):
    x_0 = 1220 * f_nD / V_H
    F = (x_0 ** 2) / ((1 + x_0 ** 2) ** (4 / 3))
    return F

def calculate_cg_dynamic(H, w, f_nD, material: Materials, CeH, q, Iw, terrain_type: WindExposureFactorSelections):
    """
    Calculate the Gust Effect Factor (Cg) for the dynamic procedure as per NBCC 2020.

    Parameters:
    ----------
    H : float
        Building height (m).
    w : float
        Effective windward width (m).
    f_nD : float
        Natural frequency in along-wind direction (Hz).
    material : MATERIALS
        the material primarily used in the building
    CeH : float
        Exposure factor at building top (from NBCC Table 4.1.7.8).
    q : float
        Reference velocity pressure (Pa).
    Iw : float
        Importance factor (from NBCC Table 4.1.7.3).
    terrain_type : str
        Terrain type ('open' or 'rough').

    Returns:
    -------
    Cg : float
        Final Gust Effect Factor (Cg).

    Notes:
    ------
    - The function implements the dynamic procedure for calculating Cg as outlined in NBCC 2020.
    - Constants and formulas are derived from NBCC Commentary and related tables.
    """
    
    # Constants
    T = T_CONST  # Averaging time in seconds
    K = 0.08 if terrain_type == WindExposureFactorSelections.OPEN else 0.10  # NBCC Commentary values

    # Calculations:
    # 1. Reference wind speed at 10 m height (V̄)
    V_bar = math.sqrt(q / (0.613 * Iw))

    # 2. Mean wind speed at top of building (VH)
    V_H = V_bar * math.sqrt(CeH)

    # 3. Size reduction factor (s)
    s = calculate_size_reduction_factor(H, w, f_nD, V_H)

    # ✅ Corrected 4. Gust Energy Ratio (F)
    F = calculate_gust_energy_ratio(f_nD, V_H)

    # 5. Background turbulence factor (B)
    B = calculate_B(H, w)

    beta = None
    if material == Materials.STEEL:
        beta = 0.01
    elif material == Materials.CONCRETE:
       beta = 0.02
    else: #materials == MATERIALS.COMPOSITE
        beta = 0.015

    # 6. σ/μ calculation
    sigma_mu = math.sqrt((K / CeH) * ((B + (s * F)) / beta))

    # 7. Average fluctuation rate (v)
    v = f_nD * math.sqrt((s * F) / (s * F + beta * B))

    # 8. Peak factor (g_p)
    g_p = math.sqrt(2 * math.log(v * T)) + (0.577 / math.sqrt(2 * math.log(v * T)))

    # 9. Final Gust Effect Factor (Cg)
    Cg = 1 + g_p * sigma_mu

    return Cg

def calculate_external_pressure(I_w, q, C_e, C_t, C_g, C_p):
    """
    Computes the specified external pressure (p).
    I_w: Importance factor for wind load
    q: Reference velocity pressure (Pa)
    C_e: Exposure factor
    C_t: Topographic factor
    C_g: Gust effect factor
    C_p: External pressure coefficient
    """
    p = I_w * q * C_e * C_t * C_g * C_p
    return p
