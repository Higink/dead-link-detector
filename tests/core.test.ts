import {scan} from '../lib/core';
import axios, {AxiosError} from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Core Scanner', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle invalid URLs', async () => {
        const result = await scan('invalid-url');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });

    it('should scan a simple website successfully', async () => {
        // Mock successful responses
        mockedAxios.get.mockResolvedValueOnce({
            status: 200,
            data: '<html><body><a href="https://example.com/page2">Link</a></body></html>'
        });

        const result = await scan('https://example.com');

        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(Array.isArray(result.visitedUrlsData)).toBe(true);
    });

    it('should handle network errors', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        const result = await scan('https://example.com');

        expect(result.success).toBe(true);
        expect(result.visitedUrlsData).toBeDefined();
        expect((result.visitedUrlsData ?? []).some(data =>
            typeof data.status === 'string' && data.status === 'UNKNOWN_ERROR'
        )).toBe(true);
    });

    it('should handle different HTTP status codes', async () => {
        mockedAxios.get
            .mockResolvedValueOnce({
                status: 200,
                data: '<html><body><a href="https://example.com/404">Dead Link</a></body></html>'
            })
            .mockRejectedValueOnce({
                response: {status: 404}
            });

        const result = await scan('https://example.com');

        expect(result.success).toBe(true);
        expect((result.visitedUrlsData ?? []).some(data => data.status === 200)).toBe(true);
        expect((result.visitedUrlsData ?? []).some(data => data.status === 'UNKNOWN_ERROR')).toBe(true);
    });

    test('should handle invalid URLs correctly', async () => {
        const result = await scan('not-a-valid-url');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });

    test('should handle network timeouts', async () => {
        const error = new Error('timeout') as AxiosError;
        error.code = 'ECONNABORTED';
        error.isAxiosError = true;
        mockedAxios.get.mockRejectedValueOnce(error);

        const result = await scan('https://example.com');
        expect(result.success).toBe(true);
        expect((result.visitedUrlsData[0] ?? {}).status).toBe('TIMEOUT');
    });

    test('should handle DNS errors', async () => {
        const error = new Error('DNS error') as AxiosError;
        error.code = 'ENOTFOUND';
        error.isAxiosError = true;
        mockedAxios.get.mockRejectedValueOnce(error);

        const result = await scan('https://example.com');
        expect(result.success).toBe(true);
        expect((result.visitedUrlsData[0] ?? {}).status).toBe('DNS_ERROR');
    });

    test('should handle connection refused errors', async () => {
        const error = new Error('connection refused') as AxiosError;
        error.code = 'ECONNREFUSED';
        error.isAxiosError = true;
        mockedAxios.get.mockRejectedValueOnce(error);

        const result = await scan('https://example.com');
        expect(result.success).toBe(true);
        expect((result.visitedUrlsData[0] ?? {}).status).toBe('CONNECTION_REFUSED');
    });

    test('should handle HTTP error responses', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            status: 404,
            data: '<html></html>'
        });

        const result = await scan('https://example.com');
        expect(result.success).toBe(true);
        expect((result.visitedUrlsData[0] ?? {}).status).toBe(404);

    });

    test('should process multiple links on a page', async () => {
        mockedAxios.get
            .mockResolvedValueOnce({
                status: 200,
                data: `
                    <html>
                        <a href="/page1">Link 1</a>
                        <a href="/page2">Link 2</a>
                        <a href="https://example.com/page3">Link 3</a>
                        <a href="https://otherdomain.com">External Link</a>
                    </html>`
            })
            .mockResolvedValue({
                status: 200,
                data: '<html></html>'
            });

        const result = await scan('https://example.com');
        expect(result.success).toBe(true);
        expect(result.visitedUrls.length).toBeGreaterThan(1);
    });

    test('should handle malformed HTML gracefully', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            status: 200,
            data: '<html><a href="malformed>'
        });

        const result = await scan('https://example.com');
        expect(result.success).toBe(true);
        expect((result.visitedUrlsData[0] ?? {}).status).toBe(200);
    });

    test('should handle non-HTML responses', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            status: 200,
            data: 'Plain text content'
        });

        const result = await scan('https://example.com');
        expect(result.success).toBe(true);
        expect((result.visitedUrlsData[0] ?? {}).status).toBe(200);
    });
});
