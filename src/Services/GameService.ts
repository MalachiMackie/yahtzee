import { BehaviorSubject, map, Observable } from "rxjs";
import { Die } from "./Die";
import { Player } from "./Player";
import { Rule, RuleScore } from "./Rule";
import { RuleSet } from "./RuleSet";
import { RoundOutcome } from "./Scoreboard";

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

    private diceSubject: BehaviorSubject<Die[]> = new BehaviorSubject<Die[]>([]);
    dice: Observable<Die[]> = this.diceSubject.asObservable();

    private availableRulesSubject = new BehaviorSubject<[Rule, RuleScore][]>([]);
    availableRules: Observable<[Rule, RuleScore][]> = this.availableRulesSubject.asObservable();

    private roundOutcomesSubject = new BehaviorSubject<RoundOutcome[]>([]);
    roundOutcomes: Observable<RoundOutcome[]> = this.roundOutcomesSubject.asObservable();


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

    rollDice(diceIndiciesToRoll: number[] = []) {
        if (this.rollCountSubject.value >= this.maxRolls) {
            throw new TooManyRollsError();
        }
        
        const player = this.currentPlayer();
        this.rollCountSubject.next(this.rollCountSubject.value + 1);
        player.rollDice(diceIndiciesToRoll);

        const hand = player.getCurrentHand();

        this.diceSubject.next(hand.getDice());
        const availableRules: [Rule, RuleScore][] = player.getAvailableRules().map(rule => [rule, rule.getScore(hand)]);
        this.availableRulesSubject.next(availableRules);
    }

    keepDice(rule: Rule) {
        if (this.rollCountSubject.value === 0) {
            throw new DiceNotRolledError()
        }

        const player = this.currentPlayer();
        player.keepDice(rule);
        this.nextPlayer();

        this.roundOutcomesSubject.next(player.getRoundOutcomes());
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