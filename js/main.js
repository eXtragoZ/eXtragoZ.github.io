var SCENE_WIDTH = window.innerWidth,
	SCENE_HEIGHT = window.innerHeight,
	CAMERA_VIEW_ANGLE = 45,
	CAMERA_ASPECT = (SCENE_WIDTH / 2) / SCENE_HEIGHT,
	CAMERA_NEAR = 10,
	CAMERA_FAR = 7000;


let container, renderer, camera, scene, cube, stats, cameraControls;
let containerCloseView, cameraCloseView, rendererCloseView, cameraControlsCloseView;

const origin = new THREE.Vector3(0, 0, 0);

var clock = new THREE.Clock();
var timeLogic = 0;
var frameSpeed = 1 / 60;

let controls = {
	latitud: 0,
	longitud: 0,
	latitudAstro: 0,
	longitudAstro: 0,
	distanciaAstro: 1000,
	rotacionBrazo: 0,
	rotacionMano: 0,
	rotacionTierra: 0,
	autoRotacion: false
};
const textureLoader = new THREE.TextureLoader();

var radius = 100, segments = 32; // Earth params
var earth = new THREE.Object3D();
var astro = new THREE.Object3D();
var guidedUnit = new THREE.Object3D();
var guidedUnitArm = new THREE.Object3D();
var guidedUnitHand = new THREE.Object3D();

var positionLine;
var astroLine = new THREE.Object3D();

var debug = false;

