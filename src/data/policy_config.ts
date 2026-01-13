export interface Band {
    limit: number;
    discount: number;
}

export interface PolicyParameters {
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

export const DEFAULT_POLICY_CONFIG: PolicyParameters = {
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
