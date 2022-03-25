// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CombinedReportParameters } from 'accessibility-insights-report';
import { inject, injectable } from 'inversify';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';
import { BaselineInfo } from '../baseline-info';
import { iocTypes } from '../ioc/ioc-types';
import { LogBuilder } from '../utils/log-builder';
import { MarkdownFormatter } from './markdown-formatter';

@injectable()
export class ResultMarkdownBuilder extends LogBuilder {
    constructor(@inject(iocTypes.ArtifactsInfoProvider)artifactsInfoProvider: ArtifactsInfoProvider,
                @inject(iocTypes.MarkdownFormatter)markdownFormatter: MarkdownFormatter) {
        super(artifactsInfoProvider, markdownFormatter);
    }

    public buildErrorContent(): string {
        const lines = [
            this.headingWithMessage('Something went wrong'),
            this.formatter.sectionSeparator(),
            `You can review the log to troubleshoot the issue. Fix it and re-run the workflow to run the automated accessibility checks again.`,
            this.formatter.sectionSeparator(),
        ];

        return this.scanResultDetails(lines.join(''));
    }

    public buildContent(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo): string {
        const passedChecks = combinedReportResult.results.resultsByRule.passed.length;
        const inapplicableChecks = combinedReportResult.results.resultsByRule.notApplicable.length;
        const failedChecks = combinedReportResult.results.resultsByRule.failed.length;

        let lines = [
            failedChecks === 0 ? this.headingWithMessage('All applicable checks passed') : this.headingWithMessage(),
            this.formatter.sectionSeparator(),
            this.urlsListItem(
                combinedReportResult.results.urlResults.passedUrls,
                combinedReportResult.results.urlResults.unscannableUrls,
                combinedReportResult.results.urlResults.failedUrls,
            ),
            this.formatter.sectionSeparator(),
            this.rulesListItem(passedChecks, inapplicableChecks, failedChecks),
            this.formatter.sectionSeparator(),

            this.downloadArtifacts(),
            this.failureDetails(combinedReportResult),
        ];

        // baselining is available
        if (baselineInfo !== undefined) {
            lines = [
                this.headingWithMessage(),
                this.fixedFailureDetails(baselineInfo),
                this.failureDetailsBaseline(combinedReportResult, baselineInfo, true),
                this.formatter.sectionSeparator(),
                this.baselineDetails(baselineInfo),
                this.downloadArtifactsWithLink(combinedReportResult, baselineInfo.baselineEvaluation),
                this.formatter.footerSeparator(),
                this.formatter.sectionSeparator(),
                this.formatter.heading('Scan summary', 4),
                this.formatter.sectionSeparator(),
                this.urlsListItemBaseline(
                    combinedReportResult.results.urlResults.passedUrls,
                    combinedReportResult.results.urlResults.unscannableUrls,
                    combinedReportResult.results.urlResults.failedUrls,
                ),
                this.formatter.sectionSeparator(),
                this.rulesListItemBaseline(passedChecks, inapplicableChecks, failedChecks),
                this.formatter.sectionSeparator(),
            ];
        }

        if (title !== undefined) {
            lines = [this.formatter.heading(title, 3), this.formatter.sectionSeparator()].concat(lines);
        }

        return this.scanResultDetails(lines.join(''), this.scanResultFooter(combinedReportResult));
    }
}
