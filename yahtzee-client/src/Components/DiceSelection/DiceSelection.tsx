import { FC, useEffect, useRef, useState } from "react";
import DieComponent from "../DieComponent/DieComponent";
import Hand from '../../Services/Hand';
import { arraysEqual } from "../../Services/Utils";

interface DiceSelectionProps {
    currentHand: Hand;
    canSelectDice: boolean;
    selectedDiceIndicies: number[];
    onDiceSelectionChanged: (selectedDiceIndicies: number[]) => void;
}

const DiceSelection: FC<DiceSelectionProps> = ({currentHand, canSelectDice, selectedDiceIndicies: propsSelectedDice, onDiceSelectionChanged}: DiceSelectionProps) => {
    const tempSelectedDice: {[dieIndex: number]: boolean} = {};
    propsSelectedDice.forEach(x => {
        tempSelectedDice[x] = true;
    })
    const [selectedDice, setSelectedDice] = useState(tempSelectedDice);

    const prevSelectedDiceRef = useRef<number[]>(propsSelectedDice);
    const prevSelectedDice = prevSelectedDiceRef.current;

    if (!arraysEqual(prevSelectedDice, propsSelectedDice) && !arraysEqual(propsSelectedDice, getSelectedDiceIndicies(selectedDice))) {
        setSelectedDice(tempSelectedDice);
    }

    useEffect(() => {
        prevSelectedDiceRef.current = propsSelectedDice;
    });

    useEffect(() => {
        onDiceSelectionChanged(getSelectedDiceIndicies(selectedDice));
    }, [selectedDice, onDiceSelectionChanged])

    function getSelectedDiceIndicies(value: {[index: number]: boolean}): number[] {
        const indicies = Object.keys(value).map(indexStr => parseInt(indexStr));
        return indicies.filter(index => value[index]);
    }

    function onDieSelectionChanged(dieIndex: number, selection: boolean) {
        if (selection === selectedDice[dieIndex])
            return;

        setSelectedDice({
            ...selectedDice,
            [dieIndex]: selection
        });
    }

    return (
        <div>
            {
                currentHand.getDice().map((die, index) => <DieComponent
                    selected={selectedDice[index] ?? false}
                    onSelectionChanged={selection => onDieSelectionChanged(index, selection)}
                    canSelectDie={canSelectDice} value={die.getCurrentFace()}
                    key={index}/>)
            }
        </div>
    )
};

export default DiceSelection;