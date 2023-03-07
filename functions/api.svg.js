/* eslint-disable import/prefer-default-export */

export function onRequest(context) {
  const data = context.request.url
    .split('?')[1]
    .split(',')
    .map(x => +x);
  // data: rows,cols,...colors
  const rows = data[0];
  const cols = data[1];
  const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" id="svg-code" width="${cols * 30 + 15}" height="${rows * 30 + 10}">`;
  const svgDefs = '<defs><rect width="30" height="30" id="r0" fill="#FFC0C0"></rect><rect width="30" height="30" id="r1" fill="#FFFFC0"></rect><rect width="30" height="30" id="r2" fill="#C0FFC0"></rect><rect width="30" height="30" id="r3" fill="#C0FFFF"></rect><rect width="30" height="30" id="r4" fill="#C0C0FF"></rect><rect width="30" height="30" id="r5" fill="#FFC0FF"></rect><rect width="30" height="30" id="r6" fill="#FF0000"></rect><rect width="30" height="30" id="r7" fill="#FFFF00"></rect><rect width="30" height="30" id="r8" fill="#00FF00"></rect><rect width="30" height="30" id="r9" fill="#00FFFF"></rect><rect width="30" height="30" id="r10" fill="#0000FF"></rect><rect width="30" height="30" id="r11" fill="#FF00FF"></rect><rect width="30" height="30" id="r12" fill="#C00000"></rect><rect width="30" height="30" id="r13" fill="#C0C000"></rect><rect width="30" height="30" id="r14" fill="#00C000"></rect><rect width="30" height="30" id="r15" fill="#00C0C0"></rect><rect width="30" height="30" id="r16" fill="#0000C0"></rect><rect width="30" height="30" id="r17" fill="#C000C0"></rect><rect width="30" height="30" id="r18" fill="#FFFFFF"></rect><rect width="30" height="30" id="r19" fill="#000000"></rect><text fill="#000000" style="text-anchor: middle; dominant-baseline: middle; font-size: 10px;" id="t"></text></defs>';
  let svgBody = '';
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const idx = 2 + r * cols + c;
      svgBody += `<use href="#r${data[idx]}" x="${c * 30 + 15}" y="${r * 30 + 10}"></use>`;
    }
  }
  const rowIndex = r => {
    if (r < 26) {
      return String.fromCharCode(r + 65);
    }
    if (r < 26 + 26 * 26) {
      return String.fromCharCode(((r / 26) | 0) + 65, (r % 26) + 65);
    }
    return String.fromCharCode(((r / 26 / 26) | 0) + 65, ((r / 26) | 0) % 26 + 65, r % 26 + 65);
  };
  for (let r = 0; r < rows; r += 1) {
    svgBody += `<text fill="#000000" style="text-anchor: middle; dominant-baseline: middle; font-size: 10px;" x="7.5" y="${r * 30 + 10 + 15}">${rowIndex(r)}</text>`;
  }
  for (let c = 0; c < cols; c += 1) {
    svgBody += `<text fill="#000000" style="text-anchor: middle; dominant-baseline: middle; font-size: 10px;" x="${c * 30 + 15 + 15}" y="5">${c}</text>`;
  }
  const svgFooter = '</svg>';
  const response = new Response(svgHeader + svgDefs + svgBody + svgFooter);
  response.headers.set('Content-Type', 'image/svg+xml');
  return response;
}
