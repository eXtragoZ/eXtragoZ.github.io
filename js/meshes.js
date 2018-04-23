const textureLoader = new THREE.TextureLoader();
function lineCircle(radius) {
	var segmentCount = 32,
		geometry = new THREE.Geometry(),
		material = new THREE.LineBasicMaterial({ color: 0x00FF00 });

	for (var i = 0; i <= segmentCount; i++) {
		var theta = (i / segmentCount) * Math.PI * 2;
		geometry.vertices.push(new THREE.Vector3(Math.cos(theta) * _radius, 0, Math.sin(theta) * _radius));
	}

	return new THREE.Line(geometry, material);
}
function meshEarth(radius) {
	var segments = 32;
	var map = textureLoader.load('textures/earth.jpg');
	map.minFilter = THREE.LinearFilter;
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments),
		new THREE.MeshPhongMaterial({
			map: map, specular: 0x111111, shininess: 1,
			bumpMap: map, bumpScale: 0.02, specularMap: map
		})
	);
	return mesh;
}
function lineEarthAxis() {
	var material = new THREE.LineDashedMaterial({
		color: 0x0000FF, linewidth: 1, dashSize: 50, gapSize: 10,
	});

	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, -200, 0),
		new THREE.Vector3(0, 200, 0)
	);

	var line = new THREE.Line(geometry, material);
	line.computeLineDistances();
	return line;
}
function lineEarthToGU() {
	var material = new THREE.LineDashedMaterial({
		color: 0x00FFFF, linewidth: 1, dashSize: 50, gapSize: 10,
	});

	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(200, 0, 0)
	);

	var line = new THREE.Line(geometry, material);
	line.computeLineDistances();
	return line;
}

function meshAstro(radius) {
	var segments = 32;
	var map = textureLoader.load('textures/sun.jpg');
	map.minFilter = THREE.LinearFilter;
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments),
		new THREE.MeshPhongMaterial({
			map: map, specular: 0x111111, shininess: 1, specularMap: map
		})
	);
	return mesh;
}

function meshGuidedUnitBase() {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(2, 2, 2),
		new THREE.MeshPhongMaterial({ color: 0xbbbbbb })
	);
	mesh.position.set(0, -0.5, 0);
	return mesh;
}

function meshGuidedUnitArm() {
	var meshOne = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.5));
	meshOne.rotation.set(0, 0, deg2rad(45));
	meshOne.position.set(1.5, 0.5, 0);
	var meshTwo = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.5));
	meshTwo.position.set(3.03, 1.13, 0);

	var singleGeometry = new THREE.Geometry();
	
	meshOne.updateMatrix();
	singleGeometry.merge(meshOne.geometry, meshOne.matrix);
	
	meshTwo.updateMatrix();
	singleGeometry.merge(meshTwo.geometry, meshTwo.matrix);

	var mesh = new THREE.Mesh(
		singleGeometry,
		new THREE.MeshPhongMaterial({ color: 0x0088FF })
	);

	return mesh;
}

function meshGuidedUnitHand() {
	var mesh = new THREE.Mesh(
		new THREE.TorusBufferGeometry(0.75, 0.2, 5, 7, Math.PI * 3 / 2), //radius, tube, radialSegments, tubularSegments, arc 
		new THREE.MeshPhongMaterial({ color: 0xFF2211 })
	);
	mesh.rotation.set(deg2rad(90), deg2rad(-90), deg2rad(45));
	return mesh;
}
function lineGuidedUnitVision() {
	var material = new THREE.LineDashedMaterial({
		color: 0xff0000, linewidth: 1, dashSize: 50, gapSize: 10,
	});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(-1, 0, 0),
		new THREE.Vector3(1000, 0, 0)
	);
	var visionLine = new THREE.Line(geometry, material);
	visionLine.computeLineDistances();
	return visionLine;
}
function lineGuidedUnitSetVision() {
	var material = new THREE.LineDashedMaterial({
		color: 0xff5500, linewidth: 1, dashSize: 50, gapSize: 10,
	});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(1000, 0, 0)
	);
	var visionLine = new THREE.Line(geometry, material);
	visionLine.computeLineDistances();
	return visionLine;
}