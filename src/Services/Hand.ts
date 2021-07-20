import { Die } from "./Die";

export class Hand {
    private readonly maxDice: number = 5;
    private dice: Die[] = [];

    constructor() {
        this.setup();
    }

    private setup() {
        for (let i = 0; i < this.maxDice; i++) {
            this.dice[i] = new Die();
        }
    }

    rollDice(diceToRoll?: number[]) {
        if (!diceToRoll || !diceToRoll.some(() => true)) {
            diceToRoll = [];
            for (let i = 0; i < this.maxDice; i++) {
                diceToRoll.push(i);
            }
        }

        for (let i = 0; i < this.maxDice; i++) {
            this.dice[i].roll();
        }
    }

    getDiceValues(): number[] {
        return this.dice.map(die => die.getCurrentFace());
    }
}
