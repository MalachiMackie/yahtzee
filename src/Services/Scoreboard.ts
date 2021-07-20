import { Hand } from "./Hand";
import { RuleSet } from "./RuleSet";
import { Rule, RuleSection } from "./Rule";

interface RoundOutcome {
    rule: Rule,
    hand: Hand
}

class RuleNotFoundError extends Error {}

export class Scoreboard {
    roundOutcomes: RoundOutcome[];
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


    keepHand(hand: Hand, ruleKey: number): void {
        const rule = this.rules.find(rule => rule.key === ruleKey);
        if (!rule) {
            throw new RuleNotFoundError();
        }

        this.roundOutcomes.push({ rule: rule, hand: hand });
    }
}
