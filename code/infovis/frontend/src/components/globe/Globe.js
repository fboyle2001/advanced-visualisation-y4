import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from "three";
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const Globe = forwardRef((props, ref) => {
  const mount = useRef();

  const [threeLoaded, setThreeLoaded] = useState(false);
  const [renderer, setRenderer] = useState(null);
  const [camera, setCamera] = useState(null);
  const [controls, setControls] = useState(null);

  const [landmarkVectors, setLandmarkVectors] = useState({});

  useImperativeHandle(ref, () => ({
    rotateToLandmark(name) {
      _rotateToLandmark(name)
    }
  }));

  const computeSphericalCoord = (lat, lon, radius, alt) => {
    const theta = Math.PI * (90 + lat) / 180;
    const phi = Math.PI * (90 - lon) / 180;
    const rho = (radius + alt);
    
    const x = rho * Math.sin(phi) * Math.sin(theta);
    const y = rho * Math.cos(phi);
    const z = rho * Math.sin(phi) * Math.cos(theta);

    return [x, y, z];
  }

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

    let newLVs = {};

    loader.load("/moon/colour/lroc_color_poles_8k.tif", (texture) => {
        loader.load("/moon/displacement/ldem_16_uint.tif", (displacementTexture) => {
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                displacementMap: displacementTexture,
                displacementScale: 3,
                flatShading: true
                
                // bumpMap: displacementTexture,
                // bumpScale: 1
                // bumpScale: 100
            });
        
            const moon = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 1000, 1000),
                material
            )

            const pointGeom = new THREE.BoxGeometry(0.1, 3, 0.1);

            props.landmarks.forEach(landmark => {
              const [x, y, z] = computeSphericalCoord(landmark.lat, landmark.lon, radius, 0.3);
              const point = new THREE.Mesh(pointGeom, new THREE.MeshBasicMaterial({ color: 0x39f742 }));
              point.position.set(x, y, z);
              point.lookAt(new THREE.Vector3().copy(point.position).multiplyScalar(2));
              point.rotateX(Math.PI / 2);
              moon.add(point);

              newLVs[landmark.name] = [x, y, z];
            });
        
            scene.add(moon);
        });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const cameraDistance = 30;

    camera.position.set(cameraDistance, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    setRenderer(renderer);
    setCamera(camera);
    setControls(controls);
    setLandmarkVectors(newLVs);
    
    animate();
  }, [mount, threeLoaded]);

  useEffect(() => {
    return () => {
      // mount.current.removeChild(mount.current.children[0]);
    }
  }, [])

  const _rotateToLandmark = (name) => {
    console.log("Rot")
    console.log({camera})

    const [x, y, z] = landmarkVectors[name];
    camera.position.set(x, y, z).normalize().multiplyScalar(17 + 8)

    // camera.position.set(10, 10, 10);
    controls.update();
  }

  return (
    <div className="map-container" style={{
      width: "100%",
      height: "100%"
    }}>
      <div ref={mount} style={{
        width: "100%",
        height: "100%"
      }}/>
      <div className='map-overlay'>
      <button onClick={_rotateToLandmark}>Focus</button>
      </div>
    </div>
  )
});
