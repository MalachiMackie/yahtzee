import Hand from "./Hand";
import Rule from "./Rule";
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


    keepDice(rule: Rule): void {
        if (!this.scoreboard || !this.currentHand) {
            throw new PlayerNotInitializedError();
        }

        this.scoreboard.keepHand(this.currentHand, rule);
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
