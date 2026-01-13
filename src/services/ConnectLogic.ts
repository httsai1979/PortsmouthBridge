export interface ConnectInput {
    postcode: string;
    tenure: 'rent_private' | 'rent_social' | 'owner' | 'mortgage';
    rentAmount: number;
    adults: number;
    children: number;
    childAges: number[];
    isDisabled: boolean;
    netMonthlyIncome: number;
    hasUC: boolean;
    hasChildBenefit: boolean;
    isSouthernWater: boolean;
    isEnergyDebt: boolean;
    isPregnant: boolean;
}

export interface Recommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    desc: string;
    longDesc: string;
    steps: string[];
    link?: string;
    authority: string;
}

export interface ConnectResult {
    monthlyShortfall: number;
    unclaimedValue: number;
    alerts: Array<{
        type: 'warning' | 'opportunity' | 'info';
        title: string;
        message: string;
        actionLabel?: string;
        actionType?: string;
        detailedInfo?: string;
    }>;
    recommendations: Recommendation[];
}

/**
 * Portsmouth Connect Logic Engine - 2025/26 Policy Update
 * Based on Portsmouth Cost of Living Research Report
 */
export const calculateConnectBenefits = (input: ConnectInput): ConnectResult => {
    const results: ConnectResult = {
        monthlyShortfall: 0,
        unclaimedValue: 0,
        alerts: [],
        recommendations: []
    };

    const annualIncome = input.netMonthlyIncome * 12;
    const weeklyIncome = (input.netMonthlyIncome * 12) / 52;

    // --- TIER 1: UNIVERSAL CREDIT ESTIMATION (2025/26 Rates) ---
    // Standard Allowance
    let ucAllowance = 0;
    if (input.adults === 1) {
        ucAllowance = 400.14; // Single 25+
    } else {
        ucAllowance = 628.10; // Couple 25+
    }

    // Child Element (Simplified: assuming at least one born post-2017 for conservative estimate)
    const childElement = input.children > 0 ? (292.81 * Math.min(input.children, 2)) : 0;
    // Note: The 2-child limit is mentioned to be removed in 2026 in some reports, 
    // but the policy doc says HSF helps those just above FSM threshold.

    ucAllowance += childElement;

    let housingAllowance = 0;
    if (input.tenure.startsWith('rent')) {
        // Portsmouth BRMA LHA Rates 2025/26 (Monthly)
        let lhaCap = 0;
        if (input.adults === 1 && input.children === 0) {
            lhaCap = 695.00; // 1 Bed
        } else if (input.children === 1) {
            lhaCap = 845.00; // 2 Bed
        } else if (input.children === 2) {
            lhaCap = 1000.00; // 3 Bed
        } else if (input.children >= 3) {
            lhaCap = 1300.00; // 4 Bed
        } else {
            lhaCap = 695.00;
        }

        housingAllowance = Math.min(input.rentAmount, lhaCap);
        const shortfall = input.rentAmount - housingAllowance;
        if (shortfall > 0) {
            results.monthlyShortfall += shortfall;
            results.recommendations.push({
                id: 'dhp',
                priority: 'high',
                title: 'Discretionary Housing Payment (DHP)',
                desc: `You have a housing shortfall of £${Math.round(shortfall)}/mo.`,
                longDesc: 'Portsmouth City Council uses DHP to fill gaps between benefits and rent, especially for those affected by the Benefit Cap or facing homelessness.',
                steps: [
                    'Apply via the Portsmouth City Council DHP portal',
                    'Provide proof of rent and latest UC award',
                    'Explain any medical or social reasons why you cannot move to cheaper housing',
                    'DHP is usually for 3-6 months as a transition.'
                ],
                link: 'https://www.portsmouth.gov.uk/services/benefits/discretionary-housing-payments/',
                authority: 'Portsmouth City Council'
            });
        }
    }

    const totalUCMax = ucAllowance + housingAllowance;
    const taperRate = 0.55;
    // Work Allowance 2025/26
    const hasWorkAllowance = input.children > 0 || input.isDisabled;
    const workAllowance = hasWorkAllowance ? (housingAllowance > 0 ? 411 : 684) : 0;

    const countableEarnings = Math.max(0, input.netMonthlyIncome - workAllowance);
    const estimatedUC = Math.max(0, totalUCMax - (countableEarnings * taperRate));

    if (!input.hasUC && estimatedUC > 50) {
        results.unclaimedValue += estimatedUC;
        results.recommendations.push({
            id: 'uc_apply',
            priority: 'high',
            title: 'Universal Credit Eligibility',
            desc: `Estimated support: £${Math.round(estimatedUC)}/mo.`,
            longDesc: 'Based on 2025/2026 rates, you may be eligible for Universal Credit to support your household and housing costs.',
            steps: [
                'Complete an online claim at GOV.UK',
                'Verify your identity online or at a Jobcentre (Arundel St)',
                'Keep track of your "To-Do" list in the UC journal',
                'Wait 5 weeks for your first payment (advances available)'
            ],
            link: 'https://www.gov.uk/universal-credit/how-to-claim',
            authority: 'DWP'
        });
    }

    // --- TIER 2: LOCAL OVERLAY (Portsmouth CTS 2025/26 Banded Scheme) ---

    // CTS Calculation
    // Apply £25/wk work disregard if working
    let ctsWeeklyIncome = weeklyIncome;
    if (input.netMonthlyIncome > 0) ctsWeeklyIncome = Math.max(0, ctsWeeklyIncome - 25);

    let ctsDiscountRatio = 0;
    // Decision matrix for Banding (Portsmouth 2025/26)
    if (input.adults === 1) {
        if (input.children === 0) {
            if (ctsWeeklyIncome <= 100) ctsDiscountRatio = 0.9;
            else if (ctsWeeklyIncome <= 180) ctsDiscountRatio = 0.65;
            else if (ctsWeeklyIncome <= 220) ctsDiscountRatio = 0.4;
            else if (ctsWeeklyIncome <= 260) ctsDiscountRatio = 0.15;
        } else if (input.children === 1) {
            if (ctsWeeklyIncome <= 180) ctsDiscountRatio = 0.9;
            else if (ctsWeeklyIncome <= 260) ctsDiscountRatio = 0.65;
            else if (ctsWeeklyIncome <= 300) ctsDiscountRatio = 0.4;
            else if (ctsWeeklyIncome <= 340) ctsDiscountRatio = 0.15;
        } else { // 2+ children
            if (ctsWeeklyIncome <= 240) ctsDiscountRatio = 0.9;
            else if (ctsWeeklyIncome <= 320) ctsDiscountRatio = 0.65;
            else if (ctsWeeklyIncome <= 360) ctsDiscountRatio = 0.4;
            else if (ctsWeeklyIncome <= 400) ctsDiscountRatio = 0.15;
        }
    } else { // Couples
        if (input.children === 0) {
            if (ctsWeeklyIncome <= 150) ctsDiscountRatio = 0.9;
            else if (ctsWeeklyIncome <= 230) ctsDiscountRatio = 0.65;
            else if (ctsWeeklyIncome <= 270) ctsDiscountRatio = 0.4;
            else if (ctsWeeklyIncome <= 310) ctsDiscountRatio = 0.15;
        } else if (input.children === 1) {
            if (ctsWeeklyIncome <= 230) ctsDiscountRatio = 0.9;
            else if (ctsWeeklyIncome <= 310) ctsDiscountRatio = 0.65;
            else if (ctsWeeklyIncome <= 350) ctsDiscountRatio = 0.4;
            else if (ctsWeeklyIncome <= 390) ctsDiscountRatio = 0.15;
        } else { // 2+ children
            if (ctsWeeklyIncome <= 300) ctsDiscountRatio = 0.9;
            else if (ctsWeeklyIncome <= 380) ctsDiscountRatio = 0.65;
            else if (ctsWeeklyIncome <= 420) ctsDiscountRatio = 0.4;
            else if (ctsWeeklyIncome <= 460) ctsDiscountRatio = 0.15;
        }
    }

    if (ctsDiscountRatio > 0) {
        const estMonthlySaving = 120 * ctsDiscountRatio; // Average council tax saving
        results.unclaimedValue += estMonthlySaving;
        results.alerts.push({
            type: 'opportunity',
            title: 'New CTS Banded Scheme (Apr 2025)',
            message: `You qualify for a ${Math.round(ctsDiscountRatio * 100)}% reduction in Council Tax.`,
            detailedInfo: `Portsmouth City Council's 2025 reform means the lowest earners now only pay 10% of their Council Tax bill.`
        });
        results.recommendations.push({
            id: 'cts_banded',
            priority: 'medium',
            title: 'Council Tax Support Claim',
            desc: `Potential saving of £${Math.round(estMonthlySaving)}/mo.`,
            longDesc: 'The new Banded Scheme simplifies the process. If you receive UC, the council may already be aware, but a direct application ensures you get the full discount.',
            steps: [
                'Check if your UC award includes Portsmouth CTS automatically',
                'If not, use the PCC website to submit your weekly income details',
                'Include any disability benefit proofs (PIP/DLA) to get additional disregards'
            ],
            link: 'https://www.portsmouth.gov.uk/services/benefits/council-tax-support/',
            authority: 'Portsmouth City Council'
        });
    }

    // Southern Water Essentials Tariff
    if (input.isSouthernWater && annualIncome < 22020) {
        results.unclaimedValue += 30; // Estimated avg saving
        results.recommendations.push({
            id: 'southern_water',
            priority: 'high',
            title: 'Southern Water Essentials',
            desc: 'Save up to 90% on your water bill.',
            longDesc: 'If your annual household income is below £22,020, you can access the Essentials Tariff. Discounts are tiered (45%, 65%, 90%) based on total income.',
            steps: [
                'Download the Southern Water Essentials form',
                'Check if you qualify for the 90% discount (if income < £16k approx)',
                'Self-refer or ask Citizen\'s Advice to support your claim'
            ],
            link: 'https://www.southernwater.co.uk/account/help-with-paying-your-bill',
            authority: 'Southern Water'
        });
    }

    // Energy Support (LEAP & HUG)
    if (input.isEnergyDebt || annualIncome < 36000) {
        results.recommendations.push({
            id: 'leap_portsmouth',
            priority: 'medium',
            title: 'Switched On Portsmouth (LEAP)',
            desc: 'Free boiler repairs and energy upgrades.',
            longDesc: 'Switched On Portsmouth offers the HUG grant for households earning under £36,000. LEAP provides immediate energy advice visits.',
            steps: [
                'Call 0800 260 5907 to speak to the Portsmouth Energy Hub',
                'Book a LEAP visit for free LED bulbs and insulation check',
                'Apply for HUG funding if your home EPC is D or below'
            ],
            link: 'https://switchedonportsmouth.co.uk/',
            authority: 'Switched On Portsmouth'
        });
    }

    // --- TIER 3: CLIFF WARNINGS & HSF ---

    // Family Voucher Scheme (HSF)
    if (input.children > 0 && input.netMonthlyIncome < 1870) {
        results.alerts.push({
            type: 'opportunity',
            title: 'HSF Family Vouchers',
            message: 'Eligible for £30 per child for essentials.',
            detailedInfo: 'The 2025/26 Household Support Fund provides vouchers for families earning under £1,870/mo who do NOT already get Free School Meals.'
        });
    }

    // Free School Meals Cliff
    const fsmThreshold = 7400 / 12;
    if (input.netMonthlyIncome > fsmThreshold && input.netMonthlyIncome < fsmThreshold + 200) {
        results.alerts.push({
            type: 'warning',
            title: 'Immediate Benefits Cliff: FSM',
            message: 'Earning over £616/mo could cost your family £900/year.',
            detailedInfo: 'Eligibility for Free School Meals ends abruptly if net monthly earnings (excluding benefits) exceed £616.67.'
        });
        results.recommendations.push({
            id: 'pension_shield',
            priority: 'high',
            title: 'The Pension Contribution Shield',
            desc: 'Increase pension contributions to retain school meals.',
            longDesc: 'Net earnings for UC/FSM are calculated AFTER pension deductions. Increasing your workplace pension by a small amount can pull your net earnings back below the cap, preserving eligibility for meals worth £900 per child.',
            steps: [
                'Check your payslip for "Gross pay" and "Net earnings for UC"',
                'Ask your employer to increase your voluntary pension contribution if you are close to the limit',
                'Your total household wealth increases while keeping your school meal support'
            ],
            authority: 'Connect Intelligence'
        });
    }

    return results;
};
