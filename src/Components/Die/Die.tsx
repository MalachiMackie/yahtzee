import React, { ChangeEvent } from "react";

interface DieProps {
    value: number;
    onSelectionChanged: (selection: boolean) => void;
}

class Die extends React.Component<DieProps>
{

    constructor(props: DieProps) {
        super(props);

        this.onSelectionChanged = props.onSelectionChanged;
    }

    onSelectionChanged: (selection: boolean) => void;

    onCheckboxValueChanged(event: ChangeEvent<HTMLInputElement>) {
        this.onSelectionChanged(event.target.checked);
    }

    render() {
        return (
            <div>
                {this.props.value}
                <input type="checkbox" onChange={(event) => this.onCheckboxValueChanged(event)} />
            </div>
        )
    }
}

export default Die;