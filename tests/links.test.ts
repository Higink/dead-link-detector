import {analyzeLink} from '../lib/links';

describe('analyzeLink', () => {
    const baseUrl = 'https://example.com/page';

    test('should handle valid relative URLs', () => {
        expect(analyzeLink('/other-page', baseUrl)).toBe('https://example.com/other-page');
    });

    test('should handle valid absolute URLs from same domain', () => {
        expect(analyzeLink('https://example.com/other-page', baseUrl)).toBe('https://example.com/other-page');
    });

    test('should ignore URLs from different domains', () => {
        expect(analyzeLink('https://different-domain.com/page', baseUrl)).toBeUndefined();
    });

    test('should ignore special link types', () => {
        expect(analyzeLink('#anchor', baseUrl)).toBeUndefined();
        expect(analyzeLink('mailto:test@example.com', baseUrl)).toBeUndefined();
        expect(analyzeLink('ftp://example.com', baseUrl)).toBeUndefined();
        expect(analyzeLink('tel:+1234567890', baseUrl)).toBeUndefined();
    });

    test('should handle malformed URLs gracefully', () => {
        expect(analyzeLink('http://:invalid', baseUrl)).toBeUndefined();
        expect(analyzeLink('javascript:alert(1)', baseUrl)).toBeUndefined();
    });

    test('should normalize URLs correctly', () => {
        expect(analyzeLink('https://example.com/path/', baseUrl)).toBe('https://example.com/path');
        expect(analyzeLink('https://example.com/path?param=value', baseUrl))
            .toBe('https://example.com/path?param=value');
    });
});
