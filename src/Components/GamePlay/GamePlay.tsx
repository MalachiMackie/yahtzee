import React from "react";
import { Die } from "../../Services/Die";
import GameService from '../../Services/GameService';
import { Rule, RuleScore } from "../../Services/Rule";
import { RoundOutcome, Scoreboard } from "../../Services/Scoreboard";
import DiceSelection from "../DiceSelection/DiceSelection";
import RuleSelection from "../RuleSelection/RuleSelection";
import ScoreboardComponent from "../ScoreboardComponent/ScoreboardComponent";

interface GamePlayProps {
    name: string
}

interface GamePlayState {
    rollCount: number;
    hasAnotherRoll: boolean;
    dice: Die[];
    selectedRule?: Rule;
    availableRules: [Rule, RuleScore][];
    selectedDiceIndicies: number[];
    roundOutcomes: RoundOutcome[];
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
            selectedDiceIndicies: [],
            availableRules: [],
            roundOutcomes: []
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

        this.gameService.roundOutcomes.subscribe(roundOutcomes => {
            this.setState({
                roundOutcomes: roundOutcomes
            });
        });

        this.gameService.startGame([this.props.name]);
    }

    rollDice() {
        this.gameService.rollDice(this.state.selectedDiceIndicies);
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
        const diceSelection = this.state.rollCount > 0
            ? (
                <div>
                    <p>Your Dice:</p>
                    <DiceSelection onDiceSelectionChanged={selectedIndicies => this.onDiceSelectionChanged(selectedIndicies)}
                        canSelectDice={this.state.hasAnotherRoll}
                        dice={this.state.dice} />
                </div>
            )
            : null;

        const keepDiceButton = this.state.rollCount > 0 && this.state.selectedRule
            ? <button onClick={() => this.keepDice()}>Keep Dice</button>
            : null;
        const rollButton = this.state.hasAnotherRoll ? <button onClick={() => this.rollDice()}>Roll</button> : null;

        const scoreboard = !!this.state.roundOutcomes ? 
            (
                <div>
                    <p>Round Outcomes:</p>
                    <ScoreboardComponent roundOutcomes={this.state.roundOutcomes} />
                </div>
            )
            : null;

        return (
            <div>
                <p>Roll Count: {this.state.rollCount}</p>
                {diceSelection}
                {keepDiceButton}
                {rollButton}
                <RuleSelection onSelectedRuleChanged={selectedRule => this.onSelectedRuleChanged(selectedRule)}
                    rules={this.state.availableRules}/>
                {scoreboard}
            </div>
        )
    }
}

export default GamePlay