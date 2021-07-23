import React from "react";
import { RoundOutcome } from "../../Services/Scoreboard";

interface ScoreboardComponentProps {
    roundOutcomes: RoundOutcome[];
}

interface ScoreboardComponentState {

}

class ScoreboardComponent extends React.Component<ScoreboardComponentProps, ScoreboardComponentState>
{
    render() {
        return (
            <ul>
                {this.props.roundOutcomes.map(outcome => {
                    return (<li key={outcome.rule.key}>{outcome.rule.name}: {outcome.rule.getScore(outcome.hand)}</li>);
                })}
            </ul>
        );
    }
}

export default ScoreboardComponent;