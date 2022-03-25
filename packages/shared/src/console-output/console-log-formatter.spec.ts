// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConsoleLogFormatter } from "./console-log-formatter";

describe('ConsoleLogFormatter', () => {
    let testSubject: ConsoleLogFormatter;

    beforeAll(() => {
        testSubject = new ConsoleLogFormatter();
    })

    it('link', () => {
        expect(testSubject.link('href', 'text')).toMatchSnapshot();
    });

    it('listItem', () => {
        expect(testSubject.listItem('li')).toMatchSnapshot();
    });

    it('productTitle', () => {
        expect(testSubject.productTitle()).toMatchSnapshot();
    });

    it('footerSeparator', () => {
        expect(testSubject.footerSeparator()).toMatchSnapshot();
    });

    it('sectionSeparator', () => {
        expect(testSubject.sectionSeparator()).toMatchSnapshot();
    });
    
    it('escaped', () => {
        expect(testSubject.escaped('<img>')).toEqual('<img>');
    });

    it('snippet', () => {
        expect(testSubject.snippet('code')).toEqual('code');
    });


    it('heading', () => {
        expect(testSubject.heading('heading', 2)).toEqual('heading');
    });

    it('bold', () => {
        expect(testSubject.bold('text')).toEqual('text');
    });
});
