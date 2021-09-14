import './ScoreboardComponent.css'
import { FC, ReactElement, useEffect, useMemo, useState } from "react";
import Hand from "../../Services/Hand";
import Rule, { RuleKey, RuleScore, RuleSection } from "../../Services/Rule";
import Scoreboard from "../../Services/Scoreboard";
import ScoreboardRuleComponent from '../ScoreboardRuleComponent/ScoreboardRuleComponent';
import ScoreboardRow from '../ScoreboardRow/ScoreboardRow';
import GameService from '../../Services/GameService';
import { arraysEqual } from '../../Services/Utils';
import { Subscription } from 'rxjs';

interface Props {
    gameService: GameService,
    onSelectedRulesChanged: (selectedRules: Rule[]) => void
}

export type ScoreboardRule = {rule: Rule, score: RuleScore, isPotentialScore: boolean, canSelect: boolean};

const sortRulesByKey = (a: ScoreboardRule, b: ScoreboardRule) => {
    if (a.rule.key > b.rule.key) {
        return 1;
    }

    if (a.rule.key < b.rule.key) {
        return -1;
    }

    return 0;
}

const getArrayWithElementRemoved = <Type extends unknown>(arr: Type[], selector: (element: Type) => boolean): Type[] => {
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

const ScoreboardComponent: FC<Props> = ({gameService, onSelectedRulesChanged}) => {

    const [scoreboard, setScoreboard] = useState<Scoreboard>();
    const [currentHand, setCurrentHand] = useState<Hand>();
    const [rollCount, setRollCount] = useState<number>(0);
    const [selectedRules, setSelectedRules] = useState<Rule[]>([]);
    const [rules, setRules] = useState<ScoreboardRule[]>([]);

    const getRules = (currentHand: Hand, scoreboard: Scoreboard, selectedRules: Rule[], rollCount: number) => {
        const availableRules = scoreboard.getAvailableRules();
        const roundOutcomes = scoreboard.getRoundOutcomes();
        let yahtzeeBonusOverrideRules: [Rule, number][] = [];

        if (selectedRules!.some(x => x.key === RuleKey.YahtzeeBonus)) {
            yahtzeeBonusOverrideRules = scoreboard.getYahtzeeBonusPossibleRules(currentHand);
        }

        let rules: ScoreboardRule[] = [];

        for (let rule of availableRules) {
            const scoreboardRule = {} as ScoreboardRule;
            const overrideRule = yahtzeeBonusOverrideRules.find(x => x[0].key === rule.key);
            scoreboardRule.rule = !!overrideRule ? overrideRule[0] : rule;
            scoreboardRule.canSelect = rollCount! > 0 && (!!overrideRule
                || (yahtzeeBonusOverrideRules.length === 0 && rule.canSelect(scoreboard, currentHand))
                || (yahtzeeBonusOverrideRules.length > 0 && rule.key === RuleKey.YahtzeeBonus));
            scoreboardRule.score = !!overrideRule ? overrideRule[1] : rule.getScoreIfApplicable(scoreboard, currentHand);
            scoreboardRule.isPotentialScore = true;
            if (rollCount === 0 && scoreboardRule.isPotentialScore) {
                scoreboardRule.score = 0;
            }

            if (rule.key !== RuleKey.YahtzeeBonus)
            {
                rules.push(scoreboardRule);
                continue;
            }

            if (roundOutcomes.every(x => x.rule.key !== RuleKey.YahtzeeBonus))
            {
                rules.push(scoreboardRule);
            }
        }

        roundOutcomes.forEach(roundOutcome => {
            let score = roundOutcome.rule.getScoreIfApplicable(scoreboard, roundOutcome.hand);
            let isPotentialScore = false;
            let canSelect = false;

            if (roundOutcome.rule.key === RuleKey.YahtzeeBonus) {
                score = roundOutcome.overriddenScore ?? 0;
                isPotentialScore = true;
                canSelect = rollCount > 0 && roundOutcome.rule.isApplicable(scoreboard, currentHand);
            }
            rules.push({rule: roundOutcome.rule, score: score, isPotentialScore: isPotentialScore, canSelect: canSelect})
        });

        rules = rules.sort(sortRulesByKey);
        return rules;
    }

    const canSelectRule = (scoreboardRule: ScoreboardRule) => !!scoreboard && !!currentHand && scoreboardRule.rule.canSelect(scoreboard, currentHand);
    const onRuleSelectionChanged = (rule: Rule, isSelected: boolean) => {
        let newSelectedRules = [...selectedRules];

        if (!isSelected) {
            newSelectedRules = getArrayWithElementRemoved(selectedRules, ruleElement => ruleElement.key === rule.key)
        }
        else if (selectedRules.every(x => x.key !== rule.key) && isSelected)
        {
            if (selectedRules.some(x => x.key === RuleKey.YahtzeeBonus)) {
                if (selectedRules.length === 2) {
                    newSelectedRules = getArrayWithElementRemoved(newSelectedRules, ruleElement => ruleElement.key !== RuleKey.YahtzeeBonus);
                }
                newSelectedRules.push(rule);
            }
            else {
                newSelectedRules = [rule];
            }
        }

        setSelectedRules(newSelectedRules);
    }

    const getRuleComponentFromRule = (scoreboardRule: ScoreboardRule): ReactElement => {
        const isSelected = !selectedRules ? false : selectedRules.some(x => x.key === scoreboardRule.rule.key);
        return (<ScoreboardRuleComponent currentHand={currentHand} scoreboard={scoreboard} key={scoreboardRule.rule.key} onRuleSelectionChanged={isSelected => onRuleSelectionChanged(scoreboardRule.rule, isSelected)} scoreboardRule={scoreboardRule} isSelected={isSelected} />)
    }

    const getScoreboardRuleScore = (scoreboardRule: ScoreboardRule): number => {
        return scoreboardRule.isPotentialScore
            ? 0
            : scoreboardRule.score
    }

    const updateRules = useMemo(() => (currentHand?: Hand, scoreboard?: Scoreboard) => {
        if (!currentHand || !scoreboard)
            return;

        const newRules = getRules(currentHand, scoreboard, selectedRules, rollCount);
        if (!arraysEqual(newRules, rules, undefined, (a, b) => a.rule.key === b.rule.key && a.score === b.score && a.canSelect === b.canSelect, true))
            setRules(newRules);
    }, [rollCount, selectedRules, rules]);

    useEffect(() => {
        updateRules(currentHand, scoreboard);
    }, [currentHand, scoreboard, rollCount, selectedRules, updateRules]);

    useEffect(() => {
        onSelectedRulesChanged(selectedRules);
    }, [selectedRules, onSelectedRulesChanged]);

    useEffect(() => {
        if (rollCount === 0)
            setSelectedRules([]);
    }, [rollCount]);

    const subscriptions: Subscription[] = useMemo(() => [], []);

    subscriptions.push(gameService.scoreboard.subscribe(gsScoreboard => {
        if (!!gsScoreboard && (!scoreboard || !gsScoreboard.equals(scoreboard)))
            setScoreboard(gsScoreboard);
    }));
    subscriptions.push(gameService.currentHand.subscribe(gsCurrentHand => {
        if (!!gsCurrentHand && !gsCurrentHand?.equals(currentHand))
            setCurrentHand(gsCurrentHand);
    }));
    subscriptions.push(gameService.rollCount.subscribe(gsRollCount => {
        if (gsRollCount !== rollCount)
            setRollCount(gsRollCount);
    }));

    useEffect(() => {
        return () => {
            subscriptions.forEach(sub => sub.unsubscribe());
        }
    }, [subscriptions]);

    const selectableUpperSectionRules = rules.filter(scoreboardRule => canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Upper);
    const selectableLowerSectionRules = rules.filter(scoreboardRule => canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Lower);
    const notSelectableUpperSectionRules = rules.filter(scoreboardRule => !canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Upper);
    const notSelectableLowerSectionRules = rules.filter(scoreboardRule => !canSelectRule(scoreboardRule) && scoreboardRule.rule.section === RuleSection.Lower);

    return (
        <div className='ScoreboardRoot'>
            <h1>Scoreboard</h1>
            <h2>Upper Section</h2>
            {selectableUpperSectionRules.map(scoreboardRule => getRuleComponentFromRule(scoreboardRule))}
            
            <ScoreboardRow canSelect={false} left={<div>{'Total:'}</div>} right={<div>{selectableUpperSectionRules.map(getScoreboardRuleScore).reduce((a: number, b: number) => a + b, 0).toString()}</div>} />
            {notSelectableUpperSectionRules.map(scoreboardRule => getRuleComponentFromRule(scoreboardRule))}

            <h2>Lower Section</h2>
            {selectableLowerSectionRules.map(scoreboardRule => getRuleComponentFromRule(scoreboardRule))}
            {notSelectableLowerSectionRules.map(scoreboardRule => getRuleComponentFromRule(scoreboardRule))}
        </div>
    );

}

export default ScoreboardComponent;