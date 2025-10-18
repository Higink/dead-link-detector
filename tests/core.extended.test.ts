import axios, {AxiosError} from 'axios';
import {scan} from '../lib/core';
import {mocked} from 'jest-mock';

jest.mock('axios');
const mockedAxios = mocked(axios);

describe('scan - Extended Test Cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
