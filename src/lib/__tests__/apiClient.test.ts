import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { createApiClient } from '../apiClient';
import { TokenStorage } from '../tokenStorage';

// Every request answers 401, as an unknown passkey or an expired session would
const unauthorizedAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
	const response = { status: 401, statusText: 'Unauthorized', data: { message: 'Passkey sign-in failed' }, headers: {}, config } as AxiosResponse;
	throw new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, null, response);
};

describe('apiClient 401 handling', () => {
	let clearTokens: jest.SpyInstance;

	beforeEach(() => {
		localStorage.clear();
		clearTokens = jest.spyOn(TokenStorage, 'clearTokens');
		// jsdom cannot navigate; silence its "not implemented" report for the redirect case
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => jest.restoreAllMocks());

	it('passes a failed sign-in straight back, without refreshing or redirecting', async () => {
		const client = createApiClient('https://api.example.test');
		client.defaults.adapter = unauthorizedAdapter;

		await expect(client.post('/auth/passkey/login/verify', {})).rejects.toMatchObject({
			response: { status: 401, data: { message: 'Passkey sign-in failed' } }
		});
		await expect(client.post('/auth/magic-link/verify', {})).rejects.toMatchObject({ response: { status: 401 } });
		expect(clearTokens).not.toHaveBeenCalled();
	});

	it('still treats a 401 elsewhere as an expired session', async () => {
		const client = createApiClient('https://api.example.test');
		client.defaults.adapter = unauthorizedAdapter;

		await expect(client.get('/auth/me')).rejects.toBeTruthy();
		expect(clearTokens).toHaveBeenCalled();
	});
});
