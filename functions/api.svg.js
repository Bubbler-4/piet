/* eslint-disable import/prefer-default-export */
export function onRequest(context) {
  console.log(context.request.url.split('?')[1]);
  const response = new Response('<svg></svg>');
  response.headers.set('Content-Type', 'image/svg+xml');
  return response;
}
