// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { MarkdownFormatter } from "./markdown-formatter";


describe('MarkdownFormatter', () => {
    let testSubject: MarkdownFormatter;

    beforeAll(() => {
        testSubject = new MarkdownFormatter();
    })

    it('escaped', () => {
        expect(testSubject.escaped('<img>')).toEqual('\\<img>');
    });

    it('snippet', () => {
        expect(testSubject.snippet('code')).toMatchSnapshot();
    });

    it('link', () => {
        expect(testSubject.link('href', 'text')).toMatchSnapshot();
    });

    it('listItem', () => {
        expect(testSubject.listItem('li')).toMatchSnapshot();
    });

    it('heading', () => {
        expect(testSubject.heading('heading', 2)).toMatchSnapshot();
    });

    it('bold', () => {
        expect(testSubject.bold('text')).toMatchSnapshot();
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

    it('static link', () => {
        expect(MarkdownFormatter.link('href', 'text')).toMatchSnapshot();
    });

    it('static image', () => {
        expect(MarkdownFormatter.image('alt', 'src')).toMatchSnapshot();
    });

    it('static productTitle', () => {
        expect(MarkdownFormatter.productTitle()).toMatchSnapshot();
    });
});
