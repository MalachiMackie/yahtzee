import './ScoreboardRuleComponent.css'
import { FC } from "react";
import ScoreboardRow from "../ScoreboardRow/ScoreboardRow";
import { ScoreboardRule } from '../ScoreboardComponent/ScoreboardComponent';
import { RuleKey } from '../../Services/Rule';
import Scoreboard from '../../Services/Scoreboard';
import Hand from '../../Services/Hand';

interface Props
{
    scoreboard?: Scoreboard;
    currentHand?: Hand
    scoreboardRule: ScoreboardRule;
    isSelected: boolean;
    onRuleSelectionChanged: (selection: boolean) => void;
}

const RuleComponent: FC<Props> = ({scoreboard, currentHand, scoreboardRule, isSelected, onRuleSelectionChanged}) => {

    let scoreDisplay = scoreboardRule.score.toString();
    if (scoreboardRule.isPotentialScore)
        scoreDisplay = `(${scoreDisplay})`;

    if (scoreboardRule.rule.key === RuleKey.YahtzeeBonus && !!scoreboard && scoreboard.getRoundOutcomes().some(x => x.rule.key === RuleKey.YahtzeeBonus))
    {
        if (scoreboardRule.canSelect) {
            scoreDisplay = `${scoreboardRule.rule.getScoreIfApplicable(scoreboard, currentHand)}`
        }
        else {
            scoreDisplay = '0';
        }
        scoreDisplay = `${scoreboardRule.score} + (${scoreDisplay})`
    }

    let canSelect = scoreboardRule.canSelect;

    const left = <div>{scoreboardRule.rule.name + ':'}</div>;
    const right = <div>{scoreDisplay}</div>;

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