/* eslint-disable import/prefer-default-export */

const svgData = `<svg id="svg-code" width="338" height="158"><defs><rect width="30" height="30" id="rectSlew46j5x1o"></rect></defs><use xlink:href="#rectSlew46j5x1o" x="0" y="0" fill="#c0ffc0" style=""></use><use xlink:href="#rectSlew46j5x1o" x="30" y="0" fill="#ff00ff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="60" y="0" fill="#ffc0c0" style=""></use><use xlink:href="#rectSlew46j5x1o" x="90" y="0" fill="#ffc0c0" style=""></use><use xlink:href="#rectSlew46j5x1o" x="120" y="0" fill="#ff0000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="150" y="0" fill="#c00000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="180" y="0" fill="#c0c0ff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="210" y="0" fill="#00c000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="240" y="0" fill="#c00000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="270" y="0" fill="#ffc0c0" style=""></use><use xlink:href="#rectSlew46j5x1o" x="300" y="0" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="0" y="30" fill="#ff0000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="30" y="30" fill="#ffffff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="60" y="30" fill="#c00000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="90" y="30" fill="#00c0c0" style=""></use><use xlink:href="#rectSlew46j5x1o" x="120" y="30" fill="#00ffff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="150" y="30" fill="#ff00ff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="180" y="30" fill="#ffffc0" style=""></use><use xlink:href="#rectSlew46j5x1o" x="210" y="30" fill="#c0c000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="240" y="30" fill="#ffff00" style=""></use><use xlink:href="#rectSlew46j5x1o" x="270" y="30" fill="#ffff00" style=""></use><use xlink:href="#rectSlew46j5x1o" x="300" y="30" fill="#ffff00" style=""></use><use xlink:href="#rectSlew46j5x1o" x="0" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="30" y="60" fill="#ffc0c0" style=""></use><use xlink:href="#rectSlew46j5x1o" x="60" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="90" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="120" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="150" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="180" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="210" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="240" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="270" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="300" y="60" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="0" y="90" fill="#ffc0ff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="30" y="90" fill="#c00000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="60" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="90" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="120" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="150" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="180" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="210" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="240" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="270" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="300" y="90" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="0" y="120" fill="#ffc0ff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="30" y="120" fill="#ffc0ff" style=""></use><use xlink:href="#rectSlew46j5x1o" x="60" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="90" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="120" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="150" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="180" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="210" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="240" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="270" y="120" fill="#000000" style=""></use><use xlink:href="#rectSlew46j5x1o" x="300" y="120" fill="#000000" style=""></use></svg>`;

export function onRequest(context) {
  // console.log(context.request.url.split('?')[1]);
  // example data
  const response = new Response(svgData);
  response.headers.set('Content-Type', 'image/svg+xml');
  return response;
}
