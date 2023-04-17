import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const Globe = () => {
  const mount = useRef();

  const [threeLoaded, setThreeLoaded] = useState(false);

  useEffect(() => {
    if(threeLoaded) {
      return;
    }

    setThreeLoaded(true);

    const { clientWidth: width, clientHeight: height } = mount.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer();

    const light = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(light);

    renderer.setSize(width, height);
    mount.current.appendChild( renderer.domElement );

    const loader = new TIFFLoader();

    const radius = 17.374;

    loader.load("/moon/colour/lroc_color_poles_8k.tif", (texture) => {
        loader.load("/moon/displacement/ldem_16_uint.tif", (displacementTexture) => {
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                displacementMap: displacementTexture,
                displacementScale: 1,
                flatShading: true
                
                // bumpMap: displacementTexture,
                // bumpScale: 1
                // bumpScale: 100
            });
        
            const moon = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 1000, 1000),
                material
            )
        
            scene.add(moon);
        });
    });

    const pointGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    // blue
    const point = new THREE.Mesh(pointGeom, new THREE.MeshBasicMaterial({ color: 0x444fff }));

    point.position.set(radius + 0.3, 0, 0)
    scene.add(point);

    
    const lon = radius * 90 / 90;
    const lonAngle = Math.PI * lon / (2 * radius);

    // purple
    const bPoint = new THREE.Mesh(pointGeom, new THREE.MeshBasicMaterial({ color: 0x9900AA }));
    // y = lon
    // z = lat
    bPoint.position.set(radius * Math.cos(lonAngle) + 0.3, radius * Math.sin(lonAngle), 0)
    scene.add(bPoint);

    // y = lon
    // z = lat
    // green
    const cPoint = new THREE.Mesh(pointGeom, new THREE.MeshBasicMaterial({ color: 0x00FF88 }));
    cPoint.position.set(0, 0, 0)
    scene.add(cPoint);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const cameraDistance = 30;

    camera.position.set(cameraDistance, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update()
      renderer.render(scene, camera);
    };
    
    animate();
  }, [mount, threeLoaded])

  return (
    <div ref={mount} style={{
      width: "100%",
      height: "100%"
    }}/>
  )
}
