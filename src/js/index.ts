import '../scss/app.scss';


import ReactSetup from "./ReactSetup/ReactSetup";
import Webgl from "./Webgl/Webgl";

declare global {
  interface Window {
    webgl: any
  }
}

export default class Site {

  constructor() {
    this.setReact();
    this.setWebgl();
    this.resize();
    this.setResize();
  }

  setReact() {
    new ReactSetup();
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

