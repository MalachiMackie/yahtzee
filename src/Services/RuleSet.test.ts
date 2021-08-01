import theoretically from 'jest-theories';
import { Die } from './Die';
import Hand, { TooManyDiceForHandError } from './Hand';
import { RuleKey } from './Rule';
import { RuleSet } from './RuleSet';
import Scoreboard from './Scoreboard';

describe('ruleSet', () => {
    let ruleSet: RuleSet;    

    beforeEach(() => {
        ruleSet = new RuleSet();
    });

    const getScoreboard: () => Scoreboard = () => new Scoreboard(ruleSet);

    const repeat = <Type>(getValue: () => Type, count: number): Type[] => {
        const array: Type[] = [];
        for (let i = 0; i < count; i++) {
            array.push(getValue())
        }

        return array;
    };

    const repeatValue = <Type>(value: Type, count: number): Type[] => {
        return repeat(() => value, count);
    };

    const getYahtzeeHand: (dieValue: number) => Hand = (dieValue) => new Hand(repeat(() => new Die(dieValue), 5));
    const getHandWithValues: (values: number[]) => Hand = values => {
        if (values.length > Hand.maxDice) {
            throw new TooManyDiceForHandError();
        }

        return new Hand(values.map(x => new Die(x)));
    };

    const fillScoreboardWithUpperSectionRules: (scoreboard: Scoreboard) => void = scoreboard => {
        for (let value of Object.keys(ruleSet.upperSectionRuleValueMap).map(x => parseInt(x)))
        {
            scoreboard.keepHand(getHandWithValues(repeatValue(value, Hand.maxDice)), ruleSet.upperSectionRuleValueMap[value]);
        }
    };

    interface getDiceWithValuesTheory {
        handValues: number[],
        inputValues: number[],
        expectedCount: number
    };
    const getDiceWithValuesTheories: getDiceWithValuesTheory[] = [
        {
            handValues: [1,2],
            inputValues: [1],
            expectedCount: 1
        },
        {
            handValues: [1, 2, 2, 3],
            inputValues: [2],
            expectedCount: 2
        },
        {
            handValues: [1, 2, 2, 3],
            inputValues: [1, 2],
            expectedCount: 3
        }
    ];

    theoretically('hand with values {handValues} should return {expectedCount} item(s) when asked for values of {inputValues}',
        getDiceWithValuesTheories,
        (theory) => {
            const hand = getHandWithValues(theory.handValues);

            const returnedDice = ruleSet.getDiceWithValues(hand, theory.inputValues);
            expect(returnedDice.length).toBe(theory.expectedCount);
        }
    );

    interface getNumberOfConsecutiveValuesTheory {
        diceValues: number[],
        expectedCount: number
    };
    const getNumberOfConsecutiveValuesTheories: getNumberOfConsecutiveValuesTheory[] = [
        {
            diceValues: [1, 2, 3, 4, 5],
            expectedCount: 5
        },
        {
            diceValues: [5, 4, 3, 2, 1],
            expectedCount: 5
        },
        {
            diceValues: [3, 3, 3, 3, 3],
            expectedCount: 1
        },
        {
            diceValues: [3, 3, 2, 3],
            expectedCount: 2
        },
        {
            diceValues: [4,4,5,6,3],
            expectedCount: 4
        }
    ];

    theoretically('{diceValues} should have {expectedCount} consecutive values',
        getNumberOfConsecutiveValuesTheories,
        (theory) => {
            const hand = getHandWithValues(theory.diceValues);

            expect(ruleSet.getNumberOfConsecutiveValues(hand)).toBe(theory.expectedCount);
        }
    );

    test('upperSectionApplies should apply with 3 of each die', () => {
        const scoreboard = getScoreboard()
        const ruleMap = ruleSet.upperSectionRuleValueMap;

        for(let dieValue of Object.keys(ruleMap).map(x => parseInt(x)))
        {
            const hand = getHandWithValues(repeatValue(dieValue, 3))
            scoreboard.keepHand(hand, ruleMap[dieValue]);
        }

        expect(ruleSet.upperSectionBonusApplies(scoreboard)).toBe(true);
    });

    test('upperSectionApplies should not apply with less than 63', () => {
        const scoreboard = getScoreboard()

        for(let dieValue of Object.keys(ruleSet.upperSectionRuleValueMap).map(x => parseInt(x)))
        {
            const values: number[] = repeatValue(dieValue, 3);
            if (dieValue === 1) {
                values.pop()
            }
            const hand = getHandWithValues(values);
            scoreboard.keepHand(hand, ruleSet.upperSectionRuleValueMap[dieValue]);
        }

        expect(ruleSet.upperSectionBonusApplies(scoreboard)).toBe(false);
    });

    

    test('Upper section bonus should be added to scoreboard when score crosses 63', () => {
        const scoreboard = getScoreboard()

        for(let dieValue of Object.keys(ruleSet.upperSectionRuleValueMap).map(x => parseInt(x)))
        {
            expect(scoreboard.getRoundOutcomes().some(x => x.rule.key === RuleKey.UpperSectionBonus)).toBe(false);
            const hand = new Hand(repeat(() => new Die(dieValue), 3))
            scoreboard.keepHand(hand, ruleSet.upperSectionRuleValueMap[dieValue]);
        }

        expect(scoreboard.getRoundOutcomes().some(x => x.rule.key === RuleKey.UpperSectionBonus)).toBe(true);
    });

    interface yahtzeeBonusApplicalbeRulesUpperSectionEmptyRuleTheroy {
        dieValue: number
    };

    const yahtzeeBonusRuleApplicableRulesUpperSectionTheories: yahtzeeBonusApplicalbeRulesUpperSectionEmptyRuleTheroy[] = [
        {dieValue: 1},
        {dieValue: 2},
        {dieValue: 3},
        {dieValue: 4},
        {dieValue: 5},
        {dieValue: 6},
    ];

    theoretically('Yahtzee bonus applicable rules should return corresponding empty upper section rule',
        yahtzeeBonusRuleApplicableRulesUpperSectionTheories,
        theory => {
            const scoreboard = getScoreboard()

            scoreboard.keepHand(getYahtzeeHand(theory.dieValue), RuleKey.Yahtzee);

            const possibleBonusRules = scoreboard.getYahtzeeBonusPossibleRules(getYahtzeeHand(theory.dieValue));
            expect(possibleBonusRules).toHaveLength(1)
            expect(possibleBonusRules[0][0].key).toBe(ruleSet.upperSectionRuleValueMap[theory.dieValue]);
        });

    interface yahtzeeBonusApplicalbeRulesUpperSectionOtherRulesTheroy {
        dieValue: number
    };

    const yahtzeeBonusRuleApplicableRulesUpperSectionOtherRulesTheories: yahtzeeBonusApplicalbeRulesUpperSectionOtherRulesTheroy[] = [
        {dieValue: 1},
        {dieValue: 2},
        {dieValue: 3},
        {dieValue: 4},
        {dieValue: 5},
        {dieValue: 6},
    ];

    theoretically('Yahtzee bonus applicable rules should return empty upper section rules',
        yahtzeeBonusRuleApplicableRulesUpperSectionOtherRulesTheories,
        theory => {
            const scoreboard = getScoreboard()

            scoreboard.keepHand(getHandWithValues(repeatValue(theory.dieValue, 4)), ruleSet.upperSectionRuleValueMap[theory.dieValue])
            scoreboard.keepHand(getYahtzeeHand(theory.dieValue), RuleKey.Yahtzee);

            const possibleBonusRules = scoreboard.getYahtzeeBonusPossibleRules(getYahtzeeHand(theory.dieValue));
            expect(possibleBonusRules).toHaveLength(Die.faces.length - 1);
            expect(possibleBonusRules.some(x => x[0].key === ruleSet.upperSectionRuleValueMap[theory.dieValue])).toBe(false);
            for(let possibleRule of possibleBonusRules) {
                expect(possibleRule[1]).toBe(0);
            }
        });

    test('Yahtzee bonus should not return any applicable rules when yahtzee hasn\'t been scored', () => {
        const scoreboard = getScoreboard();

        const possibleBonusRules = scoreboard.getYahtzeeBonusPossibleRules(getYahtzeeHand(1));
        expect(possibleBonusRules).toHaveLength(0);
    });

    test('Yahtzee bonus should return applicable lower section rules with overridden score', () => {
        const scoreboard = new Scoreboard(ruleSet);
        fillScoreboardWithUpperSectionRules(scoreboard);
        scoreboard.keepHand(getYahtzeeHand(1), RuleKey.Yahtzee);

        const hand = getYahtzeeHand(1);
        const possibleBonusRules = scoreboard.getYahtzeeBonusPossibleRules(hand)
        for(let ruleKey of Scoreboard.yahtzeeBonusRulesToSum) {
            var possibleRule = possibleBonusRules.find(x => x[0].key === ruleKey);
            expect(possibleRule).toBeTruthy();
            expect(possibleRule![1]).toBe(ruleSet.sumHand(hand))
        }
    });

    test('Yahtzee bonus should return applicable lower section rules with fixed scores', () => {
        const scoreboard = new Scoreboard(ruleSet);
        fillScoreboardWithUpperSectionRules(scoreboard);
        scoreboard.keepHand(getYahtzeeHand(1), RuleKey.Yahtzee);


        const hand = getYahtzeeHand(1);
        const possibleBonusRules = scoreboard.getYahtzeeBonusPossibleRules(hand);
        for (let [bonusRule, score] of possibleBonusRules) {
            if (Scoreboard.yahtzeeBonusRulesToSum.some(x => x === bonusRule.key))
                continue;

            expect(score).toBe(bonusRule.getScore(scoreboard, hand));
        }
    });
});