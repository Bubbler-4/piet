import Piet from './piet.js';

function divmod(x, y) {
  if ((x >= 0n && y > 0n) || (x < 0n && y < 0n)) {
    return [x / y, x % y];
  }
  const xabs = x >= 0n ? x : -x;
  const [yabs, ysgn] = y >= 0n ? [y, 1n] : [-y, -1n];
  let div = xabs / yabs;
  let mod = xabs % yabs;
  if (mod !== 0n) {
    div += 1n;
    mod = yabs - mod;
  }
  return [-div, mod * ysgn];
}

export default class PietRun {
  static {
    this.rOff = [0, 1, 0, -1];
    this.cOff = [1, 0, -1, 0];
    this.dpText = ['Right', 'Down', 'Left', 'Up'];
    this.ccText = [
      'Top',
      'Bottom',
      'Right',
      'Left',
      'Bottom',
      'Top',
      'Left',
      'Right',
    ];
    this.abbrev = {
      push: '',
      pop: 'x',
      '+': '+',
      '-': '-',
      '*': '*',
      '/': '/',
      '%': '%',
      '!': '!',
      '>': '>',
      'DP+': 'D',
      'CC+': 'C',
      dup: 'd',
      roll: 'r',
      inN: 'I',
      inC: 'i',
      outN: 'O',
      outC: 'o',
    };
    this.cmds = {
      push: (self, size) => {
        self.stack.push(BigInt(size));
        self.lastCmd = `push ${size}`;
      },
      pop: self => {
        self.stack.pop();
      },
      '+': self => {
        if (self.stack.length >= 2) {
          const [top2, top] = self.stack.splice(-2);
          self.stack.push(top2 + top);
        }
      },
      '-': self => {
        if (self.stack.length >= 2) {
          const [top2, top] = self.stack.splice(-2);
          self.stack.push(top2 - top);
        }
      },
      '*': self => {
        if (self.stack.length >= 2) {
          const [top2, top] = self.stack.splice(-2);
          self.stack.push(top2 * top);
        }
      },
      '/': self => {
        if (
          self.stack.length >= 2 &&
          self.stack[self.stack.length - 1] !== 0n
        ) {
          const [top2, top] = self.stack.splice(-2);
          self.stack.push(divmod(top2, top)[0]);
        }
      },
      '%': self => {
        if (
          self.stack.length >= 2 &&
          self.stack[self.stack.length - 1] !== 0n
        ) {
          const [top2, top] = self.stack.splice(-2);
          self.stack.push(divmod(top2, top)[1]);
        }
      },
      '!': self => {
        if (self.stack.length >= 1) {
          const top = self.stack.pop();
          self.stack.push(top === 0n ? 1n : 0n);
        }
      },
      '>': self => {
        if (self.stack.length >= 2) {
          const [top2, top] = self.stack.splice(-2);
          self.stack.push(top2 > top ? 1n : 0n);
        }
      },
      'DP+': self => {
        if (self.stack.length >= 1) {
          const top = self.stack.pop();
          self.dp = (self.dp + Number(top % 4n) + 4) % 4;
        }
      },
      'CC+': self => {
        if (self.stack.length >= 1) {
          const top = self.stack.pop();
          self.cc = (self.cc + Number(top % 2n) + 2) % 2;
        }
      },
      dup: self => {
        if (self.stack.length >= 1) {
          const top = self.stack.pop();
          self.stack.push(top, top);
        }
      },
      roll: self => {
        if (self.stack.length >= 2) {
          const [top2, top] = self.stack.splice(-2);
          if (top2 >= 0n && self.stack.length >= Number(top2)) {
            const rot = divmod(-top, top2)[1];
            const removed = self.stack.splice(-Number(top2), Number(rot));
            self.stack.push(...removed);
          } else {
            self.stack.push(top2, top);
          }
        }
      },
      inN: self => {
        // skip whitespaces, accept digits and stop before non-digits
        // if no digits found, no-op
        const spaces = self.input.match(/^\s*/)[0];
        self.input = self.input.slice(spaces.length);
        const number = self.input.match(/^[-+]?[0-9]+/);
        if (number !== null) {
          self.stack.push(BigInt(number[0]));
          self.input = self.input.slice(number[0].length);
        }
      },
      inC: self => {
        if (self.input !== '') {
          const cp = self.input.codePointAt(0);
          if (cp >= 65536) {
            self.input = self.input.slice(2);
          } else {
            self.input = self.input.slice(1);
          }
          self.stack.push(BigInt(cp));
        }
      },
      outN: self => {
        if (self.stack.length >= 1) {
          const top = self.stack.pop();
          self.output += top.toString();
        }
      },
      outC: self => {
        if (self.stack.length >= 1) {
          const top = self.stack.pop();
          if (top >= 0n && top <= 1114111n) {
            self.output += String.fromCodePoint(Number(top));
          }
        }
      },
    };
  }

