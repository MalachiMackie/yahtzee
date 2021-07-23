import { Hand } from "./Hand";
import { RuleSet } from "./RuleSet";
import { Rule, RuleSection } from "./Rule";

export interface RoundOutcome {
    rule: Rule,
    hand: Hand
}

export class Scoreboard {
    private roundOutcomes: RoundOutcome[];
    readonly rules: Rule[];

    constructor(ruleSet: RuleSet) {
        this.roundOutcomes = [];
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
        const scores = applicableOutcomes.map(outcome => outcome.rule.getScore(outcome.hand));
        let score = scores.reduce((a, b) => a + b, 0);

        if (section === RuleSection.Upper) {
            score += 35;
        }

        return score;
    }

    private isRuleAvailable(rule: Rule): boolean {
        return this.roundOutcomes.every(outcome => outcome.rule.key !== rule.key);
    }

    getRoundOutcomes(): RoundOutcome[] {
        return this.roundOutcomes;
    }

    isYahtzeeBonusAvailable(hand: Hand): boolean {
        const yahtzeeRule = this.rules.find(rule => rule.name.match(/[Yy]ahtzee/))!;
        return this.roundOutcomes.some(outcome => outcome.rule.key === yahtzeeRule.key)
            && yahtzeeRule.isApplicableToHand(hand);
    }


    keepHand(hand: Hand, rule: Rule): void {
        this.roundOutcomes.push({ rule: rule, hand: hand });
    }
}
