import Hand from "./Hand";
import Scoreboard from './Scoreboard';

export type RuleScore = number;
export type RuleScoreFunction = (hand: Hand, scoreboard: Scoreboard, ruleKey: number) => RuleScore;
export type RuleApplicableFunction = (hand: Hand, scoreboard: Scoreboard, ruleKey: number) => boolean;

export enum RuleSection {
    Upper,
    Lower
}

export default class Rule {
    readonly key: number;
    readonly name: string;
    readonly section: RuleSection;
    readonly countsTowardsRuleCount: boolean;
    readonly canSelect: boolean;
    getScore: RuleScoreFunction;
    isApplicable: RuleApplicableFunction;

    constructor(key: number,
            name: string,
            section: RuleSection,
            scoreFunction: RuleScoreFunction,
            isApplicableFunction: RuleApplicableFunction,
            countsTowardsRuleCount: boolean = true,
            canSelect: boolean = true) {
        this.key = key;
        this.name = name;
        this.section = section;
        this.countsTowardsRuleCount = countsTowardsRuleCount;
        this.canSelect = canSelect;
        this.isApplicable = isApplicableFunction;
        this.getScore = (hand, scoreboard, ruleKey) => {
            return this.isApplicable(hand, scoreboard, ruleKey)
                ? scoreFunction(hand, scoreboard, ruleKey)
                : 0
        };
    }
}
