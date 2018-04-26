var SCENE_WIDTH = window.innerWidth,
	SCENE_HEIGHT = window.innerHeight,
	CAMERA_VIEW_ANGLE = 45,
	CAMERA_ASPECT = (SCENE_WIDTH / 2) / SCENE_HEIGHT,
	CAMERA_NEAR = 10,
	CAMERA_FAR = 10000;


let container, renderer, camera, scene, cube, stats, cameraControls;
let containerCloseView, cameraCloseView, rendererCloseView, cameraControlsCloseView;
let containerLensView, cameraLensView, rendererLensView;

const origin = new THREE.Vector3(0, 0, 0);

var clock = new THREE.Clock();
var timeLogic = 0;
var frameSpeed = 1 / 60;

var radius = 100; // Earth params
var earth = new THREE.Object3D();
var astro = new THREE.Object3D();
var guidedUnit = new THREE.Object3D();
var guidedUnitArm = new THREE.Object3D();
var guidedUnitHand = new THREE.Object3D();

var positionLine;
var astroLine = new THREE.Object3D();

let controls = {
	latitud: -34.5784,
	longitud: -58.5269,
	fixRotacion: true,
	latitudAstro: -90,
	longitudAstro: 0,
	distanciaAstro: 1000,
	rotacionBrazo: 0,
	rotacionMano: 0,
	rotacionTierra: 0,
	autoRotacion: false,
	menu: 100
};
var debug = false;

function init() {
	container = $('#container');
	containerCloseView = $('#containerCloseView');
	containerLensView = $('#containerLensView');

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(SCENE_WIDTH / 2, SCENE_HEIGHT);
	container.append(renderer.domElement);

	rendererCloseView = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	rendererCloseView.setSize(SCENE_WIDTH / 2, SCENE_HEIGHT / 2);
	containerCloseView.append(rendererCloseView.domElement);
	
	rendererLensView = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	rendererLensView.setSize(SCENE_WIDTH / 2, SCENE_HEIGHT / 2);
	containerLensView.append(rendererLensView.domElement);

	camera = new THREE.PerspectiveCamera(CAMERA_VIEW_ANGLE, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR);
	camera.position.set(1500, 300, 300);

	cameraCloseView = new THREE.PerspectiveCamera(CAMERA_VIEW_ANGLE, SCENE_WIDTH / SCENE_HEIGHT, 1, 300);
	
	cameraLensView = new THREE.PerspectiveCamera(10, SCENE_WIDTH / SCENE_HEIGHT, 1, 50000);

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	cameraControlsCloseView = new THREE.OrbitControls(cameraCloseView, rendererCloseView.domElement);

	THREEx.WindowResize(renderer, camera, 0.5, 1);
	THREEx.WindowResize(rendererCloseView, cameraCloseView, 0.5, 0.5);
	THREEx.WindowResize(rendererLensView, cameraLensView, 0.5, 0.5);

	scene = new THREE.Scene();

	createLights()

	createEarth();
	createAstro();
	createGuidedUnit();

	addCircle();

	updatePositionInEarth();
	updatePositionAstro();

	initStats();
	initControls();

	console.log(scene)
}
function addCircle() {
	var segmentCount = 32,
		_radius = radius + 1.5,
		geometry = new THREE.Geometry(),
		material = new THREE.LineBasicMaterial({ color: 0x00FF00 });

	for (var i = 0; i <= segmentCount; i++) {
		var theta = (i / segmentCount) * Math.PI * 2;
		geometry.vertices.push(new THREE.Vector3(Math.cos(theta) * _radius, 0, Math.sin(theta) * _radius));
	}

	scene.add(new THREE.Line(geometry, material));
}
function initStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.right = '0px';
	containerLensView.append(stats.domElement);
}
function initControls() {
	const gui = new dat.GUI({ closeOnTop: true, width: 200 });
	const menuTierra = gui.addFolder('Posicion en la Tierra');
	const menuAstro = gui.addFolder('Posicion del Astro (respecto tierra)');
	const menuUnidad = gui.addFolder('Unidad Guiada (Forzado)');

	menuTierra.add(controls, 'latitud', -90, 90, 0.00001).name('Latitud').onChange(function () {
		updatePositionInEarth();
	});
	menuTierra.add(controls, 'longitud', -180, 180, 0.00001).name('Longitud').onChange(function () {
		updatePositionInEarth();
	});
	menuTierra.add(controls, 'rotacionTierra', -180, 180, 0.00001).name('Rotacion').listen().onChange(function () {
		earth.rotation.y = deg2rad(controls.rotacionTierra);
		updateGuidedUnitArmPosition();
		updateCameraViewPosition();
		updateVisionLinePosition();
	});
	menuTierra.add(controls, 'autoRotacion').name('Auto Rotacion');

	menuAstro.add(controls, 'latitudAstro', -90, 90, 0.00001).name('Latitud').onChange(function () {
		updatePositionAstro();
	});
	menuAstro.add(controls, 'longitudAstro', -180, 180, 0.00001).name('Longitud').onChange(function () {
		updatePositionAstro();
	});
	menuAstro.add(controls, 'distanciaAstro').name('Distancia').onChange(function () {
		updatePositionAstro();
	});
	
	menuUnidad.add(controls, 'fixRotacion').name('Compensar Rotacion por Latitud').onChange(function () {
		updatePositionInEarth();
	});
	
	menuUnidad.add(controls, 'rotacionBrazo', -180, 180).name('Rotacion Brazo').listen().onChange(function () {
		guidedUnitArm.rotation.x = deg2rad(controls.rotacionBrazo);

	});
	menuUnidad.add(controls, 'rotacionMano', -180, 180).name('Rotacion Mano').listen().onChange(function () {
		guidedUnitHand.rotation.y = deg2rad(controls.rotacionMano);
	});
	gui.add(controls, 'menu', [25, 50, 100, 150, 200, 250, 300]).name('Tamaño Menu').onChange(function () {
		$('.dg.main.a').css({
			'transform-origin' : '0 0',
			'-webkit-transform' : 'scale(' + controls.menu*0.01 + ')',
			'-moz-transform' : 'scale(' + controls.menu*0.01 + ')',
			'-ms-transform' : 'scale(' + controls.menu*0.01 + ')',
			'-o-transform' : 'scale(' + controls.menu*0.01 + ')',
			'transform' : 'scale(' + controls.menu*0.01 + ')'
		});
	});
}
function createLights() {
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));
	directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
	directionalLight.position.set(1, 2, 1)
	scene.add(directionalLight);
	directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
	directionalLight.position.set(-1, -2, -1)
	scene.add(directionalLight);
}
function createEarth() {
	earth.add(meshEarth(radius));
	earth.add(lineEarthAxis());
	positionLine = lineEarthToGU();
	earth.add(positionLine);
	scene.add(earth);
}

