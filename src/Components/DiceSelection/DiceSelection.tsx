import React from "react";
import DieComponent from "../DieComponent/DieComponent";
import Hand from '../../Services/Hand';

interface DiceSelectionProps {
    currentHand: Hand;
    canSelectDice: boolean;
    selectedDiceIndicies: number[];
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

    componentDidUpdate(prevProps: DiceSelectionProps) {
        if (this.arraysEqual(prevProps.selectedDiceIndicies, this.props.selectedDiceIndicies))
            return;
        const selectedDice: {[index: number]: boolean} = {};

        this.props.selectedDiceIndicies.forEach(index => {
            selectedDice[index] = true;
        });

        this.setState({
            selectedDice: selectedDice
        });
    }

    arraysEqual(a: number[], b: number[]) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
      
        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        a = [...a].sort();
        b = [...b].sort();
      
        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
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
                    this.props.currentHand.getDice().map((die, index) => <DieComponent
                        onSelectionChanged={selection => this.onDieSelectionChanged(index, selection)}
                        canSelectDie={this.props.canSelectDice} value={die.getCurrentFace()}
                        key={index}/>)
                }
            </div>
        )
    }
}

export default DiceSelection;