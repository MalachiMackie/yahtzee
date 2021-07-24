import './DieComponent.css'
import React from "react";

interface DieComponentProps {
    value: number;
    canSelectDie: boolean;
    onSelectionChanged: (selection: boolean) => void;
}

interface DieComponentState {
    selected: boolean
}

class DieComponent extends React.Component<DieComponentProps, DieComponentState>
{

    constructor(props: DieComponentProps) {
        super(props);

        this.state = {selected: false};

        this.onSelectionChanged = props.onSelectionChanged;
    }

    onSelectionChanged: (selection: boolean) => void;

    toggleDie() {
        if (!this.props.canSelectDie)
            return;

        this.setState({
            selected: !this.state.selected
        }, () => this.onSelectionChanged(this.state.selected));
    }

    componentDidUpdate(prevProps: DieComponentProps) {
        if (prevProps.canSelectDie !== this.props.canSelectDie) {
            this.setState({
                selected: false
            });
        }
    }

    render() {
        // const checkbox = this.props.canSelectDie ? <input type="checkbox" onChange={(event) => this.onCheckboxValueChanged(event)} /> : null;
        return (
            <div className="DieRoot">
                <div className={`Die ${this.state.selected ? 'Selected' : 'Not-Selected'}`} onClick={() => this.toggleDie()}>
                    {this.props.value}
                </div>
                {/* {checkbox} */}
            </div>
        )
    }
}

export default DieComponent;