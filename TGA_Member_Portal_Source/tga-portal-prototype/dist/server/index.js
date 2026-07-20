export default {
  async fetch(request, environment) {
    if (!environment.ASSETS) {
      return new Response('Static asset binding unavailable.', { status: 503 });
    }

    const url = new URL(request.url);
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/') {
      return environment.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }

    const response = await environment.ASSETS.fetch(request);
    const isPageRequest = request.method === 'GET' || request.method === 'HEAD';
    const hasFileExtension = /\.[^/]+$/.test(url.pathname);

    if (response.status === 404 && isPageRequest && !hasFileExtension) {
      return environment.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }

    return response;
  }
};
