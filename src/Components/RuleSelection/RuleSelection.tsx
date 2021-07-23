import React from "react";
import { Rule, RuleScore } from "../../Services/Rule";
import RuleComponent from "../RuleComponent/RuleComponent";

interface RuleSelectionProps
{
    rules: [Rule, RuleScore][];
    onSelectedRuleChanged: (rule?: Rule) => void;
}

interface RuleSelectionState
{
    selectedRule?: Rule;
}

class RuleSelection extends React.Component<RuleSelectionProps, RuleSelectionState>
{
    constructor(props: RuleSelectionProps) {
        super(props);

        this.state = {}
    }

    onRuleSelectionChanged(rule: Rule, selected: boolean) {
        const onStateChanged = () => this.props.onSelectedRuleChanged(this.state.selectedRule);
        if (selected) {
            this.setState({
                selectedRule: rule
            }, onStateChanged);
        }

        if (rule === this.state.selectedRule) {
            this.setState({
                selectedRule: undefined
            }, onStateChanged);
        }
    }

    render() {
        return (
            <div>
                {this.props.rules.map(rule => <RuleComponent
                    key={rule[0].key}
                    rule={rule}
                    isSelected={this.state.selectedRule === rule[0]}
                    onRuleSelectionChanged={selection => this.onRuleSelectionChanged(rule[0], selection)}></RuleComponent>)}
            </div>
        )
    }
}

export default RuleSelection;