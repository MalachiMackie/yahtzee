import { Hand } from "./Hand";

export type RuleScoreFunction = (hand: Hand) => number;
export type RuleApplicableFunction = (hand: Hand) => boolean;

export enum RuleSection {
    Upper,
    Lower
}

export class Rule {
    readonly key: number;
    readonly name: string;
    readonly section: RuleSection;
    readonly countsTowardsRuleCount: boolean;
    getScore: (hand: Hand) => number;
    isApplicableToHand: (hand: Hand) => boolean;

    constructor(key: number, name: string, section: RuleSection, scoreFunction: RuleScoreFunction, isApplicableToHand: RuleApplicableFunction, countsTowardsRuleCount: boolean = true) {
        this.key = key;
        this.name = name;
        this.section = section;
        this.countsTowardsRuleCount = countsTowardsRuleCount;
        this.getScore = scoreFunction;
        this.isApplicableToHand = isApplicableToHand;
    }
}
