import { Die } from "./Die";
import Hand from "./Hand";
import Rule, { RuleScoreFunction, RuleApplicableFunction, RuleSection, RuleKey } from "./Rule";
import Scoreboard from "./Scoreboard";
import { RuleCanSelectFunction } from './Rule';

export class RuleSet {
    getDiceWithValues(hand: Hand, values: number[]): Die[] {
        return hand.getDice().filter(die => values.some(value => value === die.getCurrentFace()));
    }

    sumHandWithValues(hand: Hand, values: number[]): number {
        const foundDie = this.getDiceWithValues(hand, values);
        return foundDie.map(die => die.getCurrentFace()).reduce((a, b) => a + b, 0);
    }

    sumHand(hand: Hand) {
        return this.sumHandWithValues(hand, Die.faces);
    }

    getCountMapOfValues(hand: Hand): { [value: number]: number; } {
        const dice = hand.getDice();
        const countMap: { [value: number]: number; } = {};
        dice.forEach(die => {
            const value = die.getCurrentFace();
            let map: number = countMap[value];
            if (!map) {
                map = 0;
            }
            countMap[value] = map + 1;
        });
        return countMap;
    }

    getValueOfHandThatHasCount(hand: Hand, predicate: (value: number) => boolean): number | undefined {
        const countMap = this.getCountMapOfValues(hand);
        for (const valueStr of Object.keys(countMap)) {
            const value = parseInt(valueStr);
            if (predicate(countMap[value])) {
                return value;
            }
        }
    }

    getNumberOfConsecutiveValues(hand: Hand): number {
        const handValues = hand.getDice().map(die => die.getCurrentFace()).sort();
        let consecutiveValues = 1;
        let largestConsecutiveValues = consecutiveValues;
        let lastValue = handValues[0];

        for (let value of handValues.slice(1)) {
            if (value === lastValue + 1) {
                consecutiveValues++;
            }
            else if (value !== lastValue) {
                largestConsecutiveValues = Math.max(largestConsecutiveValues, consecutiveValues);
                consecutiveValues = 1;
            }

            lastValue = value;
        }

        return Math.max(largestConsecutiveValues, consecutiveValues);
    }

    upperSectionBonusApplies(scoreboard: Scoreboard) : boolean {
        const outcomes = scoreboard.getRoundOutcomes();
        const applicableOutcomes = outcomes.filter(outcome => outcome.rule.key !== RuleKey.UpperSectionBonus && outcome.rule.section === RuleSection.Upper);
        const score = applicableOutcomes.map(outcome => outcome.rule.getScoreIfApplicable(scoreboard, outcome.hand)).reduce((a: number, b: number) => a + b, 0)
        return score >= 63;
    }

    yahtzeeRuleApplies(hand: Hand) : boolean {
        return !!this.getValueOfHandThatHasCount(hand, count => count === 5);
    }

    yahtzeeBonusRuleApplies(scoreboard: Scoreboard, hand: Hand) : boolean {
        return scoreboard.getRoundOutcomes().some(x => x.rule.key === RuleKey.Yahtzee)
            && this.yahtzeeRuleApplies(hand);
    }

