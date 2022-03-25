// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { brand, brandLogoImg, toolName } from '../content/strings';
import { LogFormatter } from '../utils/LogFormatter';

export class MarkdownFormatter implements LogFormatter {
    public escaped = (markdown: string): string => {
        return markdown.replace(/</g, '\\<');
    };
    
    public snippet = (text: string): string => {
        return `\`${text}\``;
    };

    public static link = (href: string, text: string): string => {
        return `[${text}](${href})`;
    };

    public link: (href: string, text: string) => string = MarkdownFormatter.link;
    
    public static image = (altText: string, src: string): string => {
        return `![${altText}](${src})`;
    };
    
    public listItem = (text: string): string => {
        return `* ${text}`;
    };
    
    public heading = (text: string, headingLevel: number): string => {
        return `${'#'.repeat(headingLevel)} ${text}`;
    };
    
    public bold = (text: string): string => {
        return `**${text}**`;
    };
    
    public static productTitle = (): string => {
        return `${this.image(`${brand}`, brandLogoImg)} ${toolName}`;
    };

    public productTitle: () => string = MarkdownFormatter.productTitle;
    
    public footerSeparator = (): string => `---`;
    
    public sectionSeparator = (): string => '\n';
}
