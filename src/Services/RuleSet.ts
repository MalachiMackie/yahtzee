import { Die } from "./Die";
import { Hand } from "./Hand";
import { RuleScoreFunction, RuleApplicableFunction, RuleSection, Rule } from "./Rule";

export class RuleSet {
    getDiceWithValues(hand: Hand, values: number[]): Die[] {
        return hand.getDice().filter(die => values.some(value => value === die.getCurrentFace()));
    }

    sumHandWithValues(hand: Hand, values: number[]): number {
        const foundDie = this.getDiceWithValues(hand, values);
        return foundDie.map(die => die.getCurrentFace()).reduce((a, b) => a + b, 0);
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
        for (const keyStr of Object.keys(countMap)) {
            const key = parseInt(keyStr);
            if (predicate(countMap[key])) {
                return key;
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

    getRules(): Rule[] {
        if (this.rules.length > 0) {
            return this.rules;
        }

        this.createRule('Aces', RuleSection.Upper, (hand: Hand) => this.sumHandWithValues(hand, [1]));
        this.createRule('Twos', RuleSection.Upper, (hand: Hand) => this.sumHandWithValues(hand, [2]));
        this.createRule('Threes', RuleSection.Upper, (hand: Hand) => this.sumHandWithValues(hand, [3]));
        this.createRule('Fours', RuleSection.Upper, (hand: Hand) => this.sumHandWithValues(hand, [4]));
        this.createRule('Fives', RuleSection.Upper, (hand: Hand) => this.sumHandWithValues(hand, [5]));
        this.createRule('Sixes', RuleSection.Upper, (hand: Hand) => this.sumHandWithValues(hand, [6]));

        const getThreeOfAKindValue = (hand: Hand) => this.getValueOfHandThatHasCount(hand, value => value >= 3);
        const getFourOfAKindValue = (hand: Hand) => this.getValueOfHandThatHasCount(hand, value => value >= 4);
        this.createRule('3 of a kind', RuleSection.Lower, (hand: Hand) => getThreeOfAKindValue(hand)! * 3, (hand) => !!getThreeOfAKindValue(hand));
        this.createRule('4 of a kind', RuleSection.Lower, (hand: Hand) => getFourOfAKindValue(hand)! * 4, (hand) => !!getFourOfAKindValue(hand));
        this.createRule('Full House', RuleSection.Lower, () => 25, (hand) => {
            const threeOrMore = getThreeOfAKindValue(hand);
            const pair = this.getValueOfHandThatHasCount(hand, value => value === 2);
            return !!threeOrMore && !!pair;
        });
        this.createRule('Small Straight', RuleSection.Lower, () => 30, (hand) => this.getNumberOfConsecutiveValues(hand) >= 4);
        this.createRule('Large Straight', RuleSection.Lower, () => 40, (hand) => this.getNumberOfConsecutiveValues(hand) >= 5);
        this.createRule('Chance', RuleSection.Lower, (hand) => this.sumHandWithValues(hand, Die.faces));
        const yahtzeeRule: RuleApplicableFunction = (hand) => !!this.getValueOfHandThatHasCount(hand, count => count === 5);
        this.createRule('Yahtzee!', RuleSection.Lower, () => 50, yahtzeeRule);

        return this.rules;
    }

    ruleCount(): number {
        return this.getRules().filter(rule => rule.countsTowardsRuleCount).length;
    }

    private createRule(name: string, section: RuleSection, scoreFunction: RuleScoreFunction, isApplicableToHand: RuleApplicableFunction = () => true): void {
        this.rules.push(new Rule(this.rules.length, name, section, scoreFunction, isApplicableToHand));
    }

    private rules: Rule[] = [];
}
