// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { toolName } from '../content/strings';
import { LogFormatter } from '../utils/LogFormatter';

export class ConsoleLogFormatter implements LogFormatter {
    public link = (href: string, text: string): string => {
        return `${text} (${href})`;
    };
    
    public listItem = (text: string): string => {
        return `* ${text}`;
    };
    
    public productTitle = (): string => {
        return `${toolName}`;
    };
    
    public footerSeparator = (): string => `-------------------`;
    
    public sectionSeparator = (): string => '\n';

    public escaped: (markdown: string) => string = (markdown) => markdown;

    public snippet: (text: string) => string = (text) => text; 

    public heading: (text: string, headingLevel: number) => string = (text) => text; 

    public bold: (text: string) => string = (text) => text; 
}
