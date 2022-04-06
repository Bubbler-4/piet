import Snap from 'snapsvg';
import $ from 'jquery';
import Piet from './piet.js';

export default class PietUI {
  constructor(code) {
    Piet.initialize();
    this.paletteSvg = Snap('#svg-palette');
    this.paletteRects = [];
    this.paletteOverlays = [];
    for (let light = 0; light < 3; light += 1) {
      this.paletteOverlays.push([]);
      for (let hue = 0; hue < 6; hue += 1) {
        const color = light * 6 + hue;
        const curRect = this.paletteSvg.el('rect', {
          width: 60,
          height: 30,
          x: 60 * hue,
          y: 30 * light,
          fill: Piet.colors[color].colorcode,
        });
        this.paletteRects.push(curRect);
        const curCmd = this.paletteSvg
          .text(60 * hue + 30, 30 * light + 15, '')
          .attr({
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'pointer-events': 'none',
          });
        if (hue === 4 && light >= 1) {
          curCmd.attr({ fill: 'white' });
        } else {
          curCmd.attr({ fill: 'black' });
        }
        this.paletteOverlays[light].push(curCmd);
        this.paletteSvg.g(curRect, curCmd).click(e => {
          e.stopPropagation();
          e.preventDefault();
          console.log(e);
          console.log(color);
          this.edit.updateColor(color);
        });
      }
    }
    for (let color = 18; color <= 19; color += 1) {
      const curRect = this.paletteSvg
        .el('rect', {
          width: 180,
          height: 30,
          x: 180 * (color - 18),
          y: 90,
          fill: Piet.colors[color].colorcode,
        })
        .click(e => {
          e.stopPropagation();
          e.preventDefault();
          console.log(e);
          console.log(color);
          this.edit.updateColor(color);
        });
      this.paletteRects.push(curRect);
    }
    this.codeSvg = Snap('#svg-code');
    this.code = new Piet(code);
    const codeRect = this.codeSvg
      .el('rect', { width: 30, height: 30 })
      .toDefs();
    this.codeRects = [[]];
    this.codeRects.update = () => {
      const prevRows = this.codeRects.length;
      const prevCols = this.codeRects[0].length;
      if (prevRows < this.code.rows) {
        const newRow = this.code.code[this.code.rows - 1].map((color, c) => {
          const curRect = this.codeSvg.use(codeRect);
          return curRect.attr({
            x: 30 * c,
            y: 30 * (this.code.rows - 1),
            fill: Piet.colors[color].colorcode,
          });
        });
        this.codeRects.push(newRow);
      } else if (prevRows > this.code.rows) {
        this.codeRects.pop().forEach(rect => rect.remove());
      }
      if (prevCols < this.code.cols) {
        this.codeRects.forEach((row, r) => {
          const newRect = this.codeSvg.use(codeRect);
          newRect.attr({
            x: 30 * (this.code.cols - 1),
            y: 30 * r,
            fill: Piet.colors[this.code.code[r][this.code.cols - 1]].colorcode,
          });
          row.push(newRect);
        });
      } else if (prevCols > this.code.cols) {
        this.codeRects.forEach(row => row.pop().remove());
      }
      this.codeRects.forEach((row, r) => {
        row.forEach((rect, c) => {
          rect.attr({ fill: Piet.colors[this.code.code[r][c]].colorcode });
        });
      });
      this.codeSvg.attr({
        width: 30 * this.code.cols + 8,
        height: 30 * this.code.rows + 8,
      });
    };
    this.codeRects.update();
    this.edit = {
      mode: 'write',
      color: 0,
      selectColor: clr => {
        this.paletteRects[clr].attr({
          stroke: 'gray',
          'stroke-width': 6,
          x: '+=3',
          y: '+=3',
          width: '-=6',
          height: '-=6',
        });
        if (clr < 18) {
          const curHue = clr % 6;
          const curLight = (clr / 6) | 0;
          for (let lightOff = 0; lightOff < 3; lightOff += 1) {
            for (let hueOff = 0; hueOff < 6; hueOff += 1) {
              const s = Piet.commandText[lightOff][hueOff];
              const nextHue = (curHue + hueOff) % 6;
              const nextLight = (curLight + lightOff) % 3;
              this.paletteOverlays[nextLight][nextHue].node.textContent = s;
            }
          }
        } else {
          for (let light = 0; light < 3; light += 1) {
            for (let hue = 0; hue < 6; hue += 1) {
              this.paletteOverlays[light][hue].node.textContent = '';
            }
          }
        }
      },
      unselectColor: clr => {
        this.paletteRects[clr].attr({
          stroke: undefined,
          'stroke-width': undefined,
          x: '-=3',
          y: '-=3',
          width: '+=6',
          height: '+=6',
        });
      },
      updateColor: clr => {
        const prevColor = this.edit.color;
        this.edit.color = clr;
        this.edit.unselectColor(prevColor);
        this.edit.selectColor(clr);
      },
      updateCodeColor1: (r, c, clr) => {
        this.code.code[r][c] = clr;
        this.codeRects[r][c].attr({ fill: Piet.colors[clr].colorcode });
      },
    };
    this.edit.selectColor(0);

    ['l', 'u', 'r', 'd'].forEach(direction => {
      ['plus', 'minus'].forEach(action => {
        const id = `#grid-${direction}${action}`;
        const button = $(id);
        button.on('click', e => {
          e.stopPropagation();
          e.preventDefault();
          if (action === 'plus') {
            this.code.extendCode(direction);
          } else {
            this.code.shrinkCode(direction);
          }
          this.codeRects.update();
        });
      });
    });

    const writeButton = $('#grid-write');
    const pickButton = $('#grid-pick');
    writeButton.on('click', () => {
      this.codeSvg.unclick();
      this.codeSvg.drag(
        (dx, dy, x, y, e) => {
          const curR = ((e.offsetY - 3) / 30) | 0;
          const curC = ((e.offsetX - 3) / 30) | 0;
          if (
            curR >= 0 &&
            curR < this.code.rows &&
            curC >= 0 &&
            curC < this.code.cols
          ) {
            this.edit.updateCodeColor1(curR, curC, this.edit.color);
          }
        },
        (x, y, e) => {
          const curR = ((e.offsetY - 3) / 30) | 0;
          const curC = ((e.offsetX - 3) / 30) | 0;
          if (
            curR >= 0 &&
            curR < this.code.rows &&
            curC >= 0 &&
            curC < this.code.cols
          ) {
            this.edit.updateCodeColor1(curR, curC, this.edit.color);
          }
        },
        () => {},
      );
    });
    pickButton.on('click', () => {
      this.codeSvg.undrag();
      this.codeSvg.click(e => {
        const curR = ((e.offsetY - 3) / 30) | 0;
        const curC = ((e.offsetX - 3) / 30) | 0;
        if (
          curR >= 0 &&
          curR < this.code.rows &&
          curC >= 0 &&
          curC < this.code.cols
        ) {
          this.edit.updateColor(this.code.code[curR][curC]);
        }
      });
    });
    writeButton.trigger('click');
  }
}
