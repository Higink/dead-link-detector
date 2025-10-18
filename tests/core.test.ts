import {scan} from '../lib/core';
import axios from 'axios';

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
});