function createAstro() {
	astro.add(meshAstro(radius));
	astro.position.set(controls.distanciaAstro, 0, 0)
	scene.add(astro);
}

function createGuidedUnit() {
	guidedUnit.add(meshGuidedUnitBase());
	guidedUnitArm.add(meshGuidedUnitArm());
	guidedUnit.add(guidedUnitArm);
	guidedUnitHand.add(meshGuidedUnitHand());
	guidedUnitHand.position.set(3.8, 0, 0);
	guidedUnitArm.add(guidedUnitHand);
	earth.add(guidedUnit);
	//VisionLines
	guidedUnitHand.add(lineGuidedUnitVision());
	astroLine.add(lineGuidedUnitSetVision())
	scene.add(astroLine);
}

function updatePositionAstro() {
	astro.position.set(controls.distanciaAstro, 0, 0);
	astro.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), deg2rad(controls.latitudAstro));
	astro.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deg2rad(controls.longitudAstro));

	updateGuidedUnitArmPosition();
	updateCameraViewPosition();
}
function updatePositionInEarth() {
	positionLine.rotation.z = deg2rad(controls.latitud);
	positionLine.rotation.y = deg2rad(controls.longitud);

	guidedUnit.position.set(radius + 1.5, 0, 0);
	guidedUnit.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), positionLine.rotation.z);
	guidedUnit.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), positionLine.rotation.y);
	if (controls.fixRotacion) {
		guidedUnit.rotation.z = deg2rad(-90);
	} else {
		guidedUnit.rotation.z = deg2rad(-90) + positionLine.rotation.z;
	}
	guidedUnit.rotation.y = positionLine.rotation.y;

	updateGuidedUnitArmPosition();
	updateCameraViewPosition();
}
function updateCameraViewPosition() {
	var worldPosition = new THREE.Vector3().copy(guidedUnit.position);
	worldPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), earth.rotation.y);
	cameraCloseView.position.copy(worldPosition).multiplyScalar(1.2);
	cameraCloseView.position.x += 20 * Math.sin(positionLine.rotation.y + earth.rotation.y);
	cameraCloseView.position.z += 20 * Math.cos(positionLine.rotation.y + earth.rotation.y);

	//cameraCloseView.rotation.z = deg2rad(-90) + positionLine.rotation.z;
	cameraControlsCloseView.target.copy(worldPosition);
	
	cameraLensView.position.copy(worldPosition);
	var lookPos = new THREE.Vector3().copy(earth.position).negate().add(astro.position).add(cameraLensView.position);
	cameraLensView.lookAt(lookPos);
}
function updateGuidedUnitArmPosition() {
	if (controls.fixRotacion) {
		updateGuidedUnitArmPositionFixRotation();
	} else {
		updateGuidedUnitArmPositionLatitudeRotation();
	}
	
	controls.rotacionBrazo = normalizeAngle(rad2deg(guidedUnitArm.rotation.x));
	controls.rotacionMano = rad2deg(guidedUnitHand.rotation.y);
	if (controls.fixRotacion) {
		var rotationFromGU = new THREE.Euler(guidedUnitArm.rotation.x, guidedUnitHand.rotation.y, 0);
		var rotationFromWorld = new THREE.Euler(0, positionLine.rotation.y + earth.rotation.y, deg2rad(-90));
		
		astroLine.quaternion.copy(new THREE.Quaternion().setFromEuler(rotationFromWorld));
		astroLine.quaternion.multiply(new THREE.Quaternion().setFromEuler(rotationFromGU));
	} else {
		var rotationFromGU = new THREE.Euler(guidedUnitArm.rotation.x, guidedUnitHand.rotation.y, 0);
		var rotationFromWorld = new THREE.Euler(0, positionLine.rotation.y + earth.rotation.y, deg2rad(-90) + positionLine.rotation.z);
		
		astroLine.quaternion.copy(new THREE.Quaternion().setFromEuler(rotationFromWorld));
		astroLine.quaternion.multiply(new THREE.Quaternion().setFromEuler(rotationFromGU));
	}
	updateVisionLinePosition();
}
function updateGuidedUnitArmPositionFixRotation() {
	guidedUnitArm.rotation.x = earth.rotation.y + deg2rad(90 + controls.longitud - controls.longitudAstro);
	guidedUnitHand.rotation.y = deg2rad(90+controls.latitudAstro);
}
function updateGuidedUnitArmPositionLatitudeRotation() {
	var worldPositionGU = new THREE.Vector3().copy(guidedUnit.position);
	worldPositionGU.applyAxisAngle(new THREE.Vector3(0, 1, 0), earth.rotation.y);
	var direccionGU = new THREE.Vector3(0, -1, 0);
	direccionGU.applyAxisAngle(new THREE.Vector3(0, 0, 1), positionLine.rotation.z);
	direccionGU.applyAxisAngle(new THREE.Vector3(0, 1, 0), positionLine.rotation.y + earth.rotation.y);
	var direccionAstro = new THREE.Vector3().copy(astro.position);
	var normal = new THREE.Vector3();
	normal.crossVectors(direccionGU, direccionAstro);

	if (debug) {
		direccionGU.setLength(200);
		direccionAstro.setLength(200);
		normal.setLength(200);
		debugIndicator(direccionGU.x, direccionGU.y, direccionGU.z, 0x00FF00);
		debugIndicator(direccionAstro.x, direccionAstro.y, direccionAstro.z, 0xFF0000);
		debugIndicator(normal.x, normal.y, normal.z, 0x0000FF);
	}

	var guidedUnitArmRotation = worldPositionGU.angleTo(normal);
	if (worldPositionGU.angleTo(direccionAstro) > deg2rad(90)) {
		guidedUnitArmRotation = deg2rad(360) - guidedUnitArmRotation;
	}

	guidedUnitArm.rotation.x = guidedUnitArmRotation;
	guidedUnitHand.rotation.y = direccionGU.angleTo(direccionAstro);
}
function updateVisionLinePosition() {
	astroLine.position.copy(guidedUnit.position);
	astroLine.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), earth.rotation.y);
}

