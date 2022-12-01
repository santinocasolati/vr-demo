import * as CANNON from 'cannon-es';
import * as THREE from 'three';

interface Bounds {
    x: number,
    y: number,
    z: number
}

export class Physics {
    world: CANNON.World;
    defaultMaterial: CANNON.Material;
    groundMaterial: CANNON.Material;
    physicsArray: {mesh: THREE.Mesh, body: CANNON.Body}[];

    constructor() {
        this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

        this.defaultMaterial = new CANNON.Material();
        this.groundMaterial = new CANNON.Material();

        this.physicsArray = [];

        this.init();
    }

    init() {
        this.setContacts();
        this.setGround();
    }

    setContacts() {
        const defaultContact = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0,
                restitution: 0.2
            }
        );

        const defaultContactFloor = new CANNON.ContactMaterial(
            this.groundMaterial,
            this.defaultMaterial,
            {
                friction: 0.5,
                restitution: 0.2
            }
        );

        this.world.addContactMaterial(defaultContact);
        this.world.addContactMaterial(defaultContactFloor);
    }

    setGround() {
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
            material: this.groundMaterial
        });

        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);
    }

    addItemBox(mesh:THREE.Mesh, bounds:Bounds, mass:number) {
        const body = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(bounds.x * 0.5, bounds.y * 0.5, bounds.z * 0.5)),
            mass: mass,
            position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
            material: this.defaultMaterial
        });

        this.world.addBody(body);
        this.physicsArray.push({mesh: mesh, body: body});
    }

    update() {
        this.world.fixedStep();

        this.physicsArray.forEach(pa => {
            pa.mesh.position.copy(new THREE.Vector3(pa.body.position.x, pa.body.position.y, pa.body.position.z));
            pa.mesh.quaternion.copy(new THREE.Quaternion(pa.body.quaternion.x, pa.body.quaternion.y, pa.body.quaternion.z, pa.body.quaternion.w));
        });
    }
}