function init() {
	container = $('#container');
	containerCloseView = $('#containerCloseView');

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(SCENE_WIDTH / 2, SCENE_HEIGHT);
	container.append(renderer.domElement);

	rendererCloseView = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	rendererCloseView.setSize(SCENE_WIDTH / 2, SCENE_HEIGHT);
	containerCloseView.append(rendererCloseView.domElement);

	camera = new THREE.PerspectiveCamera(CAMERA_VIEW_ANGLE, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR);
	camera.position.set(1500, 300, 300);
	camera.lookAt(origin);

	cameraCloseView = new THREE.PerspectiveCamera(CAMERA_VIEW_ANGLE, CAMERA_ASPECT, 1, 300);
	cameraCloseView.position.set(200, 0, 0);
	cameraCloseView.lookAt(origin);

	// attach the render-supplied DOM element

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	cameraControlsCloseView = new THREE.OrbitControls(cameraCloseView, rendererCloseView.domElement);

	THREEx.WindowResize(renderer, camera);
	THREEx.WindowResize(rendererCloseView, cameraCloseView);

	// and the camera
	scene = new THREE.Scene();
	//const cameraHelper = new THREE.CameraHelper(cameraCloseView);
	//scene.add(cameraHelper);

	createLights()

	createEarth();
	createAstro();
	createGuidedUnit();

	addCircle()

	initStats();
	initControls()
	console.log(scene)
}
function addCircle() {
	var segmentCount = 32,
		_radius = radius + 1.5,
		geometry = new THREE.Geometry(),
		material = new THREE.LineBasicMaterial({ color: 0x00FF00 });

	for (var i = 0; i <= segmentCount; i++) {
		var theta = (i / segmentCount) * Math.PI * 2;
		geometry.vertices.push(
			new THREE.Vector3(
				Math.cos(theta) * _radius,
				0,
				Math.sin(theta) * _radius));
	}

	scene.add(new THREE.Line(geometry, material));
}
function initStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.right = '0px';
	containerCloseView.append(stats.domElement);
}
function initControls() {
	const gui = new dat.GUI({
		closeOnTop: true,
		width: 200
	});
	var menuTierra = gui.addFolder('Posicion en la Tierra');
	var menuAstro = gui.addFolder('Posicion del Astro (respecto tierra)');
	var menuUnidad = gui.addFolder('Unidad Guiada (Forzado)');

	menuTierra.add(controls, 'latitud', -90, 90, 0.00001).name('Latitud').onChange(function () {
		updatePositionInEarth();
	});
	menuTierra.add(controls, 'longitud', -180, 180, 0.00001).name('Longitud').onChange(function () {
		updatePositionInEarth();
	});
	menuTierra.add(controls, 'rotacionTierra', -180, 180, 0.00001).name('Rotacion').listen().onChange(function () {
		earth.rotation.y = deg2rad(controls.rotacionTierra);
		updateGuidedUnitArmPosition();
		updateCameraCloseViewPosition();
		updateVisionLinePosition();
	});
	menuTierra.add(controls, 'autoRotacion').name('Rotacion Auto');

	menuAstro.add(controls, 'latitudAstro', -90, 90, 0.00001).name('Latitud').onChange(function () {
		updatePositionAstro();
	});
	menuAstro.add(controls, 'longitudAstro', -180, 180, 0.00001).name('Longitud').onChange(function () {
		updatePositionAstro();
	});
	menuAstro.add(controls, 'distanciaAstro').name('Distancia').onChange(function () {
		updatePositionAstro();
	});
	menuUnidad.add(controls, 'rotacionBrazo', -180, 180).name('Rotacion Brazo').listen().onChange(function () {
		guidedUnitArm.rotation.x = deg2rad(controls.rotacionBrazo);

	});
	menuUnidad.add(controls, 'rotacionMano', -180, 180).name('Rotacion Mano').listen().onChange(function () {
		guidedUnitHand.rotation.y = deg2rad(controls.rotacionMano);
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
	var map = textureLoader.load('textures/earth.jpg');
	map.minFilter = THREE.LinearFilter;
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments),
		new THREE.MeshPhongMaterial({
			map: map, specular: 0x111111, shininess: 1,
			bumpMap: map, bumpScale: 0.02, specularMap: map
		})
	);
	earth.add(mesh)

	//eje de rotacion

	var material = new THREE.LineDashedMaterial({
		color: 0x0000FF, linewidth: 1, dashSize: 50, gapSize: 10,
	});

	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, -200, 0),
		new THREE.Vector3(0, 200, 0)
	);

	var earthLine = new THREE.Line(geometry, material);
	earthLine.computeLineDistances();
	earth.add(earthLine);

	//posicion
	var material = new THREE.LineDashedMaterial({
		color: 0x00FFFF, linewidth: 1, dashSize: 50, gapSize: 10,
	});

	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(200, 0, 0)
	);

	positionLine = new THREE.Line(geometry, material);
	positionLine.computeLineDistances();
	earth.add(positionLine);

	scene.add(earth);
}

function createAstro() {
	var map = textureLoader.load('textures/sun.jpg');
	map.minFilter = THREE.LinearFilter;
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments),
		new THREE.MeshPhongMaterial({
			map: map, specular: 0x111111, shininess: 1,
			specularMap: map
		})
	);
	astro.add(mesh);
	astro.position.set(controls.distanciaAstro, 0, 0)
	scene.add(astro);
}

