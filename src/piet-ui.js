import Snap from 'snapsvg';
import $ from 'jquery';
import Piet from './piet.js';
import PietRun from './piet-run.js';

export default class PietUI {
  constructor(code) {
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

    this.export = {
      pngButton: $('#export-png'),
      svgButton: $('#export-svg'),
      updateExportLink: () => {
        const { rows, cols } = this.code;
        const matrix = this.code.code;
        const canvas = $('<canvas/>');
        canvas.prop({ width: cols, height: rows });
        const canvasEl = canvas.get(0);
        const ctx = canvasEl.getContext('2d');
        const imdata = ctx.getImageData(0, 0, cols, rows);
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            const idx = (r * cols + c) * 4;
            const { colorvec } = Piet.colors[matrix[r][c]];
            for (let i = 0; i < 4; i += 1) {
              imdata.data[idx + i] = colorvec[i];
            }
          }
        }
        ctx.putImageData(imdata, 0, 0);
        canvasEl.toBlob(blob => {
          const pngUrl = URL.createObjectURL(blob);
          this.export.pngButton.prop({ href: pngUrl });
        });
        // const pngUrl = canvasEl.toDataURL('image/png');
        // this.export.pngButton.prop({ href: pngUrl });
        const svgStr = this.codeSvg
          .outerSVG()
          .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        const svgBlob = new Blob([svgStr]);
        const svgUrl = URL.createObjectURL(svgBlob);
        this.export.svgButton.prop({ href: svgUrl });
      },
    };
    $('#nav-share-tab').on('click', () => {
      this.export.updateExportLink();
    });

    $('#nav-debug-tab').on('click', () => {
      const codeGrid = this.code.code;
      const startEl = $('#debug-start');
      const stepEl = $('#debug-step');
      const resetEl = $('#debug-reset');
      const inputEl = $('#debug-input');
      const outputEl = $('#debug-output');
      const stackEl = $('#debug-stack');
      const statusEl = $('#debug-status');
      const dpEl = $('#debug-dp');
      const ccEl = $('#debug-cc');
      const cmdEl = $('#debug-cmd');
      startEl.off('click');
      stepEl.off('click');
      resetEl.off('click');
      let origInput;
      let arrowEl;
      const updateUi = () => {
        const { dp, cc, input, output, stack, lastCmd } = this.runner;
        const dpDesc = PietRun.dpText[dp];
        const ccDesc = PietRun.ccText[dp * 2 + cc];
        dpEl.text(`${dp} (${dpDesc})`);
        ccEl.text(`${cc} (${ccDesc})`);
        inputEl.val(input);
        outputEl.val(output);
        const stackStr = stack.map(n => n.toString()).join(' ');
        stackEl.val(stackStr);
        cmdEl.text(lastCmd);
      };
      startEl.on('click', () => {
        outputEl.val('');
        if (codeGrid[0][0] === 19) {
          statusEl.text('Error: Starting black cell detected');
          dpEl.text('N/A');
          ccEl.text('N/A');
        } else {
          origInput = inputEl.val();
          this.runner = new PietRun(codeGrid, origInput);
          console.log(this.runner);
          startEl.prop('disabled', true);
          stepEl.prop('disabled', false);
          resetEl.prop('disabled', false);
          inputEl.prop('readonly', true);
          statusEl.text('Running');
          updateUi();
          arrowEl = this.codeSvg.polygon(20, 5, 20, 25, 30, 15);
          arrowEl.attr({ fill: 'gray' });
          const mat = Snap.matrix().translate(
            this.runner.curC * 30,
            this.runner.curR * 30,
          );
          arrowEl.transform(mat);
        }
      });
      stepEl.on('click', () => {
        console.log('step');
        this.runner.step();
        updateUi();
        const mat = Snap.matrix()
          .translate(this.runner.curC * 30, this.runner.curR * 30)
          .rotate(this.runner.dp * 90, 15, 15);
        arrowEl.transform(mat);
        if (this.runner.finished) {
          stepEl.prop('disabled', true);
          statusEl.text('Finished');
          arrowEl.remove();
        }
      });
      resetEl.on('click', () => {
        console.log('reset');
        startEl.prop('disabled', false);
        stepEl.prop('disabled', true);
        resetEl.prop('disabled', true);
        inputEl.prop('readonly', false);
        inputEl.val(origInput);
        statusEl.text('N/A');
        dpEl.text('N/A');
        ccEl.text('N/A');
        cmdEl.text('N/A');
        if (arrowEl !== undefined) arrowEl.remove();
      });
    });
    $('#nav-edit-tab, #nav-test-tab, #nav-share-tab').on('click', () => {
      $('#debug-reset').trigger('click');
    });
  }
}