import './ScoreboardRow.css'
import React, { ChangeEvent, ReactElement } from "react";

interface Props {
    isSelected?: boolean;
    canSelect: boolean;
    onSelectionChanged?: (selection: boolean) => void;
    left: ReactElement;
    right: ReactElement;
}

interface State {
    isSelected?: boolean;
}

export default class ScoreboardRow extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        if (props.canSelect && !!props.isSelected) {
            this.state = {
                isSelected: props.isSelected
            };
            return;
        }

        this.state = {};
    }

    onInputChanged(event: ChangeEvent<HTMLInputElement>) {
        if (this.props.canSelect && !!this.props.onSelectionChanged && !!this.state.isSelected) {
            return;
        }

        this.setState({
            isSelected: event.target.checked
        }, () => this.props.onSelectionChanged!(this.state.isSelected!));
    }

    render() {
        const input = this.props.canSelect ? <input type='checkbox' checked={this.state.isSelected} onChange={(event) => this.onInputChanged(event)} /> : null;

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