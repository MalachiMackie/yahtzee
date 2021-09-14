import './ScoreboardRow.css'
import React, { ChangeEvent, FC, ReactElement } from "react";

interface Props {
    isSelected?: boolean;
    canSelect: boolean;
    onSelectionChanged?: (selection: boolean) => void;
    left: ReactElement;
    right: ReactElement;
}

const ScoreboardRow: FC<Props> = ({isSelected, canSelect, onSelectionChanged, left, right}) => {
    const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
        if (canSelect && !!onSelectionChanged) {
            onSelectionChanged(event.target.checked);
        }
    }

    const input = <input hidden={!canSelect} type='checkbox' checked={isSelected} onChange={(event) => onInputChanged(event)} />;

    return (
        <div className='ScoreboardRowRoot'>
            <div className='Left'>
                {input}
                <div className={canSelect ? 'HasInput' : 'HasNoInput'}>
                    {left}
                </div>
            </div>
            <div className='Right'>{right}</div>
        </div>
    );

}

export default ScoreboardRow;