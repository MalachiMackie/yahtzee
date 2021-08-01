import './ScoreboardComponent.css'
import React, { ReactElement } from "react";
import Hand from "../../Services/Hand";
import Rule, { RuleKey, RuleScore, RuleSection } from "../../Services/Rule";
import Scoreboard from "../../Services/Scoreboard";
import ScoreboardRuleComponent from '../ScoreboardRuleComponent/ScoreboardRuleComponent';
import ScoreboardRow from '../ScoreboardRow/ScoreboardRow';

interface ScoreboardComponentProps {
    scoreboard: Scoreboard;
    currentHand: Hand;
    selectedRules: Rule[];
    rollCount: number;
    onSelectedRuleChanged: (selectedRules: Rule[]) => void;
}

interface ScoreboardComponentState {
    selectedRules: Rule[];
    rules: ScoreboardRule[];
    currentHand: Hand,
    rollCount: number,
    scoreboard: Scoreboard
}

export type ScoreboardRule = {rule: Rule, score: RuleScore, isPotentialScore: boolean, canSelect: boolean};

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

    private canSelectRule(scoreboardRule: ScoreboardRule): boolean {
        return scoreboardRule.rule.canSelect(this.props.scoreboard, this.props.currentHand);
    }

    constructor(props: ScoreboardComponentProps) {
        super(props);

        const rules = this.getRules(props.scoreboard, props.currentHand, props.rollCount, props.selectedRules);

        this.state = {
            selectedRules: props.selectedRules,
            rules: rules,
            currentHand: props.currentHand,
            rollCount: props.rollCount,
            scoreboard: props.scoreboard
        };
    }

    componentDidUpdate(prevProps: ScoreboardComponentProps) {
        if (prevProps.rollCount === this.props.rollCount) {
            return;
        }

        const rules = this.getRules(this.props.scoreboard, this.props.currentHand, this.props.rollCount, this.props.selectedRules);
        this.setState({
            rules: rules,
            rollCount: this.props.rollCount,
            currentHand: this.props.currentHand,
            scoreboard: this.props.scoreboard,
            selectedRules: this.props.selectedRules
        });
    }

    private getRules(scoreboard: Scoreboard, currentHand: Hand, rollCount: number, selectedRules: Rule[]): ScoreboardRule[] {
        const availableRules = scoreboard.getAvailableRules()
        const roundOutcomes = scoreboard.getRoundOutcomes();

        let yahtzeeBonusOverrideRules: [Rule, number][] = [];

        if (selectedRules.some(x => x.key === RuleKey.YahtzeeBonus)) {
            yahtzeeBonusOverrideRules = scoreboard.getYahtzeeBonusPossibleRules(currentHand);
        }

        let rules: ScoreboardRule[] = [];

        for (let rule of availableRules) {
            const scoreboardRule = {} as ScoreboardRule;
            const overrideRule = yahtzeeBonusOverrideRules.find(x => x[0].key === rule.key);
            scoreboardRule.rule = !!overrideRule ? overrideRule[0] : rule;
            scoreboardRule.canSelect = rollCount > 0 && (!!overrideRule
                || (yahtzeeBonusOverrideRules.length === 0 && rule.canSelect(scoreboard, currentHand))
                || (yahtzeeBonusOverrideRules.length > 0 && rule.key === RuleKey.YahtzeeBonus));
            scoreboardRule.score = !!overrideRule ? overrideRule[1] : rule.getScoreIfApplicable(scoreboard, currentHand);
            scoreboardRule.isPotentialScore = true;
            if (rollCount === 0 && scoreboardRule.isPotentialScore) {
                scoreboardRule.score = 0;
            }
            rules.push(scoreboardRule);
        }

        roundOutcomes.forEach(roundOutcome => {
            rules.push({rule: roundOutcome.rule, score: roundOutcome.rule.getScoreIfApplicable(scoreboard, roundOutcome.hand), isPotentialScore: false, canSelect: false})
        });

        rules = rules.sort(ScoreboardComponent.sortRulesByKey);
        return rules;
    }

    updateSelectableRules() {
        const rules = this.getRules(this.state.scoreboard, this.state.currentHand, this.state.rollCount, this.state.selectedRules);
        this.setState({
            rules: rules
        });
    }

    setSelectedRules(rules: Rule[]) {
        this.setState({
            selectedRules: rules
        }, () => {
            this.props.onSelectedRuleChanged(this.state.selectedRules);
            this.updateSelectableRules();
        });
    }

    getArrayWithElementRemoved<Type>(arr: Type[], selector: (element: Type) => boolean): Type[] {
        const foundIndex = arr.findIndex(selector);
        if (foundIndex < 0) {
            return arr;
        }

        let newArr: Type[] = [];

        if (foundIndex > 0) {
            newArr = arr.slice(0, foundIndex);
        }

        if (foundIndex > arr.length - 1) {
            newArr = newArr.concat(arr.slice(foundIndex + 1));
        }

        return newArr;
    }

    onRuleSelectionChanged(rule: Rule, isSelected: boolean) {
        const currentlySelectedRules = this.state.selectedRules;
        let newSelectedRules = currentlySelectedRules;
        if (!isSelected) {
            newSelectedRules = this.getArrayWithElementRemoved(currentlySelectedRules, ruleElement => ruleElement.key === rule.key)
        }
        else if (currentlySelectedRules.every(x => x.key !== rule.key) && isSelected)
        {
            if (currentlySelectedRules.some(x => x.key === RuleKey.YahtzeeBonus)) {
                if (currentlySelectedRules.length === 2) {
                    newSelectedRules = this.getArrayWithElementRemoved(newSelectedRules, ruleElement => ruleElement.key !== RuleKey.YahtzeeBonus);
                }
                newSelectedRules.push(rule);
            }
            else {
                newSelectedRules = [rule];
            }
        }

        this.setSelectedRules(newSelectedRules);
    }

    getRuleComponentFromRule(scoreboardRule: ScoreboardRule): ReactElement {
        const isSelected = this.state.selectedRules.some(x => x.key === scoreboardRule.rule.key);
        return (<ScoreboardRuleComponent key={scoreboardRule.rule.key} onRuleSelectionChanged={isSelected => this.onRuleSelectionChanged(scoreboardRule.rule, isSelected)} scoreboardRule={scoreboardRule} isSelected={isSelected} />)
    }

    private getScoreboardRuleScore(scoreboardRule: ScoreboardRule): number {
        return scoreboardRule.isPotentialScore
            ? 0
            : scoreboardRule.score
    }

    render() {
        const selectableUpperSectionRules = this.state.rules.filter(scoreboardRule => this.canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Upper);
        const selectableLowerSectionRules = this.state.rules.filter(scoreboardRule => this.canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Lower);
        const notSelectableUpperSectionRules = this.state.rules.filter(scoreboardRule => !this.canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Upper);
        const notSelectableLowerSectionRules = this.state.rules.filter(scoreboardRule => !this.canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Lower);

        return (
            <div className='ScoreboardRoot'>
                <h1>Scoreboard</h1>
                <h2>Upper Section</h2>
                {selectableUpperSectionRules.map(scoreboardRule => this.getRuleComponentFromRule(scoreboardRule))}
                
                <ScoreboardRow canSelect={false} left={<div>{'Total:'}</div>} right={<div>{selectableUpperSectionRules.map(this.getScoreboardRuleScore).reduce((a: number, b: number) => a + b, 0).toString()}</div>} />
                {notSelectableUpperSectionRules.map(scoreboardRule => this.getRuleComponentFromRule(scoreboardRule))}

                <h2>Lower Section</h2>
                {selectableLowerSectionRules.map(scoreboardRule => this.getRuleComponentFromRule(scoreboardRule))}
                {notSelectableLowerSectionRules.map(scoreboardRule => this.getRuleComponentFromRule(scoreboardRule))}
            </div>
        );
    }
}

export default ScoreboardComponent;