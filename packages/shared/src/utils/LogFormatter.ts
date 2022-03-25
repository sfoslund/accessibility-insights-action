// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface LogFormatter {
    escaped: (markdown: string) => string;
    
    snippet: (text: string) => string;
    
    link: (href: string, text: string) => string;
    
    listItem: (text: string) => string;
    
    heading: (text: string, headingLevel: number) => string;
    
    bold: (text: string) => string;
    
    productTitle: () => string;
    
    footerSeparator: () => string;
    
    sectionSeparator: () => string;
}
