import './ScoreboardComponent.css'
import React, { ReactElement } from "react";
import Hand from "../../Services/Hand";
import Rule, { RuleScore, RuleSection } from "../../Services/Rule";
import Scoreboard from "../../Services/Scoreboard";
import ScoreboardRuleComponent from '../ScoreboardRuleComponent/ScoreboardRuleComponent';
import ScoreboardRow from '../ScoreboardRow/ScoreboardRow';

interface ScoreboardComponentProps {
    scoreboard: Scoreboard;
    currentHand: Hand;
    selectedRule?: Rule;
    rollCount: number;
    onSelectedRuleChanged: (selectedRule?: Rule) => void;
}

interface ScoreboardComponentState {
    selectedRule?: Rule
    selectableUpperSectionRules: ScoreboardRule[];
    selectableLowerSectionRules: ScoreboardRule[];
    notSelectableUpperSectionRules: ScoreboardRule[];
    notSelectableLowerSectionRules: ScoreboardRule[];
    currentHand: Hand,
    rollCount: number,
    scoreboard: Scoreboard
}

type ScoreboardRule = {rule: Rule, score: RuleScore, isPotentialScore: boolean};

class ScoreboardComponent extends React.Component<ScoreboardComponentProps, ScoreboardComponentState>
{
    private static sortRulesByKey(a: ScoreboardRule, b: ScoreboardRule): number {
        if (a.rule.key > b.rule.key) {
            return 1;
        }

        if (a.rule.key < b.rule.key) {
            return -1;
        }

        return 0;
    }

    constructor(props: ScoreboardComponentProps) {
        super(props);

        const rules = this.getRules(props.scoreboard, props.currentHand, props.rollCount);

        this.state = {
            selectedRule: props.selectedRule,
            selectableUpperSectionRules: rules.filter(scoreboardRule => scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Upper),
            selectableLowerSectionRules: rules.filter(scoreboardRule => scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Lower),
            notSelectableUpperSectionRules: rules.filter(scoreboardRule => !scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Upper),
            notSelectableLowerSectionRules: rules.filter(scoreboardRule => !scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Lower),
            currentHand: props.currentHand,
            rollCount: props.rollCount,
            scoreboard: props.scoreboard
        };
    }

    componentDidUpdate(prevProps: ScoreboardComponentProps) {
        if (prevProps.rollCount === this.props.rollCount) {
            return;
        }

        const rules = this.getRules(this.props.scoreboard, this.props.currentHand, this.props.rollCount);
        this.setState({
            selectableUpperSectionRules: rules.filter(scoreboardRule => scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Upper),
            selectableLowerSectionRules: rules.filter(scoreboardRule => scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Lower),
            notSelectableUpperSectionRules: rules.filter(scoreboardRule => !scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Upper),
            notSelectableLowerSectionRules: rules.filter(scoreboardRule => !scoreboardRule.rule.canSelect && scoreboardRule.rule.section === RuleSection.Lower),
            rollCount: this.props.rollCount,
            currentHand: this.props.currentHand,
            scoreboard: this.props.scoreboard,
            selectedRule: this.props.selectedRule
        });
    }

    private getRules(scoreboard: Scoreboard, currentHand: Hand, rollCount: number): ScoreboardRule[] {

        const availableRules = scoreboard.getAvailableRules()
        const roundOutcomes = scoreboard.getRoundOutcomes();

        let rules: ScoreboardRule[] =[];
        availableRules.forEach(availableRule => {
            rules.push({
                rule: availableRule,
                score: rollCount > 0 ? availableRule.getScore(currentHand, scoreboard, availableRule.key) : 0,
                isPotentialScore: availableRule.canSelect
            });
        })
        roundOutcomes.forEach(roundOutcome => {
            rules.push({rule: roundOutcome.rule, score: roundOutcome.rule.getScore(roundOutcome.hand, scoreboard, roundOutcome.rule.key), isPotentialScore: false})
        });

        rules = rules.sort(ScoreboardComponent.sortRulesByKey);
        return rules;
    }

    setSelectedRule(rule?: Rule) {
        this.setState({
            selectedRule: rule
        }, () => this.props.onSelectedRuleChanged(this.state.selectedRule));
    }

    onRuleSelectionChanged(selectedRule?: Rule) {

        if (selectedRule !== this.state.selectedRule) {
            this.setSelectedRule(selectedRule);
        }
    }

    getRuleComponentFromRule(scoreboardRule: ScoreboardRule): ReactElement {
        return (<ScoreboardRuleComponent key={scoreboardRule.rule.key} onRuleSelectionChanged={isSelected => this.onRuleSelectionChanged(isSelected ? scoreboardRule.rule : undefined)} scoreboardRule={scoreboardRule} canSelect={this.state.rollCount > 0} isSelected={this.state.selectedRule === scoreboardRule.rule} />)
    }

    private getScoreboardRuleScore(scoreboardRule: ScoreboardRule): number {
        return scoreboardRule.isPotentialScore
            ? 0
            : scoreboardRule.score
    }

    render() {
        return (
            <div className='ScoreboardRoot'>
                <h1>Scoreboard</h1>
                <h2>Upper Section</h2>
                {this.state.selectableUpperSectionRules.map(scoreboardRule => this.getRuleComponentFromRule(scoreboardRule))}
                
                <ScoreboardRow canSelect={false} left={<div>{'Total:'}</div>} right={<div>{this.state.selectableUpperSectionRules.map(this.getScoreboardRuleScore).reduce((a: number, b: number) => a + b, 0).toString()}</div>} />
                {this.state.notSelectableUpperSectionRules.map(scoreboardRule => this.getRuleComponentFromRule(scoreboardRule))}

                <h2>Lower Section</h2>
                {this.state.selectableLowerSectionRules.map(scoreboardRule => this.getRuleComponentFromRule(scoreboardRule))}
            </div>
        );
    }
}

export default ScoreboardComponent;