import React from "react";
import GameService from '../../Services/GameService';
import Die from "../Die/Die";

interface GamePlayProps {
    name: string
}

interface GamePlayState {
    rollCount: number;
    hasAnotherRoll: boolean;
    dice: number[];
    availableRules: [number, string, number][];
    selectedDice: {[dieKey: number]: boolean};
}

class GamePlay extends React.Component<GamePlayProps, GamePlayState> {
    gameService: GameService;

    constructor(props: GamePlayProps) {
        super(props);

        this.gameService = new GameService();
        this.state = {
            rollCount: 0,
            hasAnotherRoll: true,
            dice: [],
            availableRules: [],
            selectedDice: {}
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

        this.gameService.dice.subscribe(dice =>  {
            this.setState({
                dice: dice
            });
        });

        this.gameService.availableRules.subscribe(rules => {
            this.setState({
                availableRules: rules
            });
        });

        this.gameService.startGame([this.props.name]);
    }

    rollDice() {
        let diceToRoll: number[] = [];
        const indexes: number[] = Object.keys(this.state.selectedDice).map(index => parseInt(index));
        const selectedIndexes = indexes.filter(index => this.state.selectedDice[index]);

        for(let index of selectedIndexes) {
            diceToRoll.push(index);
        }
        this.gameService.rollDice(diceToRoll);
    }

    keepDice() {
        this.gameService.keepDice(this.state.availableRules[0][0]);
    }

    onDieSelectionChanged(index: number, value: boolean) {
        this.setState({
            selectedDice: {
                ...this.state.selectedDice,
                [index]: value
            }
        });
    }

    render() {
        const keepDiceButton = this.state.rollCount > 0 ? <button onClick={() => this.keepDice()}>Keep Dice</button> : null;
        const rollButton = this.state.hasAnotherRoll ? <button onClick={() => this.rollDice()}>Roll</button> : null;

        return (
            <div>
                <p>Roll Count: {this.state.rollCount}</p>
                <p>Your Dice:</p> {
                    this.state.dice.length > 0
                        ? this.state.dice.map((die, index) => <Die value={die} onSelectionChanged={(value) => this.onDieSelectionChanged(index, value)}></Die>)
                        : "Please Roll"
                }
                {keepDiceButton}
                {rollButton}
                <ul>
                    {this.state.availableRules.map(([key, name, score]) => <li key={key}>{name}: {score}</li>)}
                </ul>
            </div>
        )
    }
}

export default GamePlay