function animate() {
	var delta = clock.getElapsedTime();
	if (timeLogic == 0) {
		timeLogic = delta;
	}
	logic(delta);

	cameraControls.update(clock.getDelta());
	cameraControlsCloseView.update(clock.getDelta());
	fixRotationCamera();
	stats.update();
	renderer.render(scene, camera);
	rendererLensView.render(scene, cameraLensView);
	rendererCloseView.render(scene, cameraCloseView);
	
	requestAnimationFrame(animate);
}
function fixRotationCamera() {
	if (controls.fixRotacion) {
		cameraCloseView.rotation.z += deg2rad(-90);
	} else {
		cameraCloseView.rotation.z += deg2rad(-90) + positionLine.rotation.z;
	}
}
function logic(time) {
	if (controls.autoRotacion) {
		earth.rotation.y += deg2rad(1);
		controls.rotacionTierra = normalizeAngle(rad2deg(earth.rotation.y));
		updateGuidedUnitArmPosition();
		updateCameraViewPosition();
		updateVisionLinePosition();
	}
	if (timeLogic <= time) {
		var framesPassed = Math.floor(time - timeLogic);


		timeLogic += frameSpeed * framesPassed;
	}
}

function debugIndicator(x, y, z, color) {
	var indicator = new THREE.Mesh(
		new THREE.SphereGeometry(5, 8, 8),
		new THREE.MeshBasicMaterial({ color: color })
	);
	indicator.position.set(x, y, z);
	scene.add(indicator);
}

function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
	return Math.random() * (max - min + 1) + min;
}
function deg2rad(degrees) {
	return degrees * (Math.PI / 180);
}
function rad2deg(radians) {
	return radians * (180 / Math.PI);
}
function normalizeAngle(degrees) {
	degrees = degrees % 360;
	return degrees > 180 ? degrees - 360 : degrees;
}

init();
animate();