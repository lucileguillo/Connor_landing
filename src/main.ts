import './style.css'
import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

			let camera: THREE.PerspectiveCamera; 
      let scene: THREE.Scene;
      let rendererCSS3D: CSS3DRenderer;
      let rendererWebGL: THREE.WebGLRenderer;
			let controls: OrbitControls;

			init();

			function init() {

				const controlsDomElement = document.createElement( 'div' );
				controlsDomElement.style.position = 'absolute';
				controlsDomElement.style.top = '0';
				controlsDomElement.style.width = '100%';
				controlsDomElement.style.height = '100%';
				document.body.appendChild( controlsDomElement );

				rendererCSS3D = new CSS3DRenderer();
				rendererCSS3D.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( rendererCSS3D.domElement );

				rendererWebGL = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
				rendererWebGL.domElement.style.position = 'absolute';
				rendererWebGL.domElement.style.top = '0';
				rendererWebGL.domElement.style.pointerEvents = 'none';
				rendererWebGL.setPixelRatio( window.devicePixelRatio );
				rendererWebGL.setSize( window.innerWidth, window.innerHeight );
				rendererWebGL.toneMapping = THREE.NeutralToneMapping;
				rendererWebGL.setAnimationLoop( animate );
				document.body.appendChild( rendererWebGL.domElement );

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.set( 0, 0, 1000 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x264785 );

				// Add light
				const hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 4 );
				hemisphereLight.position.set( - 25, 100, 50 );
				scene.add( hemisphereLight );

				// Add cutout mesh
				const geometry = new THREE.PlaneGeometry( 400, 740 );
				const material = new THREE.MeshBasicMaterial( {
					color: 0xff0000,
					blending: THREE.NoBlending,
					opacity: 0,
					premultipliedAlpha: true
				} );
				const mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				// Add frame
				const frame = buildFrame( 400, 740, 20 );
				scene.add( frame );

				// Add CSS3D element
				const iframe = document.createElement( 'iframe' );
				iframe.style.width = '400px';
				iframe.style.height = '740px';
				iframe.style.border = '0px';
				iframe.style.backfaceVisibility = 'hidden';
				iframe.src = 'https://nolhanpieroni.fr/connor_app/';
				scene.add( new CSS3DObject( iframe ) );

				// Add controls
				controls = new OrbitControls( camera );
				controls.connect( controlsDomElement );
				controls.addEventListener( 'start', () => iframe.style.pointerEvents = 'none' );
				controls.addEventListener( 'end', () => iframe.style.pointerEvents = 'auto' );
				controls.enableDamping = true;

        controls.enablePan = false;
        controls.enableZoom = false;


				window.addEventListener( 'resize', onWindowResize );

			}

			function buildFrame( width: number, height: number, thickness: number ) {

				const group = new THREE.Group();
				const material = new THREE.MeshStandardMaterial( { color: 0x181840 } );

				// Create the frame border
				const outerShape = new THREE.Shape();
				outerShape.moveTo( - ( width / 2 + thickness ), - ( height / 2 + thickness ) );
				outerShape.lineTo( width / 2 + thickness, - ( height / 2 + thickness ) );
				outerShape.lineTo( width / 2 + thickness, height / 2 + thickness );
				outerShape.lineTo( - ( width / 2 + thickness ), height / 2 + thickness );
				outerShape.lineTo( - ( width / 2 + thickness ), - ( height / 2 + thickness ) );

				// Create inner rectangle (hole)
				const innerHole = new THREE.Path();
				innerHole.moveTo( - width / 2, - height / 2 );
				innerHole.lineTo( width / 2, - height / 2 );
				innerHole.lineTo( width / 2, height / 2 );
				innerHole.lineTo( - width / 2, height / 2 );
				innerHole.lineTo( - width / 2, - height / 2 );

				outerShape.holes.push( innerHole );

				const frameGeometry = new THREE.ExtrudeGeometry( outerShape, {
					depth: thickness,
					bevelEnabled: false
				} );

				const frameMesh = new THREE.Mesh( frameGeometry, material );
				frameMesh.position.z = - thickness / 2;
				group.add( frameMesh );

				// Add back plane
				const backGeometry = new THREE.PlaneGeometry( width + ( thickness * 2 ), height + ( thickness * 2 ) );
				const backMesh = new THREE.Mesh( backGeometry, material );
				backMesh.position.set( 0, 0, - thickness / 2 );
				backMesh.rotation.y = Math.PI;
				group.add( backMesh );

				return group;

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				rendererWebGL.setSize( window.innerWidth, window.innerHeight );
				rendererCSS3D.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				controls.update();

        scene.rotation.set(0, Math.sin(Date.now() * 0.001) * 0.5, 0)

				rendererWebGL.render( scene, camera );
				rendererCSS3D.render( scene, camera );

			}
