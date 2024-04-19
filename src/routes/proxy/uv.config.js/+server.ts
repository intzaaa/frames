export const prerender = true;
import { PUBLIC_BARE } from '$env/static/public';
import type { RequestHandler } from './$types';

const script = `self.__uv$config = {
				prefix: '/proxy/service/',
				bare: '${PUBLIC_BARE}',
				encodeUrl: Ultraviolet.codec.xor.encode,
				decodeUrl: Ultraviolet.codec.xor.decode,
				handler: '/proxy/uv.handler.js',
				client: '/proxy/uv.client.js',
				bundle: '/proxy/uv.bundle.js',
				config: '/proxy/uv.config.js',
				sw: '/proxy/uv.sw.js'
			};`;

export const GET: RequestHandler = () => {
	return new Response(script, {
		headers: {
			'Content-Type': 'application/javascript'
		}
	});
};
