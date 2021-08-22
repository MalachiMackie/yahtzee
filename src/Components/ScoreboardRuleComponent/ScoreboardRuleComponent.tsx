import './ScoreboardRuleComponent.css'
import { FC } from "react";
import ScoreboardRow from "../ScoreboardRow/ScoreboardRow";
import { ScoreboardRule } from '../ScoreboardComponent/ScoreboardComponent';

interface Props
{
    scoreboardRule: ScoreboardRule;
    isSelected: boolean;
    onRuleSelectionChanged: (selection: boolean) => void;
}

const RuleComponent: FC<Props> = ({scoreboardRule, isSelected, onRuleSelectionChanged}) => {

    let score = scoreboardRule.score.toString();
    if (scoreboardRule.isPotentialScore)
        score = '(' + score + ')';
    let canSelect = scoreboardRule.canSelect;

    const left = <div>{scoreboardRule.rule.name + ':'}</div>;
    const right = <div>{score}</div>;

    return (
        <div className='Rule'>
            <ScoreboardRow canSelect={canSelect}
                onSelectionChanged={isSelected => onRuleSelectionChanged(isSelected)}
                isSelected={isSelected}
                left={left}
                right={right} />
        </div>
    )
}

export default RuleComponent;