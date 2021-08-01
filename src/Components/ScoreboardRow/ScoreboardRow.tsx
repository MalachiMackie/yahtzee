import './ScoreboardRow.css'
import React, { ChangeEvent, ReactElement } from "react";

interface Props {
    isSelected?: boolean;
    canSelect: boolean;
    onSelectionChanged?: (selection: boolean) => void;
    left: ReactElement;
    right: ReactElement;
}

export default class ScoreboardRow extends React.Component<Props> {

    onInputChanged(event: ChangeEvent<HTMLInputElement>) {
        if (!this.props.canSelect || !this.props.onSelectionChanged) {
            return;
        }

        this.props.onSelectionChanged(event.target.checked);
    }

    render() {
        const input = <input hidden={!this.props.canSelect} type='checkbox' checked={this.props.isSelected} onChange={(event) => this.onInputChanged(event)} />;

        return (
            <div className='ScoreboardRowRoot'>
                <div className='Left'>
                    {input}
                    <div className={this.props.canSelect ? 'HasInput' : 'HasNoInput'}>
                        {this.props.left}
                    </div>
                </div>
                <div className='Right'>{this.props.right}</div>
            </div>
        );
    }
}