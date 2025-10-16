import normalizeUrl from '../lib/normalizeUrl';

describe('normalizeUrl', () => {
    test('should add https protocol if missing', () => {
        expect(normalizeUrl('example.com')).toBe('https://example.com/');
        expect(normalizeUrl('http://example.com')).toBe('http://example.com/');
        expect(normalizeUrl('https://example.com')).toBe('https://example.com/');
    });

    test('should trim whitespace', () => {
        expect(normalizeUrl('  example.com  ')).toBe('https://example.com/');
        expect(normalizeUrl('  example.com/  ')).toBe('https://example.com/');
    });

    test('should keep the search params', () => {
        expect(normalizeUrl('https://example.com/?hello=world')).toBe('https://example.com/?hello=world');
        expect(normalizeUrl('https://example.com/path?hello=world')).toBe('https://example.com/path?hello=world');
    });

    test('should validate hostname contains a dot', () => {
        expect(normalizeUrl('localhost')).toBeUndefined();
        expect(normalizeUrl('example')).toBeUndefined();
        expect(normalizeUrl('stupid.hostname')).toBe("https://stupid.hostname/");
    });

    test('should remove trailing slash except for root', () => {
        expect(normalizeUrl('example.com/')).toBe('https://example.com/');
        expect(normalizeUrl('example.com/path/')).toBe('https://example.com/path');
        expect(normalizeUrl('example.com/path/to/resource/')).toBe('https://example.com/path/to/resource');
    });

    test('should remove hash fragments', () => {
        expect(normalizeUrl('example.com#section')).toBe('https://example.com/');
        expect(normalizeUrl('example.com/path#section')).toBe('https://example.com/path');
    });

    test('should return undefined for invalid URLs', () => {
        expect(normalizeUrl('not a url')).toBeUndefined();
        expect(normalizeUrl('http://')).toBeUndefined();
        expect(normalizeUrl('')).toBeUndefined();
        expect(normalizeUrl('@')).toBeUndefined();
    });
});
