import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { gsap } from 'gsap';

import { Physics } from './Physics/Physics';

interface Params {
    domElement: Element | null,
}

interface HoverArray {
    mesh: THREE.Mesh,
    action: () => void
}

export default class Webgl {
    playing: boolean;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    physics: Physics;
    hoverElems: [HoverArray];
    raycaster: THREE.Raycaster;
    hovering: HoverArray | null;
    prevHovering: HoverArray | null;

    constructor(param: Params) {
        this.playing = false;

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 0, 0);

        this.scene = new THREE.Scene();
        this.physics = new Physics();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        param.domElement?.appendChild(this.renderer.domElement);

        this.hoverElems = [];
        this.raycaster = new THREE.Raycaster();
        this.hovering = null;
        this.prevHovering = null;

        this.init();
    }

    init() {
        this.setupVR();
        this.setCrosshair();

        this.addRoom();
        this.addLight();

        setInterval(() => {
            this.checkStillHover(this)
        }, 15);

        window.addEventListener('resize', this.resize.bind(this));

        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    start() {
        this.playing = true;
    }

    stop() {
        this.playing = false;
    }

    setupVR() {
        this.renderer.xr.enabled = true;

        this.renderer.xr.addEventListener('sessionstart', () => {
            this.start();
        });

        this.renderer.xr.addEventListener('sessionend', () => {
            this.stop();
        });

        document.querySelector('.button-container')?.appendChild(VRButton.createButton(this.renderer));
        
        setTimeout(() => {
            document.querySelector('#VRButton').style = '';
        }, 500);

        const dolly = new THREE.Object3D();
        dolly.add(this.camera);
        this.scene.add(dolly);

        const dummyCam = new THREE.Object3D();
        this.camera.add(dummyCam);
    }

    setCrosshair() {
        this.crosshair = new THREE.Mesh(
            new THREE.RingGeometry(
                0.05 * 0.1,
                0.05 * 0.1 * 1.5,
                32,
                0,
                Math.PI * 0.5,
                Math.PI * 2
            ),
            new THREE.MeshBasicMaterial({
                color: "green"
            })
        )

        this.crosshair.position.z = -0.2;
        this.camera.add(this.crosshair);

        this.progress = {
            time: 0
        }

        this.hoverAnim = gsap.timeline({
            onComplete: () => {
                this.prevHovering?.action();
                this.crosshair.scale.set(1, 1, 1);
            }
        });
        this.hoverAnim.fromTo(this.crosshair.scale, {x: 1, y: 1, z: 1}, { x: 0, y: 0, z: 0 }, 0);
        this.hoverAnim.pause();
    }

    addRoom() {
        const room = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 1, 1),
            new THREE.MeshStandardMaterial({
                color: '#CCC',
                side: THREE.DoubleSide,
            })
        );

        room.rotation.x = -Math.PI / 2;

        this.scene.add(room);

        const interruptor = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1, 1, 1, 1),
            new THREE.MeshStandardMaterial({
                color: 'red'
            })
        );

        this.hoverElems.push(
            {
                mesh: interruptor,
                action: function () {
                    console.log('hover');
                }
            }
        )

        interruptor.position.set(0, 0, -2);

        this.scene.add(interruptor);
    }

    addLight() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x404040);

        const light = new THREE.DirectionalLight(0xffffff, 0.8);

        this.scene.add(light, hemiLight);
    }

    setRaycast() {
        const cameraWorldPos = new THREE.Vector3();
        const cameraWorldDir = new THREE.Vector3();

        this.camera.getWorldPosition(cameraWorldPos);
        this.camera.getWorldDirection(cameraWorldDir);

        this.raycaster.set(cameraWorldPos, cameraWorldDir);

        this.hoverElems.forEach(he => {
            const intersect = this.raycaster.intersectObjects([he.mesh]);

            if (intersect.length > 0) {
                this.hovering = he;

                if (this.prevHovering == null) {
                    this.prevHovering = he;
                }
            } else {
                this.hovering = null;
            }
        });
    }

    checkStillHover(that:any) {    
        if (that.playing) {
            if (that.hovering == that.prevHovering && that.hovering != null) {
                that.crosshair.material.color = new THREE.Color("white");
                that.progress.time += 0.01;
                that.hoverAnim.progress(that.progress.time);
            } else {
                that.prevHovering = null;
                that.crosshair.material.color = new THREE.Color("green");
                that.progress.time = 0;
                that.hoverAnim.progress(that.progress.time);
            }
        }
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.physics.update();

        this.setRaycast();

        this.renderer.render(this.scene, this.camera);
    }
}