    getRules(): Rule[] {
        if (this.rules.length > 0) {
            return this.rules;
        }

        this.createRule(RuleKey.Aces, 'Aces', RuleSection.Upper, (_, hand) => !!hand ? this.sumHandWithValues(hand, [1]) : 0);
        this.createRule(RuleKey.Twos, 'Twos', RuleSection.Upper, (_, hand) => !!hand ? this.sumHandWithValues(hand, [2]) : 0);
        this.createRule(RuleKey.Threes, 'Threes', RuleSection.Upper, (_, hand) => !!hand ? this.sumHandWithValues(hand, [3]) : 0);
        this.createRule(RuleKey.Fours, 'Fours', RuleSection.Upper, (_, hand) => !!hand ? this.sumHandWithValues(hand, [4]) : 0);
        this.createRule(RuleKey.Fives, 'Fives', RuleSection.Upper, (_, hand) => !!hand ? this.sumHandWithValues(hand, [5]) : 0);
        this.createRule(RuleKey.Sixes, 'Sixes', RuleSection.Upper, (_, hand) => !!hand ? this.sumHandWithValues(hand, [6]) : 0);
        this.createRule(RuleKey.UpperSectionBonus, 'Upper Section Bonus', RuleSection.Upper, () => 35, (scoreboard, _) => this.upperSectionBonusApplies(scoreboard), () => false);

        const getThreeOfAKindValue = (hand: Hand) => this.getValueOfHandThatHasCount(hand, value => value >= 3);
        const getFourOfAKindValue = (hand: Hand) => this.getValueOfHandThatHasCount(hand, value => value >= 4);
        this.createRule(RuleKey.ThreeOfAKind, '3 of a kind', RuleSection.Lower, (_, hand) => !!hand ? (getThreeOfAKindValue(hand)! * 3) : 0, (_, hand) => !!hand && !!getThreeOfAKindValue(hand));
        this.createRule(RuleKey.FourOfAKind, '4 of a kind', RuleSection.Lower, (_, hand) => !!hand ? (getFourOfAKindValue(hand)! * 4) : 0, (_, hand) => !!hand && !!getFourOfAKindValue(hand));
        this.createRule(RuleKey.FullHouse, 'Full House', RuleSection.Lower, () => 25, (_, hand) => {
            if (!hand)
                return false;
            const threeOrMore = getThreeOfAKindValue(hand);
            const pair = this.getValueOfHandThatHasCount(hand, value => value === 2);
            return !!threeOrMore && !!pair;
        });
        this.createRule(RuleKey.SmallStraight, 'Small Straight', RuleSection.Lower, () => 30, (_, hand) => !!hand && this.getNumberOfConsecutiveValues(hand) >= 4);
        this.createRule(RuleKey.LargeStraight, 'Large Straight', RuleSection.Lower, () => 40, (_, hand) => !!hand && this.getNumberOfConsecutiveValues(hand) >= 5);
        this.createRule(RuleKey.Chance, 'Chance', RuleSection.Lower, (_, hand) => !!hand ? this.sumHand(hand) : 0);
        this.createRule(RuleKey.Yahtzee, 'Yahtzee!', RuleSection.Lower, () => 50, (_, hand) => !!hand && this.yahtzeeRuleApplies(hand));
        const canSelectYahtzeeBonus: RuleCanSelectFunction = (scoreboard, hand) => {
            return this.yahtzeeBonusRuleApplies(scoreboard, hand) && scoreboard.getRoundOutcomes().some(x => x.rule.key === RuleKey.Yahtzee);
        };
        this.createRule(RuleKey.YahtzeeBonus, 'Yahtzee Bonus!', RuleSection.Lower, () => 100, (scoreboard, hand) => !!hand && this.yahtzeeBonusRuleApplies(scoreboard, hand), canSelectYahtzeeBonus);

        return this.rules;
    }

    ruleCount(): number {
        return this.getRules().filter(rule => rule.countsTowardsRuleCount).length;
    }

    private createRule(ruleKey: RuleKey, name: string, section: RuleSection, scoreFunction: RuleScoreFunction, isApplicable: RuleApplicableFunction = () => true, canSelect: RuleCanSelectFunction = () => true): void {
        this.rules.push(new Rule(ruleKey, name, section, scoreFunction, isApplicable, true, canSelect));
    }

    private readonly rules: Rule[] = [];

    readonly upperSectionRuleValueMap: {readonly [value: number]: RuleKey} = {
        1: RuleKey.Aces,
        2: RuleKey.Twos,
        3: RuleKey.Threes,
        4: RuleKey.Fours,
        5: RuleKey.Fives,
        6: RuleKey.Sixes
    };
}
