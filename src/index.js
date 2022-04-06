import * as bootstrap from 'bootstrap';
import $ from 'jquery';
import Snap from 'snapsvg';
import PietUI from './piet-ui.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

function init() {
  const ui = new PietUI();
}

window.onload = () => {
  init();
  console.log('loaded');
};
