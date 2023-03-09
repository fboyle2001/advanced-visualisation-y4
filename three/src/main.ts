import * as THREE from 'three';
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Sphere, SphereGeometry } from 'three';
import { renderer, scene, camera, controls, stats, updateStatsDisplay } from './utils/three_setup';

// Used for calculating elapsed and delta time
const clock = new THREE.Clock()

const displacementTexture =  new THREE.TextureLoader().load("/textures/ldem_3_8bit.jpg");
const texture = new THREE.TextureLoader().load("/textures/lroc_color_poles_1k.jpg");

const displacementMaterial = new MeshStandardMaterial({
    // color: 0x00ff00,
    map: texture,
    displacementMap: displacementTexture
})

const moon = new Mesh(
    new SphereGeometry(50, 64, 64),
    displacementMaterial
)
scene.add(moon)

camera.position.set(30, 80, 30)

// Main loop
const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera);
    stats.update();
    updateStatsDisplay();
}

animate()