import {getDomainFromUrl, stringToURL} from '../utils/url';

describe('URL Utils', () => {
    describe('getDomainFromUrl', () => {
        it('should extract domain from valid URLs', () => {
            expect(getDomainFromUrl('https://example.com/path')).toBe('example.com');
            expect(getDomainFromUrl('http://sub.example.com')).toBe('sub.example.com');
        });

        it('should handle URLs without protocol', () => {
            expect(getDomainFromUrl('example.com/path')).toBe('example.com');
        });

        it('should handle invalid URLs', () => {
            const domain = getDomainFromUrl('invalid');
            expect(domain).toBe('invalid');
        });
    });

    describe('stringToURL', () => {
        it('should convert string to URL object', () => {
            const url = stringToURL('https://example.com/path');
            expect(url.hostname).toBe('example.com');
            expect(url.pathname).toBe('/path');
        });

        it('should add https protocol if missing', () => {
            const url = stringToURL('example.com');
            expect(url.protocol).toBe('https:');
        });

        it('should throw error for invalid URLs', () => {
            expect(() => stringToURL('')).toThrow();
        });
    });
});
