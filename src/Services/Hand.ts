import { Die } from "./Die";
import { arraysEqual } from "./Utils";

export class TooManyDiceForHandError extends Error {

}

export default class Hand {
    static readonly maxDice: number = 5;
    private dice: Die[] = [];

    constructor(dice?: Die[]) {
        this.setup(dice);
    }

    private setup(dice?: Die[]) {
        if (!!dice && dice.length > Hand.maxDice) {
            throw new TooManyDiceForHandError()
        }

        if (!!dice) {
            this.dice = dice;
            return;
        }
        
        for (let i = 0; i < Hand.maxDice; i++) {
            this.dice[i] = new Die()
        }
    }

    rollDice(diceIndiciesToRoll?: number[]) {
        if (!diceIndiciesToRoll || !diceIndiciesToRoll.some(() => true)) {
            diceIndiciesToRoll = [];
            for (let i = 0; i < Hand.maxDice; i++) {
                diceIndiciesToRoll.push(i);
            }
        }

        for (let index of diceIndiciesToRoll) {
            this.dice[index].roll();
        }
    }

    getDice(): Die[] {
        return this.dice;
    }

    equals(other?: Hand): boolean {
        return !!other && arraysEqual(other.dice.map(x => x.getCurrentFace()), this.dice.map(x => x.getCurrentFace()), undefined, undefined, false);
    }
}
