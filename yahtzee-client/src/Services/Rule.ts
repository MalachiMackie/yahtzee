import Hand from "./Hand";
import Scoreboard from './Scoreboard';

export type RuleScore = number;
export type RuleScoreFunction = (scoreboard: Scoreboard, hand?: Hand) => RuleScore;
export type RuleApplicableFunction = (scoreboard: Scoreboard, hand?: Hand) => boolean;
export type RuleCanSelectFunction = (scoreboard: Scoreboard, hand: Hand) => boolean;

export enum RuleSection {
    Upper,
    Lower
}

export enum RuleKey {
    Aces,
    Twos,
    Threes,
    Fours,
    Fives,
    Sixes,
    UpperSectionBonus,
    ThreeOfAKind,
    FourOfAKind,
    FullHouse,
    SmallStraight,
    LargeStraight,
    Chance,
    Yahtzee,
    YahtzeeBonus
}

export default class Rule {
    readonly key: RuleKey;
    readonly name: string;
    readonly section: RuleSection;
    readonly countsTowardsRuleCount: boolean;
    readonly canSelect: RuleCanSelectFunction;
    getScoreIfApplicable: RuleScoreFunction;
    getScore: RuleScoreFunction;
    isApplicable: RuleApplicableFunction;

    constructor(key: RuleKey,
            name: string,
            section: RuleSection,
            scoreFunction: RuleScoreFunction,
            isApplicableFunction: RuleApplicableFunction,
            countsTowardsRuleCount: boolean = true,
            canSelect: RuleCanSelectFunction = () => true) {
        this.key = key;
        this.name = name;
        this.section = section;
        this.countsTowardsRuleCount = countsTowardsRuleCount;
        this.canSelect = canSelect;
        this.isApplicable = isApplicableFunction;
        this.getScore = scoreFunction;
        this.getScoreIfApplicable = (hand, scoreboard) => {
            return this.isApplicable(hand, scoreboard)
                ? this.getScore(hand, scoreboard)
                : 0
        };
    }
}
