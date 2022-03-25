// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CombinedReportParameters } from 'accessibility-insights-report';
import { inject, injectable } from 'inversify';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';
import { BaselineInfo } from '../baseline-info';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { brand } from '../content/strings';
import { iocTypes } from '../ioc/ioc-types';
import { LogFormatter } from './LogFormatter';

@injectable()
export abstract class LogBuilder {
    constructor(
        @inject(iocTypes.ArtifactsInfoProvider) protected readonly artifactsInfoProvider: ArtifactsInfoProvider,
        protected readonly formatter: LogFormatter) {}

    protected headingWithMessage = (message?: string): string => {
        if (message) {
            return this.formatter.heading(`${this.formatter.productTitle()}: ${message}`, 3);
        }
        return this.formatter.heading(`${this.formatter.productTitle()}`, 3);
    };

    protected baselineDetails = (baselineInfo: BaselineInfo): string => {
        const baselineFileName = baselineInfo.baselineFileName;
        const baselineEvaluation = baselineInfo.baselineEvaluation;
        const baseliningDocsUrl = `https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md#using-a-baseline-file`;
        const baseliningDocsLink = this.formatter.link(baseliningDocsUrl, 'baselining docs');
        const scanArgumentsLink = this.formatter.link(this.artifactsInfoProvider.getArtifactsUrl(), 'scan arguments');
        const baselineNotConfiguredHelpText = `A baseline lets you mark known failures so it's easier to identify new failures as they're introduced. See ${baseliningDocsLink} for more.`;
        const baselineNotDetectedHelpText = `To update the baseline with these changes, copy the updated baseline file to ${scanArgumentsLink}. See ${baseliningDocsLink} for more.`;
        let lines = [''];

        if (baselineFileName === undefined) {
            lines = [this.formatter.bold('Baseline not configured'), this.formatter.sectionSeparator(), baselineNotConfiguredHelpText];
        } else if (baselineEvaluation === undefined) {
            lines = [this.formatter.bold('Baseline not detected'), this.formatter.sectionSeparator(), baselineNotDetectedHelpText];
        } else {
            const newFailures = baselineEvaluation.totalNewViolations;
            const baselineFailures = baselineEvaluation.totalBaselineViolations;
            if (baselineFailures === undefined || (baselineFailures === 0 && newFailures > 0)) {
                lines = [this.formatter.bold('Baseline not detected'), this.formatter.sectionSeparator(), baselineNotDetectedHelpText];
            } else if (baselineFailures > 0 || this.shouldUpdateBaselineFile(baselineEvaluation)) {
                const headingWithBaselineFailures = `${baselineFailures} failure instances in baseline`;
                let baselineFailuresHelpText = `not shown; see ${baseliningDocsLink}`;
                if (this.shouldUpdateBaselineFile(baselineEvaluation)) {
                    baselineFailuresHelpText = baselineFailuresHelpText.concat(' for how to integrate your changes into the baseline');
                }
                lines = [this.formatter.bold(headingWithBaselineFailures), this.formatter.sectionSeparator(), `(${baselineFailuresHelpText})`];
            }
        }

        return lines.join('');
    };

    protected shouldUpdateBaselineFile(baselineEvaluation: BaselineEvaluation): boolean {
        return baselineEvaluation && baselineEvaluation.suggestedBaselineUpdate ? true : false;
    }

    protected hasFixedFailureResults(baselineEvaluation: BaselineEvaluation): boolean {
        if (baselineEvaluation && baselineEvaluation.fixedViolationsByRule) {
            for (const _ in baselineEvaluation.fixedViolationsByRule) {
                return true;
            }
        }

        return false;
    }

