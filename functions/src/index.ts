import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// --- INTERFACES (Ported from src/services/ConnectLogic.ts) ---
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

export interface Band {
    limit: number;
    discount: number;
}

export interface PolicyConfig {
    ucStandardAllowanceSingle25Plus: number;
    ucStandardAllowanceCouple25Plus: number;
    ucChildElement: number;
    lhaCaps: {
        shared: number;
        bed1: number;
        bed2: number;
        bed3Plus: number;
    };
    ucTaperRate: number;
    ucWorkAllowanceHigher: number;
    ucWorkAllowanceLower: number;
    ctsWorkDisregard: number;
    averageBandBCouncilTaxMonthly: number;
    ctsBandedScheme: {
        single: {
            noChildren: Band[];
            oneChild: Band[];
            twoPlusChildren: Band[];
        };
        couple: {
            noChildren: Band[];
            onePlusChildren: Band[];
        };
    };
    southernWaterIncomeThreshold: number;
    southernWaterMonthlySaving: number;
    fsmEarningsThresholdAnnual: number;
}

// Default fallback config if Firestore config is missing
const DEFAULT_POLICY_CONFIG: PolicyConfig = {
    ucStandardAllowanceSingle25Plus: 400.14,
    ucStandardAllowanceCouple25Plus: 628.10,
    ucChildElement: 292.81,
    lhaCaps: {
        shared: 420.00,
        bed1: 625.00,
        bed2: 825.00,
        bed3Plus: 975.00
    },
    ucTaperRate: 0.55,
    ucWorkAllowanceHigher: 684,
    ucWorkAllowanceLower: 411,
    ctsWorkDisregard: 25,
    averageBandBCouncilTaxMonthly: 130,
    ctsBandedScheme: {
        single: {
            noChildren: [
                { limit: 100, discount: 0.9 },
                { limit: 180, discount: 0.65 },
                { limit: 220, discount: 0.4 },
                { limit: 260, discount: 0.15 }
            ],
            oneChild: [
                { limit: 180, discount: 0.9 },
                { limit: 260, discount: 0.65 },
                { limit: 300, discount: 0.4 },
                { limit: 340, discount: 0.15 }
            ],
            twoPlusChildren: [
                { limit: 240, discount: 0.9 },
                { limit: 320, discount: 0.65 },
                { limit: 360, discount: 0.15 }
            ]
        },
        couple: {
            noChildren: [
                { limit: 150, discount: 0.9 },
                { limit: 230, discount: 0.65 },
                { limit: 270, discount: 0.4 },
                { limit: 310, discount: 0.15 }
            ],
            onePlusChildren: [
                { limit: 230, discount: 0.9 },
                { limit: 310, discount: 0.65 },
                { limit: 390, discount: 0.15 }
            ]
        }
    },
    southernWaterIncomeThreshold: 21000,
    southernWaterMonthlySaving: 28,
    fsmEarningsThresholdAnnual: 7400
};

// --- CORE FUNCTION: calculateBenefits ---
export const calculateBenefits = functions.https.onCall(async (data: ConnectInput, _context: functions.https.CallableContext) => {
    // 1. Fetch current policy from Firestore
    let policy = DEFAULT_POLICY_CONFIG;
    try {
        const configDoc = await db.collection('system_config').doc('policy_2026').get();
        if (configDoc.exists) {
            policy = configDoc.data() as PolicyConfig;
        }
    } catch (error) {
        console.error("Error fetching policy config:", error);
    }

    const input = data;
    const results: ConnectResult = {
        monthlyShortfall: 0,
        unclaimedValue: 0,
        alerts: [],
        recommendations: []
    };

    const annualIncome = input.netMonthlyIncome * 12;
    const weeklyIncome = annualIncome / 52;

    // --- TIER 1: UNIVERSAL CREDIT ESTIMATION ---
    let ucAllowance = 0;
    if (input.adults === 1) {
        ucAllowance = policy.ucStandardAllowanceSingle25Plus;
    } else {
        ucAllowance = policy.ucStandardAllowanceCouple25Plus;
    }

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
            longDesc: 'Based on your household income and residency details, you appear to be eligible for Universal Credit support.',
            steps: [
                'Set up a Universal Credit account online at GOV.UK',
                'Verify your identity online or at the Jobcentre (Arundel Street)',
                'Wait five weeks for your first payment',
                'Notify UC of any changes to your earnings immediately'
            ],
            link: 'https://www.gov.uk/universal-credit/how-to-claim',
            authority: 'DWP'
        });
    }

    // --- TIER 2: LOCAL OVERLAY ---
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
            detailedInfo: 'Portsmouth City Council uses an income-banded scheme for Council Tax Support.'
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
            longDesc: 'Southern Water provides significant discounts for households with an annual income below the threshold.',
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
            message: `Earning over £${Math.round(monthlyFsmThreshold)} per month could cost you £900 per year in school meals.`
        });
    }

    return results;
});

