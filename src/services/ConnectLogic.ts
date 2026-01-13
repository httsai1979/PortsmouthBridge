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

export interface ConnectResult {
    monthlyShortfall: number;
    unclaimedValue: number;
    alerts: Array<{
        type: 'warning' | 'opportunity' | 'info';
        title: string;
        message: string;
        actionLabel?: string;
        actionType?: string;
    }>;
    recommendations: Array<{
        id: string;
        priority: 'high' | 'medium' | 'low';
        title: string;
        desc: string;
        link?: string;
    }>;
}

export const calculateConnectBenefits = (input: ConnectInput): ConnectResult => {
    const results: ConnectResult = {
        monthlyShortfall: 0,
        unclaimedValue: 0,
        alerts: [],
        recommendations: []
    };

    const annualIncome = input.netMonthlyIncome * 12;

    // --- TIER 1: UNIVERSAL CREDIT ESTIMATION (Simplified 2026 logic) ---
    // Standard Allowance (Est 2026)
    let ucAllowance = input.adults > 1 ? 600 : 400;
    // Child Element
    ucAllowance += input.children * 280;
    // Housing Element (Simplified)
    let housingAllowance = 0;
    if (input.tenure.startsWith('rent')) {
        // Portsmouth LHA est for 2-bed PO1 is approx £850
        const lhaCap = 850;
        housingAllowance = Math.min(input.rentAmount, lhaCap);
        const shortfall = input.rentAmount - housingAllowance;
        if (shortfall > 0) {
            results.monthlyShortfall += shortfall;
            results.recommendations.push({
                id: 'dhp',
                priority: 'medium',
                title: 'Apply for Discretionary Housing Payment (DHP)',
                desc: `Your rent exceeds local housing allowance by £${shortfall}. The council may cover this gap.`,
                link: 'https://www.portsmouth.gov.uk/services/benefits/discretionary-housing-payments/'
            });
        }
    }

    const totalUCMax = ucAllowance + housingAllowance;
    const taperRate = 0.55;
    const earningsDisregard = input.children > 0 || input.isDisabled ? 400 : 0;
    const countableEarnings = Math.max(0, input.netMonthlyIncome - earningsDisregard);
    const estimatedUC = Math.max(0, totalUCMax - (countableEarnings * taperRate));

    if (!input.hasUC && estimatedUC > 50) {
        results.unclaimedValue += estimatedUC;
        results.recommendations.push({
            id: 'uc_apply',
            priority: 'high',
            title: 'Apply for Universal Credit',
            desc: `You may be eligible for approx £${Math.round(estimatedUC)} per month in support.`,
            link: 'https://www.gov.uk/universal-credit/how-to-claim'
        });
    }

    // --- TIER 2: LOCAL OVERLAY (Portsmouth Specific) ---

    // Council Tax banded income scheme (Simplified PCC 2026)
    if (annualIncome < 25000) {
        results.alerts.push({
            type: 'opportunity',
            title: 'Council Tax Reduction',
            message: 'Based on your income, you likely qualify for Portsmouth’s Banded Income Scheme reduction.',
            actionLabel: 'Check PCC Eligibility'
        });
        results.unclaimedValue += 80; // Est monthly saving
    }

    // Southern Water Essentials
    if (input.isSouthernWater && annualIncome < 21000) {
        results.unclaimedValue += 20; // Est £240/year
        results.recommendations.push({
            id: 'southern_water',
            priority: 'high',
            title: 'Southern Water Essentials Tariff',
            desc: 'Your income qualifies you for up to 90% discount on water bills.',
            link: 'https://www.southernwater.co.uk/account/help-with-paying-your-bill'
        });
    }

    // --- TIER 3: CLIFF WARNING SYSTEM ---

    // Free School Meals (FSM) Cliff - £7,400 net annual earnings
    const fsmThreshold = 7400 / 12;
    if (input.netMonthlyIncome > fsmThreshold && input.netMonthlyIncome < fsmThreshold + 100) {
        results.alerts.push({
            type: 'warning',
            title: 'Critical: Benefits Cliff Ahead',
            message: 'Your income is just above the Free School Meals threshold. A small pay rise could cost you £900/year in lost school meal value.',
            actionLabel: 'Read Strategy',
            actionType: 'fsm_advice'
        });
        results.recommendations.push({
            id: 'pension_boost',
            priority: 'medium',
            title: 'Increase Pension Contributions',
            desc: 'Boosting your pension can reduce your net earnings below the £7,400 threshold to retain FSM eligibility.',
        });
    }

    return results;
};