function createGuidedUnit() {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(2, 2, 2),
		new THREE.MeshPhongMaterial({ color: 0xbbbbbb })
	);
	mesh.position.set(0, -0.5, 0);
	guidedUnit.add(mesh);

	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(2, 0.5, 0.5),
		new THREE.MeshPhongMaterial({ color: 0x0088FF })
	);
	mesh.rotation.set(0, 0, deg2rad(45));
	mesh.position.set(1.5, 0.5, 0);
	guidedUnitArm.add(mesh);
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(2, 0.5, 0.5),
		new THREE.MeshPhongMaterial({ color: 0x0088FF })
	);
	mesh.position.set(3.03, 1.13, 0);
	guidedUnitArm.add(mesh);
	guidedUnit.add(guidedUnitArm);

	var mesh = new THREE.Mesh(
		new THREE.TorusBufferGeometry(0.75, 0.2, 5, 7, Math.PI * 3 / 2), //radius, tube, radialSegments, tubularSegments, arc 
		new THREE.MeshPhongMaterial({ color: 0xFF2211 })
	);
	mesh.rotation.set(deg2rad(90), deg2rad(-90), deg2rad(45));
	guidedUnitHand.position.set(3.8, 0, 0);
	guidedUnitHand.add(mesh);
	guidedUnitArm.add(guidedUnitHand);

	var material = new THREE.LineDashedMaterial({
		color: 0xff0000, linewidth: 1, dashSize: 50, gapSize: 10,
	});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(-1, 0, 0),
		new THREE.Vector3(controls.distanciaAstro, 0, 0)
	);
	var visionLine = new THREE.Line(geometry, material);
	visionLine.computeLineDistances();
	guidedUnitHand.add(visionLine);

	earth.add(guidedUnit);

	var material = new THREE.LineDashedMaterial({
		color: 0xff5500, linewidth: 1, dashSize: 50, gapSize: 10,
	});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(controls.distanciaAstro, 0, 0)
	);
	var visionCenterLine = new THREE.Line(geometry, material);
	visionCenterLine.computeLineDistances();
	astroLine.add(visionCenterLine)
	scene.add(astroLine);

	updateGuidedUnitArmPosition();
	updatePositionInEarth();
}

function updatePositionAstro() {
	astro.position.set(controls.distanciaAstro, 0, 0);
	astro.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), deg2rad(controls.latitudAstro));
	astro.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deg2rad(controls.longitudAstro));

	updateGuidedUnitArmPosition();
}
function updatePositionInEarth() {
	positionLine.rotation.z = deg2rad(controls.latitud);
	positionLine.rotation.y = deg2rad(controls.longitud);

	guidedUnit.position.set(radius + 1.5, 0, 0);
	guidedUnit.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), positionLine.rotation.z);
	guidedUnit.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), positionLine.rotation.y);
	guidedUnit.rotation.z = deg2rad(-90) + positionLine.rotation.z;
	guidedUnit.rotation.y = positionLine.rotation.y;

	updateGuidedUnitArmPosition();
	updateCameraCloseViewPosition();
}
function updateCameraCloseViewPosition() {
	var worldPosition = new THREE.Vector3().copy(guidedUnit.position);
	worldPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), earth.rotation.y);
	cameraCloseView.position.set(
		worldPosition.x * 1.2 + 20 * Math.sin(positionLine.rotation.y + earth.rotation.y),
		worldPosition.y * 1.2,
		worldPosition.z * 1.2 + 20 * Math.cos(positionLine.rotation.y + earth.rotation.y)
	);

	//cameraCloseView.rotation.z = deg2rad(-90) + positionLine.rotation.z;
	cameraControlsCloseView.target.copy(worldPosition);
}
function updateGuidedUnitArmPosition() {
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
	controls.rotacionBrazo = rad2deg(guidedUnitArm.rotation.x);
	controls.rotacionMano = rad2deg(guidedUnitHand.rotation.x);

	astroLine.children[0].rotation.x = guidedUnitArm.rotation.x;
	astroLine.children[0].rotation.y = guidedUnitHand.rotation.y;
	astroLine.rotation.y = positionLine.rotation.y + earth.rotation.y;
	astroLine.rotation.z = deg2rad(-90) + positionLine.rotation.z;
	updateVisionLinePosition();
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
	cameraCloseView.rotation.z += deg2rad(-90) + positionLine.rotation.z;
	stats.update();
	renderer.render(scene, camera);
	rendererCloseView.render(scene, cameraCloseView);
	requestAnimationFrame(animate);
}

function logic(time) {
	if (controls.autoRotacion) {
		earth.rotation.y += deg2rad(1);
		updateGuidedUnitArmPosition();
		updateCameraCloseViewPosition();
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
	return degrees * (2 * Math.PI / 360);
}
function rad2deg(radians) {
	return radians / (2 * Math.PI / 360);
}

init();
animate();