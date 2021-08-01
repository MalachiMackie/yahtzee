import './GamePlay.css'
import React, { FormEvent } from "react";
import GameService from '../../Services/GameService';
import Rule, { RuleKey } from "../../Services/Rule";
import Scoreboard from "../../Services/Scoreboard";
import DiceSelection from "../DiceSelection/DiceSelection";
import ScoreboardComponent from "../ScoreboardComponent/ScoreboardComponent";
import Hand from '../../Services/Hand';

interface GamePlayProps {
    name: string
}

interface GamePlayState {
    rollCount: number;
    hasAnotherRoll: boolean;
    selectedRules: Rule[];
    selectedDiceIndicies: number[];
    scoreboard?: Scoreboard;
    currentHand?: Hand;
}

export default class GamePlay extends React.Component<GamePlayProps, GamePlayState> {
    gameService: GameService;

    constructor(props: GamePlayProps) {
        super(props);

        this.gameService = new GameService();
        this.state = {
            rollCount: 0,
            hasAnotherRoll: true,
            selectedDiceIndicies: [],
            selectedRules: []
        };

        this.gameService.rollCount.subscribe(rollCount => {
            this.setState({
                rollCount: rollCount
            });
        });

        this.gameService.hasAnotherRoll.subscribe(hasAnotherRoll => {
            this.setState({
                hasAnotherRoll: hasAnotherRoll
            });
        });

        this.gameService.currentHand.subscribe(currentHand => {
            this.setState({
                currentHand: currentHand
            });
        });

        this.gameService.scoreboard.subscribe(scoreboard =>  {
            this.setState({
                scoreboard: scoreboard
            });
        });
    }

    componentDidMount() {
        this.startGame();
    }

    startGame() {
        this.gameService.startGame([this.props.name]);
    }

    rollDice() {
        if (!this.state.currentHand)
            return;

        const dice = this.state.currentHand.getDice();
        const diceToRoll = [];
        for (let i = 0; i < dice.length; i++) {
            if (this.state.selectedDiceIndicies.every(index => index !== i))
            {
                diceToRoll.push(i);
            }
        }
        this.gameService.rollDice(diceToRoll);
    }

    onKeepDiceChanged(event: FormEvent<HTMLButtonElement>) {
        if (event.currentTarget.disabled)
            return;
        
        this.keepDice();
    }

    keepDice() {
        if (this.state.selectedRules.length <= 0) {
            throw new Error('A rule must be selected');
        }
        this.gameService.keepDice(this.state.selectedRules.map(x => x.key));
        this.setState({
            selectedDiceIndicies: [],
            selectedRules: []
        });
    }

    onDiceSelectionChanged(indicies: number[]) {
        this.setState({
            selectedDiceIndicies: indicies
        });
    }

    onSelectedRuleChanged(rules: Rule[]) {
        this.setState({
            selectedRules: rules
        });
    }

    render() {
        const diceSelection = !!this.state.currentHand
            ? (
                <DiceSelection onDiceSelectionChanged={selectedIndicies => this.onDiceSelectionChanged(selectedIndicies)}
                    selectedDiceIndicies={this.state.selectedDiceIndicies}
                    canSelectDice={this.state.hasAnotherRoll && this.state.rollCount > 0}
                    currentHand={this.state.currentHand} />
            )
            : null;

        const scoreboard = !!this.state.scoreboard && this.state.currentHand ?
            (
                <ScoreboardComponent rollCount={this.state.rollCount}
                    selectedRules={this.state.selectedRules}
                    onSelectedRuleChanged={selectedRules => this.onSelectedRuleChanged(selectedRules)}
                    scoreboard={this.state.scoreboard}
                    currentHand={this.state.currentHand} />
            )
            : null;

        const selectedYahtzeeBonus = this.state.selectedRules.some(x => x.key === RuleKey.YahtzeeBonus);

        const canSelectDice: boolean = (!selectedYahtzeeBonus && this.state.selectedRules.length === 1)
            || (selectedYahtzeeBonus && this.state.selectedRules.length === 2);

        return (
            <div>
                <div className='Buttons'>
                    <button disabled={!canSelectDice} onClick={() => this.keepDice()}>Keep Dice</button>
                    <button disabled={!this.state.hasAnotherRoll} onClick={() => this.rollDice()}>Roll</button>
                </div>
                <div className='Dice'>
                    {diceSelection}
                </div>
                <div className='Scoreboard'>
                    {scoreboard}
                    <div className='RollCount'>RollCount: {this.state.rollCount}</div>
                </div>
            </div>
        )
    }
}