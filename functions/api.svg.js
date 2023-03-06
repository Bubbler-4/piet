/* eslint-disable import/prefer-default-export */
export function onRequest(context) {
  console.log(context.request.url.split('?')[1]);
  return new Response('<svg></svg>');
}
