import { BehaviorSubject, map } from "rxjs";
import Hand from "./Hand";
import { Player } from "./Player";
import Rule from "./Rule";
import { RuleSet } from "./RuleSet";
import Scoreboard from "./Scoreboard";

class DiceNotRolledError extends Error
{

}

class TooManyRollsError extends Error {

}

class GameService {
    private readonly maxTurns: number = new RuleSet().ruleCount();
    private readonly maxRolls: number = 3;

    private players: Player[] = [];

    private turnsElapsed: number = 0;
    private playersTurn: number = 0;

    private rollCountSubject = new BehaviorSubject(0);
    rollCount = this.rollCountSubject.asObservable();
    hasAnotherRoll = this.rollCountSubject.pipe(map(rollCount => rollCount < this.maxRolls))

    private scoreboardSubject = new BehaviorSubject<Scoreboard | undefined>(undefined);
    scoreboard = this.scoreboardSubject.asObservable();

    private currentHandSubject = new BehaviorSubject<Hand | undefined>(undefined);
    currentHand = this.currentHandSubject.asObservable();

    startGame(names: string[]): void {
        names.forEach(name => {
            this.players.push(new Player(name));
        });

        this.playersTurn = 0;
        this.turnsElapsed = 0;

        const player = this.getCurrentPlayer();

        this.rollCountSubject.next(0);
        this.scoreboardSubject.next(player.getScoreboard());
        this.currentHandSubject.next(player.getCurrentHand());
    }

    finishGame(): void {

    }

    rollDice(diceIndiciesToRoll: number[] = []) {
        if (this.rollCountSubject.value >= this.maxRolls) {
            throw new TooManyRollsError();
        }
        
        const player = this.getCurrentPlayer();
        this.rollCountSubject.next(this.rollCountSubject.value + 1);
        player.rollDice(diceIndiciesToRoll);

        const hand = player.getCurrentHand();
        this.currentHandSubject.next(hand);
        this.scoreboardSubject.next(player.getScoreboard());
    }

    keepDice(rule: Rule) {
        if (this.rollCountSubject.value === 0) {
            throw new DiceNotRolledError()
        }

        const player = this.getCurrentPlayer();
        player.keepDice(rule);
        this.nextPlayer();
        this.currentHandSubject.next(player.getCurrentHand());
        this.scoreboardSubject.next(player.getScoreboard());
    }

    quitGame() {
        this.players = [];
        this.playersTurn = 0;
        this.turnsElapsed = 0;
        this.rollCountSubject.next(0);
    }

    private getCurrentPlayer(): Player {
        return this.players[this.playersTurn];
    }

    private nextPlayer(): void {
        this.playersTurn++;
        if (this.playersTurn >= this.players.length) {
            this.nextTurn();
        }

        const player = this.getCurrentPlayer();

        this.rollCountSubject.next(0);
        this.currentHandSubject.next(player.getCurrentHand());
        this.scoreboardSubject.next(player.getScoreboard());
    }

    private nextTurn(): void {
        this.playersTurn = 0;
        this.turnsElapsed++;
        if (this.turnsElapsed >= this.maxTurns) {
            this.finishGame();
        }
    }
}

export default GameService;