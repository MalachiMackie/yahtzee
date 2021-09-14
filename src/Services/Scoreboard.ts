import Hand from "./Hand";
import { RuleSet } from "./RuleSet";
import Rule, { RuleSection } from "./Rule";
import { RuleKey, RuleScore } from './Rule';
import { arraysEqual } from "./Utils";

export interface RoundOutcome {
    rule: Rule,
    hand?: Hand,
    overriddenScore?: number
}

function roundOutcomesEqual(a: RoundOutcome, b: RoundOutcome): boolean {
    return a.rule.key === b.rule.key
        && a.overriddenScore === b.overriddenScore
        && (a.hand?.equals(b.hand) ?? false);
}

class RuleNotFoundError extends Error
{

}

export default class Scoreboard {
    private roundOutcomes: RoundOutcome[];
    private readonly rules: Rule[];
    private readonly ruleSet: RuleSet;

    constructor(ruleSet: RuleSet) {
        this.roundOutcomes = [];
        this.ruleSet = ruleSet;
        this.rules = ruleSet.getRules();
    }

    getAvailableRules(): Rule[] {
        return this.rules.filter(rule => this.isRuleAvailable(rule));
    }

    getTotalScore(): number {
        const lowerSectionScore = this.getSectionScore(RuleSection.Lower);
        const upperSectionScore = this.getSectionScore(RuleSection.Upper);

        return lowerSectionScore + upperSectionScore;
    }

    getSectionScore(section: RuleSection): number {
        const applicableOutcomes = this.roundOutcomes.filter(outcome => outcome.rule.section === section);
        const scores = applicableOutcomes.map(outcome => outcome.rule.getScoreIfApplicable(this, outcome.hand));
        let score = scores.reduce((a, b) => a + b, 0);

        return score;
    }

    private isRuleAvailable(rule: Rule): boolean {
        return rule.key === RuleKey.YahtzeeBonus || this.roundOutcomes.every(outcome => outcome.rule.key !== rule.key);
    }

    getRoundOutcomes(): RoundOutcome[] {
        return this.roundOutcomes;
    }

    keepHand(hand: Hand, ruleKey: RuleKey): void {
        const rule: Rule | undefined = this.rules.find(x => x.key === ruleKey);
        if (!rule)
        {
            throw new RuleNotFoundError()
        } 
        this.roundOutcomes.push({ rule: rule!, hand: hand });
        this.tryApplyUpperSectionBonus();
    }

    private tryApplyUpperSectionBonus(): void {
        const upperBonusSection = this.rules.find(x => x.key === RuleKey.UpperSectionBonus);
        if (!upperBonusSection || this.roundOutcomes.some(x => x.rule.key === upperBonusSection?.key))
            return;

        if (upperBonusSection.getScoreIfApplicable(this) > 0) {
            this.roundOutcomes.push({rule: upperBonusSection})
        }
    }

    public static readonly yahtzeeBonusRulesToSum: RuleKey[] = [RuleKey.ThreeOfAKind, RuleKey.FourOfAKind, RuleKey.Chance];

    getYahtzeeBonusPossibleRules(hand: Hand): [Rule, RuleScore][] {
        const yahtzeeBonusRule: Rule = this.getRule(RuleKey.YahtzeeBonus);

        if (!yahtzeeBonusRule?.isApplicable(this, hand))
            return [];

        const dieValue = hand.getDice()[0].getCurrentFace();
        const correspondingRuleKey = this.ruleSet.upperSectionRuleValueMap[dieValue];
        const correspondingRuleOutcome = this.roundOutcomes.find(x => x.rule.key === correspondingRuleKey);

        if (!correspondingRuleOutcome)
        {
            const rule = this.getRule(correspondingRuleKey);
            return [[rule, rule.getScoreIfApplicable(this, hand)]];
        }

        const applicableRules = this.rules.filter(x => x.canSelect(this, hand) && this.roundOutcomes.every(y => y.rule.key !== x.key) && x.key !== RuleKey.YahtzeeBonus);

        const applicableLowerSectionRules = applicableRules.filter(x => x.section === RuleSection.Lower).map(rule => {
            const outcome = this.getRoundOutcomeForYahtzeeBonusRule(rule, hand);
            const applicableRule: [Rule, RuleScore] = [outcome.rule, outcome.overriddenScore ?? outcome.rule.getScore(this, hand)];
            return applicableRule;
        });

        if (applicableLowerSectionRules.length > 0)
            return applicableLowerSectionRules;
        
        return applicableRules.filter(x => x.section === RuleSection.Upper).map(x => [x, 0]);
    }

    private getRoundOutcomeForYahtzeeBonusRule(rule: Rule, hand: Hand): RoundOutcome {
        const roundOutcome: RoundOutcome = {
            rule: rule,
            hand: hand,
        };
        if (Scoreboard.yahtzeeBonusRulesToSum.some(x => x === rule.key)) {
            roundOutcome.overriddenScore = this.ruleSet.sumHand(hand);
        }

        return roundOutcome;
    }

    applyYahtzeeBonus(hand: Hand, ruleKey: RuleKey): void {
        const yahtzeeBonusRule: Rule = this.getRule(RuleKey.YahtzeeBonus);

        if (!yahtzeeBonusRule?.isApplicable(this, hand))
            throw new YahtzeeBonusDoesNotApplyError();

        const rule = this.rules.find(x => x.key === ruleKey);
        if (!rule)
            throw new RuleNotFoundError();

            
        this.roundOutcomes.push(this.getRoundOutcomeForYahtzeeBonusRule(rule, hand));
        let existingBonusOutcome = this.roundOutcomes.find(x => x.rule.key === RuleKey.YahtzeeBonus);
        if (!!existingBonusOutcome && !!existingBonusOutcome.overriddenScore)
        {
            existingBonusOutcome.overriddenScore += yahtzeeBonusRule.getScore(this, hand);
            return;
        }

        this.roundOutcomes.push({hand: hand, rule: yahtzeeBonusRule, overriddenScore: yahtzeeBonusRule.getScore(this, hand)});
    }

    private getRule(ruleKey: RuleKey) : Rule
    {
        const rule = this.rules.find(x => x.key === ruleKey)
        if (!rule)
            throw new RuleNotFoundError();
        
        return rule;
    }

    equals(other: Scoreboard): boolean {
        return arraysEqual(this.roundOutcomes, other.roundOutcomes, undefined, roundOutcomesEqual, true);
    }
}

class YahtzeeBonusDoesNotApplyError extends Error
{

}