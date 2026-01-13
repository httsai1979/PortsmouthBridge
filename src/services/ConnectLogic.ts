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

import { PolicyParameters, DEFAULT_POLICY_CONFIG, Band } from '../data/policy_config';

/**
 * Portsmouth Connect Logic Engine - 2026 Core Parameters
 * Decoupled from static values to allow for remote configuration.
 */
export const calculateConnectBenefits = (input: ConnectInput, policy: PolicyParameters = DEFAULT_POLICY_CONFIG): ConnectResult => {
    const results: ConnectResult = {
        monthlyShortfall: 0,
        unclaimedValue: 0,
        alerts: [],
        recommendations: []
    };

    const annualIncome = input.netMonthlyIncome * 12;
    const weeklyIncome = annualIncome / 52;

    // --- TIER 1: UNIVERSAL CREDIT ESTIMATION ---
    // Standard Allowance (Monthly)
    let ucAllowance = 0;
    if (input.adults === 1) {
        ucAllowance = policy.ucStandardAllowanceSingle25Plus;
    } else {
        ucAllowance = policy.ucStandardAllowanceCouple25Plus;
    }

    // Child Element
    const childElement = input.children > 0 ? (policy.ucChildElement * Math.min(input.children, 2)) : 0;
    ucAllowance += childElement;

    let housingAllowance = 0;
    if (input.tenure.startsWith('rent')) {
        let lhaCap = 0;
        if (input.adults === 1 && input.children === 0) {
            lhaCap = policy.lhaCaps.bed1;
        } else if (input.children === 1) {
            lhaCap = policy.lhaCaps.bed2;
        } else if (input.children >= 2) {
            lhaCap = policy.lhaCaps.bed3Plus;
        } else {
            lhaCap = policy.lhaCaps.shared;
        }

        housingAllowance = Math.min(input.rentAmount, lhaCap);
        const shortfall = input.rentAmount - housingAllowance;

        if (shortfall > 0) {
            results.monthlyShortfall += shortfall;
            results.recommendations.push({
                id: 'dhp',
                priority: 'high',
                title: 'Discretionary Housing Payment (DHP)',
                desc: `You have a rental shortfall of £${Math.round(shortfall)} per month.`,
                longDesc: 'Portsmouth City Council may be able to cover the gap between your Universal Credit housing element and your actual rent via DHP, particularly if you are in financial hardship or at risk of homelessness.',
                steps: [
                    'Apply via the Portsmouth City Council DHP portal',
                    'You must be receiving Universal Credit housing element or Housing Benefit',
                    'Provide proof of your rent and latest bank statements',
                    'DHP is usually a temporary award for 3 to 6 months'
                ],
                link: 'https://www.portsmouth.gov.uk/services/benefits/discretionary-housing-payments/',
                authority: 'Portsmouth City Council'
            });
        }
    }

    const totalUCMax = ucAllowance + housingAllowance;
    const taperRate = policy.ucTaperRate;

    // Work Allowance
    const hasWorkAllowance = input.children > 0 || input.isDisabled;
    const workAllowance = hasWorkAllowance ? (housingAllowance > 0 ? policy.ucWorkAllowanceLower : policy.ucWorkAllowanceHigher) : 0;

    const countableEarnings = Math.max(0, input.netMonthlyIncome - workAllowance);
    const estimatedUC = Math.max(0, totalUCMax - (countableEarnings * taperRate));

    if (!input.hasUC && estimatedUC > 25) {
        results.unclaimedValue += estimatedUC;
        results.recommendations.push({
            id: 'uc_apply',
            priority: 'high',
            title: 'Universal Credit Eligibility',
            desc: `Estimated entitlement: £${Math.round(estimatedUC)} per month.`,
            longDesc: 'Based on your household income and residency details, you appear to be eligible for Universal Credit support. This payment helps with living costs and rent.',
            steps: [
                'Set up a Universal Credit account online at GOV.UK',
                'Verify your identity online or at the Jobcentre (Arundel Street)',
                'Wait five weeks for your first payment (you can request an advance)',
                'Notify UC of any changes to your earnings immediately'
            ],
            link: 'https://www.gov.uk/universal-credit/how-to-claim',
            authority: 'DWP'
        });
    }

    // --- TIER 2: LOCAL OVERLAY (Portsmouth CTS Banded Scheme) ---
    const ctsWeeklyIncome = input.netMonthlyIncome > 0 ? Math.max(0, weeklyIncome - policy.ctsWorkDisregard) : weeklyIncome;

    let ctsDiscountRatio = 0;
    const getDiscount = (bands: Band[], income: number) => {
        const found = bands.find(b => income <= b.limit);
        return found ? found.discount : 0;
    };

    if (input.adults === 1) {
        if (input.children === 0) {
            ctsDiscountRatio = getDiscount(policy.ctsBandedScheme.single.noChildren, ctsWeeklyIncome);
        } else if (input.children === 1) {
            ctsDiscountRatio = getDiscount(policy.ctsBandedScheme.single.oneChild, ctsWeeklyIncome);
        } else {
            ctsDiscountRatio = getDiscount(policy.ctsBandedScheme.single.twoPlusChildren, ctsWeeklyIncome);
        }
    } else {
        if (input.children === 0) {
            ctsDiscountRatio = getDiscount(policy.ctsBandedScheme.couple.noChildren, ctsWeeklyIncome);
        } else {
            ctsDiscountRatio = getDiscount(policy.ctsBandedScheme.couple.onePlusChildren, ctsWeeklyIncome);
        }
    }

    if (ctsDiscountRatio > 0) {
        const estCtaxSaving = policy.averageBandBCouncilTaxMonthly * ctsDiscountRatio;
        results.unclaimedValue += estCtaxSaving;
        results.alerts.push({
            type: 'opportunity',
            title: 'Council Tax Reduction (Banded Scheme)',
            message: `You qualify for a ${Math.round(ctsDiscountRatio * 100)}% discount on your Council Tax bills.`,
            detailedInfo: 'Portsmouth City Council uses an income-banded scheme for Council Tax Support. The lowest earners only pay 10% of their bill.'
        });
        results.recommendations.push({
            id: 'cts_apply',
            priority: 'medium',
            title: 'Council Tax Banded Scheme',
            desc: `Estimated saving of £${Math.round(estCtaxSaving)} per month.`,
            longDesc: 'The Banded Scheme simplifies support for residents with fluctuating incomes. Discounts are applied based on which weekly income "band" your household falls into.',
            steps: [
                'Visit the Portsmouth City Council benefits portal',
                'Upload your latest payslips or Universal Credit award letter',
                'Apply for the Single Person Discount separately if you live alone'
            ],
            link: 'https://www.portsmouth.gov.uk/services/benefits/council-tax-support/',
            authority: 'Portsmouth City Council'
        });
    }

    // Southern Water Essentials Tariff
    if (input.isSouthernWater && annualIncome < policy.southernWaterIncomeThreshold) {
        results.unclaimedValue += policy.southernWaterMonthlySaving;
        results.recommendations.push({
            id: 'water_essentials',
            priority: 'high',
            title: 'Southern Water Essentials Tariff',
            desc: 'Save up to 90% on your water bill.',
            longDesc: 'Southern Water provides significant discounts for households with an annual income below the threshold. This can reduce your water costs by hundreds of pounds each year.',
            steps: [
                'Download the Essentials Tariff application form from Southern Water',
                'Gather proof of your income or benefit entitlement',
                'You can also request a free water-saving kit to further reduce costs'
            ],
            link: 'https://www.southernwater.co.uk/account/help-with-paying-your-bill',
            authority: 'Southern Water'
        });
    }

    // --- TIER 3: CLIFF WARNINGS ---
    const monthlyFsmThreshold = policy.fsmEarningsThresholdAnnual / 12;
    if (input.netMonthlyIncome > monthlyFsmThreshold && input.netMonthlyIncome < monthlyFsmThreshold + 150) {
        results.alerts.push({
            type: 'warning',
            title: 'Benefits Cliff: Free School Meals',
            message: `Earning over £${Math.round(monthlyFsmThreshold)} per month could cost you £900 per year in school meals.`,
            detailedInfo: `Eligibility for Free School Meals for UC claimants is linked to a strict earnings cap of £${policy.fsmEarningsThresholdAnnual}. If you earn just over this limit, you lose meals for all children.`
        });
        results.recommendations.push({
            id: 'pension_shield',
            priority: 'high',
            title: 'The Pension Contribution Shield',
            desc: 'Protect school meals by increasing pension contributions.',
            longDesc: `Net earnings are calculated AFTER pension contributions. If you are close to the £${Math.round(monthlyFsmThreshold)} limit, increasing your workplace pension contribution by a small amount can pull your income back below the threshold, saving your family £900/year.`,
            steps: [
                'Check your payslip for your "Net Earnings for Universal Credit"',
                'Ask your employer to increase your voluntary pension contribution if you are near the limit',
                'This protects your FSM eligibility while increasing your long-term savings'
            ],
            authority: 'Connect Intelligence'
        });
    }

    return results;
};
