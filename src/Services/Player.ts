import { Hand } from "./Hand";
import { Rule } from "./Rule";
import { RuleSet } from "./RuleSet";
import { Scoreboard } from "./Scoreboard";

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

    rollDice(diceToRoll: number[]): void {
        if (!this.currentHand) {
            throw new PlayerNotInitializedError();
        }
        this.currentHand.rollDice(diceToRoll);
    }


    keepDice(ruleKey: number): void {
        if (!this.scoreboard || !this.currentHand) {
            throw new PlayerNotInitializedError();
        }

        this.scoreboard.keepHand(this.currentHand, ruleKey);
        this.currentHand = new Hand();
    }

    getCurrentHand(): Hand {
        if (!this.currentHand) {
            throw new PlayerNotInitializedError();
        }

        return this.currentHand;
    }

    getAvailableRules(): Rule[] {
        if (!this.scoreboard || !this.currentHand) {
            throw new PlayerNotInitializedError();
        }

        return this.scoreboard.getAvailableRules().filter(rule => rule.isApplicableToHand(this.currentHand!));
    }
}
