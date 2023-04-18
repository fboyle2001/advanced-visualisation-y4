import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from "three";
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const RADIUS = 17.134;

export const Globe = forwardRef((props, ref) => {
  const mount = useRef();

  const [camera, setCamera] = useState(null);
  const [controls, setControls] = useState(null);
  const [moonSurface, setMoonSurface] = useState(null); 

  const [landmarkVectors, setLandmarkVectors] = useState({});
  const [displacement, setDisplacement] = useState(3);

  useImperativeHandle(ref, () => ({
    rotateToLandmark(name) {
      _rotateToLandmark(name)
    }
  }));

  // Need to calculate were to put the marker on the globe
  // Maps Lat and Lon to Spherical Coordinates 
  // https://en.wikipedia.org/wiki/Spherical_coordinate_system
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
    const { clientWidth: width } = mount.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, width / width, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer();

    const light = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(light);

    // Ensure it is square
    renderer.setSize(width, width);
    mount.current.appendChild( renderer.domElement );

    const loader = new TIFFLoader();

    let newLVs = {};

    // Load the moon image and the displacement map
    loader.load("./moon/colour/lroc_color_poles_8k.tif", (texture) => {
        loader.load("./moon/displacement/ldem_16_uint.tif", (displacementTexture) => {
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                displacementMap: displacementTexture,
                displacementScale: 3,
                flatShading: true
            });

            setMoonSurface(material);
            
            // Create a high resolution sphere
            const moon = new THREE.Mesh(
                new THREE.SphereGeometry(RADIUS, 1000, 1000),
                material
            )
            
            // Place the markers
            const pointGeom = new THREE.BoxGeometry(0.1, 3, 0.1);

            props.landmarks.forEach(landmark => {
              const [x, y, z] = computeSphericalCoord(landmark.lat, landmark.lon, RADIUS, 0.3);
              const point = new THREE.Mesh(pointGeom, new THREE.MeshBasicMaterial({ color: 0x39f742 }));
              point.position.set(x, y, z);
              // From the example at https://threejs.org/examples/#css3d_periodictable
              // Forces the marker to face out of the sphere
              point.lookAt(new THREE.Vector3().copy(point.position).multiplyScalar(2));
              point.rotateX(Math.PI / 2);
              moon.add(point);
              
              // Store the landmark vectors for rotation later on 
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

    setCamera(camera);
    setControls(controls);
    setLandmarkVectors(newLVs);
    
    animate();

    // Prevent memory leak if they switch the view
    return () => {
      renderer.forceContextLoss();
      renderer.context = null;
      renderer.domElement = null;
    }
  }, [props.landmarks]);

  // Swivel the camera to look at a landing site
  const _rotateToLandmark = (name) => {
    if(!camera || !controls || !landmarkVectors || Object.keys(landmarkVectors).length === 0) {
      return;
    }

    const [x, y, z] = landmarkVectors[name];
    camera.position.set(x, y, z).normalize().multiplyScalar(RADIUS + 8);
    controls.update();
  }

  // Let the user control the displacement intensity
  const updateDisplacement = (value) => {
    if(!moonSurface) {
      return;
    }

    setDisplacement(value);
    moonSurface.displacementScale = value;
  }

  return (
    <div className="map-container" style={{
      width: "100%",
      height: "100%",
      minWidth: "100%",
      minHeight: "100%"
    }}>
      <div ref={mount} style={{
        width: "100%",
        height: "100%"
      }}/>
      <div className="globe-overlay">
        <div className="flex-row">
          <span>Displacement:</span>
          <input
            type="range"
            min={0}
            max={5}
            value={displacement}
            step={0.5}
            onChange={(e) => updateDisplacement(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
});
