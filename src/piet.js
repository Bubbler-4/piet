export default class Piet {
  static commandText = [
    ['', '+', '/', '<', 'dup', 'inC'],
    ['push', '-', '%', 'DP+', 'roll', 'outN'],
    ['pop', '*', '!', 'CC+', 'inN', 'outC'],
  ];

  static initialize() {
    this.char2color = {};
    this.colors = [];
    const hueMask = [4, 6, 2, 3, 1, 5];
    const lightStr = [
      ['C0', 'FF'],
      ['00', 'FF'],
      ['00', 'C0'],
    ];
    for (let darkness = 0; darkness < 3; darkness += 1) {
      const light = lightStr[darkness];
      for (let hue = 0; hue < 6; hue += 1) {
        const charcode = darkness * 32 + hue + 48;
        let colorcode = '#';
        const colorvec = [];
        for (let i = 0; i < 3; i += 1) {
          const nextVal = light[(hueMask[hue] >> (2 - i)) & 1];
          colorcode += nextVal;
          colorvec.push(Number.parseInt(nextVal, 16));
        }
        colorvec.push(255);
        const char = String.fromCharCode(charcode);
        this.colors.push({ charcode, char, colorcode, colorvec });
        this.char2color[char] = darkness * 6 + hue;
      }
    }
    this.colors.push({
      charcode: '@'.charCodeAt(),
      char: '@',
      colorcode: '#FFFFFF',
    });
    this.char2color['@'] = 18;
    this.colors.push({
      charcode: ' '.charCodeAt(),
      char: ' ',
      colorcode: '#000000',
    });
    this.char2color[' '] = 19;
  }

  constructor(code) {
    const codeStr = code || '0';
    this.code = codeStr
      .split(/\r?\n/)
      .map(row => [...row].map(cell => Piet.char2color[cell]));
    this.rows = this.code.length;
    this.cols = this.code[0].length;
  }

  extendCode(direction) {
    if (direction === 'r') {
      this.code.forEach(row => {
        row.push(19);
      });
      this.cols += 1;
    } else if (direction === 'l') {
      this.code.forEach(row => {
        row.unshift(19);
      });
      this.cols += 1;
    } else if (direction === 'd') {
      this.code.push(this.code[0].map(() => 19));
      this.rows += 1;
    } else if (direction === 'u') {
      this.code.unshift(this.code[0].map(() => 19));
      this.rows += 1;
    }
  }

  shrinkCode(direction) {
    if (
      ((direction === 'r' || direction === 'l') && this.cols === 1) ||
      ((direction === 'u' || direction === 'd') && this.rows === 1)
    ) {
      console.log('Dimension cannot be reduced from 1');
    } else if (direction === 'r') {
      this.code.forEach(row => {
        row.pop();
      });
      this.cols -= 1;
    } else if (direction === 'l') {
      this.code.forEach(row => {
        row.shift();
      });
      this.cols -= 1;
    } else if (direction === 'd') {
      this.code.pop();
      this.rows -= 1;
    } else if (direction === 'u') {
      this.code.shift();
      this.rows -= 1;
    }
  }
}