    protected urlsListItem = (passedUrls: number, unscannableUrls: number, failedUrls: number): string => {
        const failedUrlsSummary = `${failedUrls} URL(s) failed, `;
        const passedAndUnscannableUrlsSummary = `${passedUrls} URL(s) passed, and ${unscannableUrls} were not scannable`;
        const urlsSummary = failedUrls === 0 ? passedAndUnscannableUrlsSummary : failedUrlsSummary.concat(passedAndUnscannableUrlsSummary);
        return this.formatter.listItem(`${this.formatter.bold(`URLs`)}: ${urlsSummary}`);
    };

    protected urlsListItemBaseline = (passedUrls: number, unscannableUrls: number, failedUrls: number): string => {
        const urlsSummary = `${failedUrls} with failures, ${passedUrls} passed, ${unscannableUrls} not scannable`;
        return `${this.formatter.bold(`URLs`)}: ${urlsSummary}`;
    };

    protected rulesListItem = (passedChecks: number, inapplicableChecks: number, failedChecks: number) => {
        const failedRulesSummary = `${failedChecks} check(s) failed, `;
        const passedAndInapplicableRulesSummary = `${passedChecks} check(s) passed, and ${inapplicableChecks} were not applicable`;
        const rulesSummary =
            failedChecks === 0 ? passedAndInapplicableRulesSummary : failedRulesSummary.concat(passedAndInapplicableRulesSummary);
        return this.formatter.listItem(`${this.formatter.bold(`Rules`)}: ${rulesSummary}`);
    };

    protected rulesListItemBaseline = (passedChecks: number, inapplicableChecks: number, failedChecks: number) => {
        const rulesSummary = `${failedChecks} with failures, ${passedChecks} passed, ${inapplicableChecks} not applicable`;
        return `${this.formatter.bold(`Rules`)}: ${rulesSummary}`;
    };

    protected failureDetails = (combinedReportResult: CombinedReportParameters): string => {
        if (combinedReportResult.results.resultsByRule.failed.length === 0) {
            return '';
        }

        const failedRulesList = combinedReportResult.results.resultsByRule.failed.map((failuresGroup) => {
            const failureCount = failuresGroup.failed.length;
            const ruleId = failuresGroup.failed[0].rule.ruleId;
            const ruleDescription = failuresGroup.failed[0].rule.description;
            return [this.failedRuleListItem(failureCount, ruleId, ruleDescription), this.formatter.sectionSeparator()].join('');
        });
        const lines = [this.formatter.sectionSeparator(), `${this.formatter.heading('Failed instances', 4)}`, this.formatter.sectionSeparator(), ...failedRulesList];

        return lines.join('');
    };

    protected failedRuleListItem = (failureCount: number, ruleId: string, description: string) => {
        return this.formatter.listItem(`${this.formatter.bold(`${failureCount} × ${this.formatter.escaped(ruleId)}`)}:  ${this.formatter.escaped(description)}`);
    };

    protected fixedFailureDetails = (baselineInfo: BaselineInfo): string => {
        if (!baselineInfo || !this.hasFixedFailureResults(baselineInfo.baselineEvaluation)) {
            return this.formatter.sectionSeparator();
        }

        let totalFixedFailureInstanceCount = 0;
        const fixedFailureInstanceLines = [];
        for (const ruleId in baselineInfo.baselineEvaluation.fixedViolationsByRule) {
            const fixedFailureInstanceCount = baselineInfo.baselineEvaluation.fixedViolationsByRule[ruleId];
            totalFixedFailureInstanceCount += fixedFailureInstanceCount;
            fixedFailureInstanceLines.push(
                [this.fixedRuleListItemBaseline(fixedFailureInstanceCount, ruleId), this.formatter.sectionSeparator()].join(''),
            );
        }

        const lines = [
            this.formatter.sectionSeparator(),
            this.formatter.bold(`${totalFixedFailureInstanceCount} failure instances from baseline no longer exist:`),
            this.formatter.sectionSeparator(),
            ...fixedFailureInstanceLines,
        ];
        return lines.join('');
    };

