import React, { ChangeEvent } from "react";

interface DieComponentProps {
    value: number;
    canSelectDie: boolean;
    onSelectionChanged: (selection: boolean) => void;
}

class DieComponent extends React.Component<DieComponentProps>
{

    constructor(props: DieComponentProps) {
        super(props);

        this.onSelectionChanged = props.onSelectionChanged;
    }

    onSelectionChanged: (selection: boolean) => void;

    onCheckboxValueChanged(event: ChangeEvent<HTMLInputElement>) {
        this.onSelectionChanged(event.target.checked);
    }

    render() {
        const checkbox = this.props.canSelectDie ? <input type="checkbox" onChange={(event) => this.onCheckboxValueChanged(event)} /> : null;
        return (
            <div>
                {this.props.value}
                {checkbox}
            </div>
        )
    }
}

export default DieComponent;