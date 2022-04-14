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
      let prevRows = this.codeRects.length;
      let prevCols = this.codeRects[0].length;
      while (prevCols < this.code.cols) {
        const c = prevCols;
        this.codeRects.forEach((row, r) => {
          const newRect = this.codeSvg.use(codeRect);
          newRect.attr({
            x: 30 * c,
            y: 30 * r,
            fill: Piet.colors[this.code.code[r][c]].colorcode,
          });
          row.push(newRect);
        });
        prevCols += 1;
      }
      while (prevCols > this.code.cols) {
        this.codeRects.forEach(row => row.pop().remove());
        prevCols -= 1;
      }
      while (prevRows < this.code.rows) {
        const r = prevRows;
        const newRow = this.code.code[r].map((color, c) => {
          const curRect = this.codeSvg.use(codeRect);
          return curRect.attr({
            x: 30 * c,
            y: 30 * r,
            fill: Piet.colors[color].colorcode,
          });
        });
        this.codeRects.push(newRow);
        prevRows += 1;
      }
      while (prevRows > this.code.rows) {
        this.codeRects.pop().forEach(rect => rect.remove());
        prevRows -= 1;
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

    this.import = {
      fileButton: $('#import-file'),
      fileInputButton: $('#import-file-input'),
      asciiButton: $('#import-ascii'),
    };
    this.import.fileButton.on('click', () =>
      this.import.fileInputButton.trigger('click'),
    );
    this.import.fileInputButton.on('change', e => {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        const canvas = $('<canvas/>');
        canvas.prop({ width, height });
        const canvasEl = canvas.get(0);
        const ctx = canvasEl.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imdata = ctx.getImageData(0, 0, width, height);
        const codeGrid = [];
        if (width === 0 || height === 0) {
          codeGrid.push([19]); // fallback to single black cell
          width = 1;
          height = 1;
        } else {
          for (let r = 0; r < height; r += 1) {
            codeGrid.push([]);
            for (let c = 0; c < width; c += 1) {
              const idx = r * width * 4 + c * 4;
              const color =
                Piet.colorvec2color[imdata.data.slice(idx, idx + 4)] ?? 19;
              codeGrid[r].push(color);
            }
          }
        }
        const codeGrid2 = Piet.compress(codeGrid, width, height);
        this.code.replaceCode(codeGrid2);
        this.codeRects.update();
      };
      img.src = url;
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
      const speedEl = $('#debug-speed');
      const runEl = $('#debug-run');
      const pauseEl = $('#debug-pause');
      startEl.off('click');
      stepEl.off('click');
      resetEl.off('click');
      runEl.off('click');
      pauseEl.off('click');
      let animationId;
      let animationStartTime;
      let animationSpeed;
      let animationSteps;
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
          runEl.prop('disabled', false);
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
        statusEl.text('Running');
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
      runEl.on('click', () => {
        animationSpeed = Number(speedEl.val());
        if (
          Number.isSafeInteger(animationSpeed) &&
          animationSpeed > 0 &&
          animationSpeed < 1000
        ) {
          runEl.prop('disabled', true);
          pauseEl.prop('disabled', false);
          stepEl.prop('disabled', true);
          statusEl.text('Running');
          animationStartTime = performance.now();
          animationSteps = 0;
          const updateFrame = time => {
            animationId = requestAnimationFrame(updateFrame);
            const timeElapsed = time - animationStartTime;
            const nextSteps = Math.ceil((animationSpeed * timeElapsed) / 1000);
            for (; animationSteps < nextSteps; animationSteps += 1) {
              stepEl.trigger('click');
              if (this.runner.finished) {
                pauseEl.prop('disabled', true);
                cancelAnimationFrame(animationId);
                return;
              }
            }
          };
          animationId = requestAnimationFrame(updateFrame);
        } else {
          console.log('Invalid speed value');
          statusEl.text('Invalid speed value. Allowed values: 1 - 999');
        }
      });
      pauseEl.on('click', () => {
        runEl.prop('disabled', false);
        pauseEl.prop('disabled', true);
        stepEl.prop('disabled', false);
        cancelAnimationFrame(animationId);
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

    $('#nav-test-tab').on('click', () => {
      const sepEl = $('#test-sep');
      const limitEl = $('#test-limit');
      const runEl = $('#test-run');
      const stopEl = $('#test-stop');
      const escapeEl = $('#test-escape');
      const statusEl = $('#test-status');
      const inputEl = $('#test-input');
      const outputEl = $('#test-output');

      runEl.on('click', () => {
        const sep = sepEl.val() === '' ? '---' : sepEl.val();
        sepEl.val(sep);
        const limitVal = Number(limitEl.val());
        const limit =
          Number.isSafeInteger(limitVal) && limitVal > 0 ? limitVal : 1000000;
        limitEl.val(limit);
        runEl.prop('disabled', true);
        stopEl.prop('disabled', false);
        inputEl.prop('readonly', true);
        const doEscape = escapeEl.prop('checked');
        let inputs = inputEl.val().split(`\n${sep}\n`);
        if (doEscape) {
          inputs = inputs.map(s =>
            s.replace(
              /\\[0'"\\nrvtbf]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}|\\x[0-9a-fA-F]{2}/g,
              match => {
                if (match.startsWith('\\u') || match.startsWith('\\x')) {
                  const hex = match.startsWith('\\u{')
                    ? match.slice(3, -1)
                    : match.slice(2);
                  return String.fromCodePoint(Number.parseInt(hex, 16));
                }
                return {
                  '\\0': '\0',
                  "\\'": "'",
                  '\\"': '"',
                  '\\\\': '\\',
                  '\\n': '\n',
                  '\\r': '\r',
                  '\\v': '\v',
                  '\\t': '\t',
                  '\\b': '\b',
                  '\\f': '\f',
                }[match];
              },
            ),
          );
        }
        const runners = inputs.map(input => new PietRun(this.code.code, input));
        const stepsPerRunner = runners.map(() => 0);
        let alive = runners.length;
        const steps = 10; // steps per ms
        const startTime = performance.now();
        let stepsRun = 0;
        let runId;
        statusEl.text('Running');
        const update = time => {
          runId = requestAnimationFrame(update);
          const totalSteps = Math.ceil(steps * (time - startTime));
          const singleSteps = Math.round((totalSteps - stepsRun) / alive);
          runners.forEach((runner, i) => {
            if (runner.finished) return;
            for (let s = 0; s < singleSteps; s += 1) {
              runner.step();
              stepsRun += 1;
              stepsPerRunner[i] += 1;
              if (stepsPerRunner[i] >= limit) {
                runner.finished = true;
              }
              if (runner.finished) {
                alive -= 1;
                break;
              }
            }
          });
          if (alive === 0) {
            stopEl.trigger('click');
          }
          console.log(limit, totalSteps, singleSteps, stepsPerRunner);
        };
        stopEl.on('click', () => {
          cancelAnimationFrame(runId);
          const outputs = runners.map(runner => runner.output);
          runners.forEach((runner, i) => {
            if (!runner.finished) {
              outputs[i] += '\n** Aborted';
            } else if (stepsPerRunner[i] >= limit) {
              outputs[i] += '\n** Exceeded Step Limit';
            }
          });
          outputEl.val(outputs.join('\n---\n'));
          statusEl.text('Finished');
          stopEl.prop('disabled', true);
          runEl.prop('disabled', false);
          inputEl.prop('readonly', false);
        });
        runId = requestAnimationFrame(update);
      });
    });
  }
}
