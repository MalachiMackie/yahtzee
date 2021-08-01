import './ScoreboardRuleComponent.css'
import React from "react";
import ScoreboardRow from "../ScoreboardRow/ScoreboardRow";
import { ScoreboardRule } from '../ScoreboardComponent/ScoreboardComponent';

interface RuleComponentProps
{
    scoreboardRule: ScoreboardRule;
    isSelected: boolean;
    onRuleSelectionChanged: (selection: boolean) => void;
}

interface RuleComponentState {
    isSelected: boolean;
}

class RuleComponent extends React.Component<RuleComponentProps, RuleComponentState>
{
    constructor(props: RuleComponentProps) {
        super(props);

        this.state = {
            isSelected: props.isSelected
        };
    }

    onSelectedChanged(isSelected: boolean) {
        this.props.onRuleSelectionChanged(isSelected);
    }

    componentDidUpdate(prevProps: RuleComponentProps) {
        if (prevProps.isSelected !== this.props.isSelected) {
            this.setState({
                isSelected: this.props.isSelected
            });
        }
    }

    render() {
        let score = this.props.scoreboardRule.score.toString();
        if (this.props.scoreboardRule.isPotentialScore)
            score = '(' + score + ')';
        let canSelect = this.props.scoreboardRule.canSelect;

        const left = <div>{this.props.scoreboardRule.rule.name + ':'}</div>;
        const right = <div>{score}</div>;

        return (
            <div className='Rule'>
                <ScoreboardRow canSelect={canSelect}
                    onSelectionChanged={isSelected => this.onSelectedChanged(isSelected)}
                    isSelected={this.state.isSelected}
                    left={left}
                    right={right} />
            </div>
        )
    }
}

export default RuleComponent;