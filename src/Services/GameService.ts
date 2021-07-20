import { BehaviorSubject, map, Observable } from "rxjs";
import { Player } from "./Player";
import { RuleSet } from "./RuleSet";

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

    private rollCountSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    rollCount: Observable<number> = this.rollCountSubject.asObservable();
    hasAnotherRoll: Observable<boolean> = this.rollCountSubject.pipe(map(rollCount => rollCount < this.maxRolls))

    private diceSubject: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
    dice: Observable<number[]> = this.diceSubject.asObservable();

    private availableRulesSubject: BehaviorSubject<[number, string, number][]> = new BehaviorSubject<[number, string, number][]>([]);
    availableRules: Observable<[number, string, number][]> = this.availableRulesSubject.asObservable();

    startGame(names: string[]): void {
        names.forEach(name => {
            this.players.push(new Player(name));
        });

        this.playersTurn = 0;
        this.turnsElapsed = 0;
        this.rollCountSubject.next(0);
    }

    finishGame(): void {

    }

    rollDice(diceToRoll: number[] = []) {
        if (this.rollCountSubject.value >= this.maxRolls) {
            throw new TooManyRollsError();
        }
        
        const player = this.currentPlayer();
        this.rollCountSubject.next(this.rollCountSubject.value + 1);
        player.rollDice(diceToRoll);

        const hand = player.getCurrentHand();

        this.diceSubject.next(hand.getDiceValues());
        const availableRules: [number, string, number][] = player.getAvailableRules().map(rule => [rule.key, rule.name, rule.getScore(hand)]);
        this.availableRulesSubject.next(availableRules);
    }

    keepDice(ruleKey: number) {
        if (this.rollCountSubject.value === 0) {
            throw new DiceNotRolledError()
        }

        const player = this.currentPlayer();
        player.keepDice(ruleKey);
        this.nextPlayer();
    }

    quitGame() {
        this.players = [];
        this.playersTurn = 0;
        this.turnsElapsed = 0;
        this.rollCountSubject.next(0);
    }

    private currentPlayer(): Player {
        return this.players[this.playersTurn];
    }

    private nextPlayer(): void {
        this.playersTurn++;
        if (this.playersTurn >= this.players.length) {
            this.nextTurn();
        }

        this.rollCountSubject.next(0);
        this.diceSubject.next([]);
        this.availableRulesSubject.next([]);
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