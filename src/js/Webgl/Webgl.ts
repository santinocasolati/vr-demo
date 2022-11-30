import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import * as dat from 'dat.gui';

interface Params {
    domElement: Element | null,
}

export default class Webgl {
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;

    constructor(param: Params) {
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 1.6, 0);

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        param.domElement?.appendChild(this.renderer.domElement);
    }

    init() {
        this.initScene();
        this.setupVR();
        this.addLight();

        window.addEventListener('resize', this.resize.bind(this));

        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    initScene() {

    }

    setupVR() {
        this.renderer.xr.enabled = true;

        document.body.appendChild(VRButton.createButton(this.renderer));

        const dolly = new THREE.Object3D();
        dolly.add(this.camera);
        this.scene.add(dolly);

        const dummyCam = new THREE.Object3D();
        this.camera.add(dummyCam);

    }

    addLight() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x404040);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();

        this.scene.add(light, hemiLight);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {

        this.renderer.render(this.scene, this.camera);
    }
}