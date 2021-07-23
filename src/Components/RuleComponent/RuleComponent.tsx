import React, { ChangeEvent } from "react";
import { Rule, RuleScore } from "../../Services/Rule";

interface RuleComponentProps
{
    rule: [Rule, RuleScore];
    isSelected: boolean;
    onRuleSelectionChanged: (selection: boolean) => void;
}

class RuleComponent extends React.Component<RuleComponentProps>
{
    onInputChanged(event: ChangeEvent<HTMLInputElement>) {
        this.props.onRuleSelectionChanged(event.target.checked);
    }

    render() {
        return (
            <div>
                <input type='radio' checked={this.props.isSelected} onChange={event => this.onInputChanged(event)} />
                { this.props.rule[0].name }: { this.props.rule[1] }
            </div>
        );
    }
}

export default RuleComponent;