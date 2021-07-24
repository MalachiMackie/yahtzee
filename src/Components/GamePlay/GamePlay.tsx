import './GamePlay.css'
import React, { FormEvent } from "react";
import GameService from '../../Services/GameService';
import Rule from "../../Services/Rule";
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
    selectedRule?: Rule;
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
            selectedDiceIndicies: []
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
        if (!this.state.selectedRule) {
            throw new Error('No rule is selected');
        }
        this.gameService.keepDice(this.state.selectedRule);
        this.setState({
            selectedDiceIndicies: [],
            selectedRule: undefined
        })
    }

    onDiceSelectionChanged(indicies: number[]) {
        this.setState({
            selectedDiceIndicies: indicies
        });
    }

    onSelectedRuleChanged(rule?: Rule) {
        this.setState({
            selectedRule: rule
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
                    selectedRule={this.state.selectedRule}
                    onSelectedRuleChanged={selectedRule => this.onSelectedRuleChanged(selectedRule)}
                    scoreboard={this.state.scoreboard}
                    currentHand={this.state.currentHand} />
            )
            : null;

        return (
            <div>
                <div className='Buttons'>
                    <button disabled={!this.state.selectedRule} onClick={() => this.keepDice()}>Keep Dice</button>
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