    protected failureDetailsBaseline = (combinedReportResult: CombinedReportParameters, baselineInfo: BaselineInfo, includeIcons: boolean): string => {
        let lines = [];
        if (
            this.hasFailures(combinedReportResult, baselineInfo.baselineEvaluation) ||
            this.shouldUpdateBaselineFile(baselineInfo.baselineEvaluation)
        ) {
            const failedRulesList = this.getFailedRulesList(combinedReportResult, baselineInfo.baselineEvaluation);
            const failureInstances = this.getFailureInstances(combinedReportResult, baselineInfo.baselineEvaluation);
            const failureInstancesHeading = this.getFailureInstancesHeading(failureInstances, baselineInfo.baselineEvaluation);
            lines = [this.formatter.sectionSeparator(), this.formatter.bold(failureInstancesHeading), this.formatter.sectionSeparator(), ...failedRulesList];
        } else {
            lines = [this.formatter.sectionSeparator(), ...this.getNoFailuresText(baselineInfo.baselineEvaluation, includeIcons)];
        }

        return lines.join('');
    };

    protected getNoFailuresText = (baselineEvaluation: BaselineEvaluation, includeIcons: boolean): string[] => {
        const checkMark = ':white_check_mark:';
        const pointRight = ':point_right:';
        let failureDetailsHeading = `${includeIcons ? checkMark + ' ' : ""}No failures detected`;
        let failureDetailsDescription = `No failures were detected by automatic scanning.`;
        if (this.baselineHasFailures(baselineEvaluation)) {
            failureDetailsHeading = `${includeIcons ? checkMark +  ' ' : ''}No new failures`;
            failureDetailsDescription = 'No failures were detected by automatic scanning except those which exist in the baseline.';
        }
        const nextStepHeading = `${includeIcons ? pointRight + ' ' : ''}Next step:`;
        const tabStopsUrl = `https://accessibilityinsights.io/docs/en/web/getstarted/fastpass/#complete-the-manual-test-for-tab-stops`;
        const tabStopsLink = this.formatter.link(tabStopsUrl, 'Accessibility Insights Tab Stops');
        const nextStepDescription = ` Manually assess keyboard accessibility with ${tabStopsLink}`;

        return [
            this.formatter.bold(failureDetailsHeading),
            this.formatter.sectionSeparator(),
            failureDetailsDescription,
            this.formatter.sectionSeparator(),
            this.formatter.sectionSeparator(),
            this.formatter.bold(nextStepHeading),
            nextStepDescription,
            this.formatter.sectionSeparator(),
        ];
    };

    protected getTotalFailureInstancesFromResults = (combinedReportResult: CombinedReportParameters): number => {
        return combinedReportResult.results.resultsByRule.failed.reduce((a, b) => a + b.failed.reduce((c, d) => c + d.urls.length, 0), 0);
    };

