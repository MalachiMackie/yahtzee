import Hand from "./Hand";
import { RuleKey } from "./Rule";
import { RuleSet } from "./RuleSet";
import Scoreboard from "./Scoreboard";

class PlayerNotInitializedError extends Error {

}

export class Player {
    name: string;
    private currentHand?: Hand;
    private scoreboard?: Scoreboard;

    constructor(name: string) {
        this.name = name;
        this.reset();
    }

    reset(): void {
        this.currentHand = new Hand();
        this.scoreboard = new Scoreboard(new RuleSet());
    }

    rollDice(diceIndiciesToRoll: number[]): void {
        if (!this.currentHand) {
            throw new PlayerNotInitializedError();
        }
        this.currentHand.rollDice(diceIndiciesToRoll);
    }


    keepDice(ruleKeys: RuleKey[]): void {
        if (!this.scoreboard || !this.currentHand) {
            throw new PlayerNotInitializedError();
        }

        if (ruleKeys.length === 1) {
            this.scoreboard.keepHand(this.currentHand, ruleKeys[0]);
        }
        else if (ruleKeys.length === 2 && ruleKeys.some(x => x === RuleKey.YahtzeeBonus)) {
            const otherRuleKey = ruleKeys.find(x => x !== RuleKey.YahtzeeBonus);
            if (!otherRuleKey) {
                throw new Error('Another rule must be selected other that yahtzee bonus');
            }
            this.scoreboard.applyYahtzeeBonus(this.currentHand, otherRuleKey)
        }
        this.currentHand = new Hand();
    }

    getCurrentHand(): Hand {
        if (!this.currentHand) {
            throw new PlayerNotInitializedError();
        }

        return this.currentHand;
    }

    getScoreboard(): Scoreboard {
        if (!this.scoreboard) {
            throw new PlayerNotInitializedError();
        }

        return this.scoreboard;
    }
}