  constructor(code, input) {
    this.dp = 0;
    this.cc = 0;
    this.curR = 0;
    this.curC = 0;
    this.lastCmd = 'N/A';
    this.lastChange = 'none';
    this.input = input;
    this.output = '';
    this.stack = [];
    this.tryHistory = [];
    this.finished = false;
    const rows = code.length;
    const cols = code[0].length;
    // for each cell (except black): reference to area object
    // for each area: list of cells, frontier cell for each dp and cc
    // white is 1 area per cell
    this.areas = [];
    for (let r = 0; r < rows; r += 1) {
      const areasRow = [];
      for (let c = 0; c < cols; c += 1) {
        areasRow.push(undefined);
      }
      this.areas.push(areasRow);
    }
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const curColor = code[r][c];
        if (this.areas[r][c] === undefined && curColor !== 19) {
          const newArea = {
            cells: [],
            color: curColor,
            frontier: [0, 0, 0, 0, 0, 0, 0, 0],
            frontierOut: [0, 0, 0, 0, 0, 0, 0, 0],
            frontierBlocked: Array(8).fill(false),
          };
          const stack = [[r, c]];
          while (stack.length !== 0) {
            const [curR, curC] = stack.pop();
            if (this.areas[curR][curC] === undefined) {
              this.areas[curR][curC] = newArea;
              newArea.cells.push([curR, curC]);
              [
                [curR - 1, curC],
                [curR, curC - 1],
                [curR + 1, curC],
                [curR, curC + 1],
              ].forEach(([nextR, nextC]) => {
                if (
                  nextR >= 0 &&
                  nextR < rows &&
                  nextC >= 0 &&
                  nextC < cols &&
                  code[nextR][nextC] === curColor &&
                  curColor !== 18
                ) {
                  stack.push([nextR, nextC]);
                }
              });
            }
          }
          // frontier calculation (right x2, down x2, left x2, up x2)
          for (let i = 0; i < 8; i += 1) {
            newArea.frontier[i] = [r, c];
          }
          newArea.cells.forEach(([curR, curC]) => {
            const conds = [
              ([fr, fc]) => curC > fc || (curC === fc && curR < fr),
              ([fr, fc]) => curC > fc || (curC === fc && curR > fr),
              ([fr, fc]) => curR > fr || (curR === fr && curC > fc),
              ([fr, fc]) => curR > fr || (curR === fr && curC < fc),
              ([fr, fc]) => curC < fc || (curC === fc && curR > fr),
              ([fr, fc]) => curC < fc || (curC === fc && curR < fr),
              ([fr, fc]) => curR < fr || (curR === fr && curC < fc),
              ([fr, fc]) => curR < fr || (curR === fr && curC > fc),
            ];
            conds.forEach((cond, i) => {
              const front = newArea.frontier[i];
              if (cond(front)) {
                newArea.frontier[i] = [curR, curC];
              }
            });
          });
          for (let i = 0; i < 8; i += 1) {
            const [fr, fc] = newArea.frontier[i];
            const outR = fr + PietRun.rOff[(i / 2) | 0];
            const outC = fc + PietRun.cOff[(i / 2) | 0];
            newArea.frontierOut[i] = [outR, outC];
            newArea.frontierBlocked[i] =
              outR < 0 ||
              outR >= rows ||
              outC < 0 ||
              outC >= cols ||
              code[outR][outC] === 19;
          }
        }
      }
    }
    const startArea = this.areas[0][0];
    [this.curR, this.curC] = startArea.frontier[this.dp * 2 + this.cc];
  }

  step() {
    const cycleDetected = this.tryHistory.some(
      ([r, c, dp, cc]) =>
        this.curR === r && this.curC === c && this.dp === dp && this.cc === cc,
    );
    if (cycleDetected) {
      this.finished = true;
      return;
    }
    const curArea = this.areas[this.curR][this.curC];
    const { color, frontierOut, frontierBlocked } = curArea;
    const [nextR, nextC] = frontierOut[this.dp * 2 + this.cc];
    const blocked = frontierBlocked[this.dp * 2 + this.cc];
    if (blocked) {
      this.tryHistory.push([this.curR, this.curC, this.dp, this.cc]);
      if (this.lastChange === 'cc') {
        this.dp = (this.dp + 1) & 3;
        this.lastChange = 'dp';
      } else {
        this.cc = 1 - this.cc;
        this.lastChange = 'cc';
      }
      [this.curR, this.curC] = curArea.frontier[this.dp * 2 + this.cc];
      this.lastCmd = 'blocked';
      // console.log('blocked');
    } else {
      this.lastChange = 'none';
      if (color === 18) {
        this.tryHistory.push([this.curR, this.curC, this.dp, this.cc]);
        const nextArea = this.areas[nextR][nextC];
        [this.curR, this.curC] = nextArea.frontier[this.dp * 2 + this.cc];
        this.lastCmd = 'noop';
        // console.log('noop');
      } else {
        this.tryHistory.length = 0;
        const nextArea = this.areas[nextR][nextC];
        [this.curR, this.curC] = nextArea.frontier[this.dp * 2 + this.cc];
        const nextColor = nextArea.color;
        if (nextColor === 18) {
          this.lastCmd = 'noop';
          // console.log('noop');
        } else {
          const lightDiff = (((nextColor / 6 + 3) | 0) - ((color / 6) | 0)) % 3;
          const hueDiff = ((nextColor % 6) + 6 - (color % 6)) % 6;
          this.lastCmd = Piet.commandText[lightDiff][hueDiff];
          // console.log('cmd:', lightDiff, hueDiff, this.lastCmd);
          PietRun.cmds[this.lastCmd](this, curArea.cells.length);
          [this.curR, this.curC] = nextArea.frontier[this.dp * 2 + this.cc];
        }
      }
    }
  }

  dryStep() {
    const cycleDetected = this.tryHistory.some(
      ([r, c, dp, cc]) =>
        this.curR === r && this.curC === c && this.dp === dp && this.cc === cc,
    );
    if (cycleDetected) {
      this.finished = true;
      return { finished: true };
    }
    const [lastR, lastC] = [this.curR, this.curC];
    const curArea = this.areas[this.curR][this.curC];
    const { color, frontierOut, frontierBlocked } = curArea;
    const [nextR, nextC] = frontierOut[this.dp * 2 + this.cc];
    const blocked = frontierBlocked[this.dp * 2 + this.cc];
    if (blocked) {
      this.tryHistory.push([this.curR, this.curC, this.dp, this.cc]);
      if (this.lastChange === 'cc') {
        this.dp = (this.dp + 1) & 3;
        this.lastChange = 'dp';
      } else {
        this.cc = 1 - this.cc;
        this.lastChange = 'cc';
      }
      [this.curR, this.curC] = curArea.frontier[this.dp * 2 + this.cc];
      this.lastCmd = 'blocked';
      return { finished: false, blocked: true };
      // console.log('blocked');
    }
    this.lastChange = 'none';
    if (color === 18) {
      this.tryHistory.push([this.curR, this.curC, this.dp, this.cc]);
      const nextArea = this.areas[nextR][nextC];
      [this.curR, this.curC] = nextArea.frontier[this.dp * 2 + this.cc];
      this.lastCmd = 'noop';
      // console.log('noop');
    } else {
      this.tryHistory.length = 0;
      const nextArea = this.areas[nextR][nextC];
      [this.curR, this.curC] = nextArea.frontier[this.dp * 2 + this.cc];
      const nextColor = nextArea.color;
      if (nextColor === 18) {
        this.lastCmd = 'noop';
        // console.log('noop');
      } else {
        const lightDiff = (((nextColor / 6 + 3) | 0) - ((color / 6) | 0)) % 3;
        const hueDiff = ((nextColor % 6) + 6 - (color % 6)) % 6;
        this.lastCmd = Piet.commandText[lightDiff][hueDiff];
        // console.log('cmd:', lightDiff, hueDiff, this.lastCmd);
        // PietRun.cmds[this.lastCmd](this, curArea.cells.length);
        [this.curR, this.curC] = nextArea.frontier[this.dp * 2 + this.cc];
      }
    }
    let abb = '';
    if (this.lastCmd === 'push') {
      abb = `${curArea.cells.length}`;
    } else if (this.lastCmd !== 'noop') {
      abb = PietRun.abbrev[this.lastCmd];
    }
    return {
      finished: false,
      blocked: false,
      data: [lastR, lastC, nextR, nextC, abb],
      stop: abb === 'D' || abb === 'C', // stop tracing at DP+ or CC+
    };
  }

  dryRun(row, col, dp, cc) {
    const startArea = this.areas[row][col];
    [this.curR, this.curC] = startArea.frontier[dp * 2 + cc];
    this.dp = dp;
    this.cc = cc;
    const history = {};
    this.finished = false;
    const path = [];
    let gFinished = false;
    let gStop = false;
    while (
      !gFinished &&
      !gStop &&
      !history[[this.curR, this.curC, this.dp, this.cc]]
    ) {
      history[[this.curR, this.curC, this.dp, this.cc]] = true;
      const { finished, blocked, data, stop } = this.dryStep();
      if (finished) {
        gFinished = true;
      } else if (!blocked) {
        path.push(data);
        gStop = stop;
      }
    }
    return path;
  }
}
