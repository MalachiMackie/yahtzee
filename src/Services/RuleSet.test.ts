import theoretically from 'jest-theories';
import { Die } from './Die';
import { Hand } from './Hand';
import { RuleSet } from './RuleSet';

describe('ruleSet', () => {
    let ruleSet: RuleSet;    

    beforeEach(() => {
        ruleSet = new RuleSet();
    });

    interface getDiceWithValuesTheory {
        handValues: number[],
        inputValues: number[],
        expectedCount: number
    }
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
    ]

    theoretically('hand with values {handValues} should return {expectedCount} item(s) when asked for values of {inputValues}',
        getDiceWithValuesTheories,
        (theory) => {
            const dice = theory.handValues.map(value => new Die(value));
            const hand = new Hand(dice);

            const returnedDice = ruleSet.getDiceWithValues(hand, theory.inputValues);
            expect(returnedDice.length).toBe(theory.expectedCount);
        }
    );

    interface getNumberOfConsecutiveValuesTheory {
        diceValues: number[],
        expectedCount: number
    }
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
            const dice = theory.diceValues.map(value => new Die(value));
            const hand = new Hand(dice);

            expect(ruleSet.getNumberOfConsecutiveValues(hand)).toBe(theory.expectedCount);
        }
    );
});