import React from "react";
import { Die } from "../../Services/Die";
import DieComponent from "../DieComponent/DieComponent";

interface DiceSelectionProps {
    dice: Die[];
    canSelectDice: boolean;
    onDiceSelectionChanged: (selectedDiceIndicies: number[]) => void;
}

interface DiceSelectionState {
    selectedDice: {[dieIndex: number]: boolean}
}

class DiceSelection extends React.Component<DiceSelectionProps, DiceSelectionState>
{
    constructor(props: DiceSelectionProps) {
        super(props);

        this.state = {
            selectedDice: {}
        };
    }

    private getSelectedDiceIndicies(): number[] {
        const indicies = Object.keys(this.state.selectedDice).map(indexStr => parseInt(indexStr));
        return indicies.filter(index => this.state.selectedDice[index]);
    }

    onDieSelectionChanged(dieIndex: number, selection: boolean) {
        this.setState({
            selectedDice: {
                ...this.state.selectedDice,
                [dieIndex]: selection
            }
        }, () => {
            this.props.onDiceSelectionChanged(this.getSelectedDiceIndicies());
        });
    }

    render() {
        return (
            <div>
                {
                    this.props.dice.map((die, index) => <DieComponent
                        onSelectionChanged={selection => this.onDieSelectionChanged(index, selection)}
                        canSelectDie={this.props.canSelectDice} value={die.getCurrentFace()}
                        key={index}/>)
                }
            </div>
        )
    }
}

export default DiceSelection;