import './ScoreboardRuleComponent.css'
import React from "react";
import Rule, { RuleScore } from "../../Services/Rule";
import ScoreboardRow from "../ScoreboardRow/ScoreboardRow";

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
    onSelectedChanged(isSelected: boolean) {
        this.props.onRuleSelectionChanged(isSelected);
    }

    render() {
        let score = this.props.scoreboardRule.score.toString();
        if (this.props.scoreboardRule.isPotentialScore)
            score = '(' + score + ')';
        let canSelect = this.props.canSelect && this.props.scoreboardRule.isPotentialScore;

        return (
            <div className='Rule'>
                
                <ScoreboardRow canSelect={canSelect} onSelectionChanged={isSelected => this.onSelectedChanged(isSelected)} isSelected={this.props.isSelected} left={<div>{this.props.scoreboardRule.rule.name + ':'}</div>} right={<div>{score}</div>} />
                
                {/* <div className='RuleName'>{this.props.scoreboardRule.rule.name}:</div>
                <div className='RuleScore'>{score}</div> */}
            </div>
        )
    }
}

export default RuleComponent;