    protected getFailureInstances = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): number => {
        if (baselineEvaluation) {
            return baselineEvaluation.totalNewViolations;
        }

        return this.getTotalFailureInstancesFromResults(combinedReportResult);
    };

    protected getFailureInstancesHeading = (failureInstances: number, baselineEvaluation: BaselineEvaluation): string => {
        let failureInstancesHeading = `${failureInstances} failure instances`;
        if (this.baselineHasFailures(baselineEvaluation)) {
            failureInstancesHeading = failureInstancesHeading.concat(' not in baseline');
        }

        return failureInstancesHeading;
    };

    protected getFailedRulesList = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): string[] => {
        if (baselineEvaluation) {
            return this.getNewFailuresList(combinedReportResult, baselineEvaluation);
        }

        return this.getFailedRulesListWithNoBaseline(combinedReportResult);
    };

    protected getNewFailuresList = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): string[] => {
        const newFailuresList = [];
        for (const ruleId in baselineEvaluation.newViolationsByRule) {
            const failureCount = baselineEvaluation.newViolationsByRule[ruleId];
            const ruleDescription = this.getRuleDescription(combinedReportResult, ruleId);
            newFailuresList.push([this.failedRuleListItemBaseline(failureCount, ruleId, ruleDescription), this.formatter.sectionSeparator()].join(''));
        }

        return newFailuresList;
    };

    protected getFailedRulesListWithNoBaseline = (combinedReportResult: CombinedReportParameters): string[] => {
        const failedRulesList = combinedReportResult.results.resultsByRule.failed.map((failuresGroup) => {
            const failureCount = failuresGroup.failed.reduce((a, b) => a + b.urls.length, 0);
            const ruleId = failuresGroup.failed[0].rule.ruleId;
            const ruleDescription = failuresGroup.failed[0].rule.description;
            return [this.failedRuleListItemBaseline(failureCount, ruleId, ruleDescription), this.formatter.sectionSeparator()].join('');
        });

        return failedRulesList;
    };

    protected getRuleDescription = (combinedReportResult: CombinedReportParameters, ruleId: string): string => {
        const matchingFailuresGroup = combinedReportResult.results.resultsByRule.failed.find((failuresGroup) => {
            return failuresGroup.failed[0].rule.ruleId === ruleId;
        });

        return matchingFailuresGroup.failed[0].rule.description;
    };

    protected failedRuleListItemBaseline = (failureCount: number, ruleId: string, description: string) => {
        return this.formatter.listItem(`(${failureCount}) ${this.formatter.bold(this.formatter.escaped(ruleId))}:  ${this.formatter.escaped(description)}`);
    };

    protected fixedRuleListItemBaseline = (failureCount: number, ruleId: string) => {
        return this.formatter.listItem(`(${failureCount}) ${this.formatter.bold(this.formatter.escaped(ruleId))}`);
    };

    protected scanResultDetails(scanResult: string, footer?: string): string {
        const lines = [scanResult, this.formatter.sectionSeparator(), this.formatter.footerSeparator(), this.formatter.sectionSeparator(), footer];

        return lines.join('');
    }

    protected scanResultFooter(combinedReportResult: CombinedReportParameters): string {
        const axeVersion = combinedReportResult.axeVersion;
        const axeCoreUrl = `https://github.com/dequelabs/axe-core/releases/tag/v${axeVersion}`;
        const axeLink = this.formatter.link(axeCoreUrl, `axe-core ${axeVersion}`);

        return `This scan used ${axeLink} with ${combinedReportResult.userAgent}.`;
    }

    protected downloadArtifacts(): string {
        const artifactName = `${brand} artifact`;
        return this.formatter.listItem(`Download the ${this.formatter.bold(artifactName)} to view the detailed results of these checks`);
    }

    protected downloadArtifactsWithLink(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): string {
        const artifactsUrl = this.artifactsInfoProvider.getArtifactsUrl();
        let lines: string[] = [];
        if (artifactsUrl === undefined) {
            return lines.join('');
        }

        const artifactsLink = this.formatter.link(artifactsUrl, 'run artifacts');
        let details = 'all failures and scan details';
        if (!this.baselineHasFailures(baselineEvaluation) && !this.hasFailures(combinedReportResult, baselineEvaluation)) {
            details = 'scan details';
        }
        lines = [
            this.formatter.sectionSeparator(),
            this.formatter.sectionSeparator(),
            `See ${details} by downloading the report from ${artifactsLink}`,
            this.formatter.sectionSeparator(),
            this.formatter.sectionSeparator(),
        ];
        return lines.join('');
    }

    protected baselineHasFailures = (baselineEvaluation: BaselineEvaluation): boolean => {
        return (
            baselineEvaluation !== undefined && baselineEvaluation.totalBaselineViolations && baselineEvaluation.totalBaselineViolations > 0
        );
    };

    protected hasFailures = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): boolean => {
        if (baselineEvaluation !== undefined) {
            return baselineEvaluation.totalNewViolations > 0;
        }

        return this.getTotalFailureInstancesFromResults(combinedReportResult) > 0;
    };
}
