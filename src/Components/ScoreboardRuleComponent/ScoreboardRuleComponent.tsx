import React, { ChangeEvent } from "react";
import Rule, { RuleScore } from "../../Services/Rule";

interface ScoreboardRule {
    rule: Rule,
    score: RuleScore,
    isPotentialScore: boolean
}

interface RuleComponentProps
{
    scoreboardRule: ScoreboardRule;
    isSelected: boolean;
    canSelect: boolean
    onRuleSelectionChanged: (selection: boolean) => void;
}

class RuleComponent extends React.Component<RuleComponentProps>
{
    onInputChanged(event: ChangeEvent<HTMLInputElement>) {
        this.props.onRuleSelectionChanged(event.target.checked);
    }

    render() {
        let score = this.props.scoreboardRule.score.toString();
        if (this.props.scoreboardRule.isPotentialScore)
            score = '(' + score + ')';

        const input = <input type='checkbox' checked={this.props.isSelected} onChange={event => this.onInputChanged(event)} />;

        return (
            <div className='Rule'>
                {this.props.canSelect ? input : null}
                <div className='RuleName'>{this.props.scoreboardRule.rule.name}:</div>
                <div className='RuleScore'>{score}</div>
            </div>
        )
    }
}

export default RuleComponent;