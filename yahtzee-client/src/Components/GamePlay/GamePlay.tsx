import './GamePlay.css'
import { FC, useEffect, useMemo, useState } from "react";
import GameService from '../../Services/GameService';
import Rule, { RuleKey } from "../../Services/Rule";
import DiceSelection from "../DiceSelection/DiceSelection";
import ScoreboardComponent from "../ScoreboardComponent/ScoreboardComponent";
import Hand from '../../Services/Hand';
import { arraysEqual } from '../../Services/Utils';
import { Subscription } from 'rxjs';

interface GamePlayProps {
    gameService: GameService
}

const callIfTrue = (value: boolean, expression: () => void) => {
    if (value) expression();
}

const GamePlay: FC<GamePlayProps> = ({gameService}: GamePlayProps) => {
    const [rollCount, setRollCount] = useState(0);
    const [hasAnotherRoll, setHasAnotherRoll] = useState(true);
    const [selectedDiceIndicies, setSelectedDiceIndicies] = useState<number[]>([])
    const [selectedRules, setSelectedRules] = useState<Rule[]>([]);
    const [currentHand, setCurrentHand] = useState<Hand>();

    const subscriptions: Subscription[] = useMemo(() => [], []);

    // gs = gameService
    subscriptions.push(gameService.rollCount.subscribe(gsRollCount => callIfTrue(gsRollCount !== rollCount, () => setRollCount(gsRollCount))));
    subscriptions.push(gameService.hasAnotherRoll.subscribe(gsHasAnotherRole => callIfTrue(gsHasAnotherRole !== hasAnotherRoll, () => setHasAnotherRoll(gsHasAnotherRole))));
    subscriptions.push(gameService.currentHand.subscribe(gsCurrentHand => callIfTrue(!arraysEqual(gsCurrentHand?.getDice(), currentHand?.getDice(), undefined, undefined, false), () => setCurrentHand(gsCurrentHand))));

    useEffect(() => {
        return () => {
            subscriptions.forEach(sub => sub.unsubscribe());
        }
    }, [subscriptions]);

    function rollDice() {
        if (!currentHand)
            return;

        const dice = currentHand.getDice();
        const diceToRoll = [];
        for (let i = 0; i < dice.length; i++) {
            if (selectedDiceIndicies.every(index => index !== i))
            {
                diceToRoll.push(i);
            }
        }
        if (selectedDiceIndicies.length !== dice.length || rollCount === 0)
            gameService.rollDice(diceToRoll);
    }

    function keepDice() {
        if (selectedRules.length <= 0) {
            throw new Error('A rule must be selected');
        }
        gameService.keepDice(selectedRules.map(x => x.key));
        setSelectedDiceIndicies([]);
        setSelectedRules([]);
    }

    function onDiceSelectionChanged(indicies: number[]) {
        if (!arraysEqual(indicies, selectedDiceIndicies)) {
            setSelectedDiceIndicies(indicies);
        }
    }

    const diceSelection = !!currentHand
        ? (
            <DiceSelection onDiceSelectionChanged={selectedIndicies => onDiceSelectionChanged(selectedIndicies)}
                selectedDiceIndicies={selectedDiceIndicies}
                canSelectDice={hasAnotherRoll && rollCount > 0}
                currentHand={currentHand} />
        )
        : null;

    const selectedYahtzeeBonus = selectedRules.some(x => x.key === RuleKey.YahtzeeBonus);

    const canSelectDice: boolean = (!selectedYahtzeeBonus && selectedRules.length === 1)
        || (selectedYahtzeeBonus && selectedRules.length === 2);

    return (
        <div>
            <div className='Buttons'>
                <button disabled={!canSelectDice} onClick={() => keepDice()}>Keep Dice</button>
                <button disabled={!hasAnotherRoll} onClick={() => rollDice()}>Roll</button>
            </div>
            <div className='Dice'>
                {diceSelection}
            </div>
            <div className='Scoreboard'>
                <ScoreboardComponent gameService={gameService} onSelectedRulesChanged={selectedRules => setSelectedRules(selectedRules)} />
                <div className='RollCount'>RollCount: {rollCount}</div>
            </div>
        </div>
    )
}

export default GamePlay;