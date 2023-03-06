/* eslint-disable import/prefer-default-export */
export function onRequest(context) {
  console.log(context.request.url);
  return new Response('Hello, world!');
}
