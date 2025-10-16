import scan from '../lib/core';

describe('scan function', () => {
    test('should return error for invalid URL', () => {
        const result = scan('invalid-url');
        expect(result).toEqual({
            success: false,
            message: 'Invalid URL: invalid-url',
            error: "TypeError: Invalid URL"
        });
    });

    test('should handle URL with www prefix', () => {
        const result = scan('https://www.example.com');
        expect(result).toEqual({
            success: true,
            url: 'https://www.example.com/',
            domain: 'example.com'
        });
    });

    test('should handle URL without www prefix', () => {
        const result = scan('https://example.com');
        expect(result).toEqual({
            success: true,
            url: 'https://example.com/',
            domain: 'example.com'
        });
    });

    test('should handle URL with trailing slash', () => {
        const result = scan('https://example.com/');
        expect(result).toEqual({
            success: true,
            url: 'https://example.com/',
            domain: 'example.com'
        });
    });
});