// --- TRIGGER: moderatePost ---
const BANNED_WORDS = ['scam', 'crypto', 'investment', 'money', 'payment', 'cash', 'piss', 'shit', 'fuck', 'bastard', 'crap', 'nigger', 'faggot'];

// Triggered on BOTH creation and updates to ensure ongoing safety
export const moderatePost = functions.firestore
    .document('community_posts/{postId}')
    .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
        const newValue = change.after.exists ? change.after.data() : null;
        if (!newValue) return; // Post deleted

        const title = (newValue.title || '').toLowerCase();
        const description = (newValue.description || '').toLowerCase();

        const hasBannedWord = BANNED_WORDS.some(word =>
            title.includes(word) || description.includes(word)
        );

        if (hasBannedWord) {
            console.log(`Moderating post ${context.params.postId}: Banned words detected.`);
            await change.after.ref.update({
                status: 'flagged',
                moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
                moderationReason: 'Automated keyword match'
            });

            // Log to audit trail
            await db.collection('audit_logs').add({
                type: 'moderation',
                target: 'community_posts',
                targetId: context.params.postId,
                action: 'flagged_banned_words',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });

// --- TRIGGER: syncUserClaims ---
// This function ensures that when a partner document is created/updated, the user's custom claims are set
// This fulfills the "Iron Dome" requirement for RBAC using request.auth.token.role
export const syncUserClaims = functions.firestore
    .document('partners/{userId}')
    .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
        const userId = context.params.userId;
        const exists = change.after.exists;

        try {
            if (exists) {
                // Set custom claim for partner
                await admin.auth().setCustomUserClaims(userId, { role: 'partner' });
                console.log(`✅ Custom claim 'partner' set for user: ${userId}`);
            } else {
                // Remote claim if partner deleted
                await admin.auth().setCustomUserClaims(userId, null);
                console.log(`❌ Custom claims removed for user: ${userId}`);
            }
        } catch (error) {
            console.error(`Error syncing claims for user ${userId}:`, error);
        }
    });

// --- HOOK: auditPartnerWrites ---
// Generic auditor for critical collections
export const auditPartnerWrites = functions.firestore
    .document('{collection}/{docId}')
    .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
        const { collection, docId } = context.params;
        const criticalCollections = ['services', 'system_config', 'partners'];

        if (!criticalCollections.includes(collection)) return;

        const newValue = change.after.exists ? change.after.data() : null;
        const oldValue = change.before.exists ? change.before.data() : null;

        // Note: For background triggers, we rely on the client or other functions 
        // to have set metadata like lastEditedBy if we want to attribute the change.
        if (newValue && newValue.lastEditedBy) {
            await db.collection('audit_logs').add({
                type: 'data_change',
                collection,
                docId,
                action: change.after.exists ? (change.before.exists ? 'update' : 'create') : 'delete',
                userId: newValue.lastEditedBy,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                details: {
                    before: oldValue,
                    after: newValue
                }
            });
        }
    });
