import '../scss/app.scss';

import Webgl from "./Webgl/Webgl";

declare global {
  interface Window {
    webgl: any
  }
}

export default class Site {

  constructor() {
    this.setWebgl();
    this.resize();
    this.setResize();
  }

  setWebgl() {
    window.webgl = new Webgl({
      domElement: document.querySelector('#webgl-container') as HTMLElement
    });
  }

  resize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  setResize() {
    window.addEventListener("resize", () => {
      this.resize();
    });
  }
}

new Site();

