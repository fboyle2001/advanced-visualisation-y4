import * as THREE from 'three';
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Sphere, SphereGeometry } from 'three';
import { renderer, scene, camera, controls, stats, updateStatsDisplay } from './utils/three_setup';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';

// Used for calculating elapsed and delta time
const clock = new THREE.Clock()

const loader = new TIFFLoader();

loader.load("/textures/moon/colour/lroc_color_poles_8k.tif", (texture) => {
    loader.load("/textures/moon/displacement/ldem_16_uint.tif", (displacementTexture) => {
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            displacementMap: displacementTexture,
            displacementScale: 1,
            flatShading: true
            
            // bumpMap: displacementTexture,
            // bumpScale: 1
            // bumpScale: 100
        });
    
        const moon = new Mesh(
            new SphereGeometry(17.374, 1000, 1000),
            material
        )
    
        scene.add(moon)
    });
});

// const displacementTexture =  new THREE.TextureLoader().load("/textures/moon/displacement/ldem_4.tif");
// const texture = new THREE.TextureLoader().load();

// const displacementMaterial = new MeshStandardMaterial({
//     // color: 0x00ff00,
//     map: texture,
//     bumpMap: displacementTexture,
//     bumpScale: 10
// })

// const pointLight = new THREE.PointLight( 0xff0000, 0.5 );
// pointLight.position.z = 2500;
// scene.add( pointLight );

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