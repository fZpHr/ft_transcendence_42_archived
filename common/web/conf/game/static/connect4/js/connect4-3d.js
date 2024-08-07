// Step 1: Setup Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const div = document.getElementById('connect-four');
div.appendChild(renderer.domElement);

camera.position.set(0, 6, 10);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Step 2: Create Board
const boardGeometry = new THREE.BoxGeometry(7, 6, 0.1);
const boardMaterial = new THREE.MeshLambertMaterial({color: 0x123456});
const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
scene.add(boardMesh);

// Step 3: Add Pieces
const pieceGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
const playerMaterial = [new THREE.MeshLambertMaterial({color: 0xff0000}), new THREE.MeshLambertMaterial({color: 0xffff00})];
let currentPlayer = 0;

function addPiece(column) {
    // Simplified: Add piece at the top of the specified column
    const pieceMesh = new THREE.Mesh(pieceGeometry, playerMaterial[currentPlayer]);
    pieceMesh.position.x = column - 3; // Adjust position based on column
    pieceMesh.position.y = 3; // Adjust based on row, simplified here
    scene.add(pieceMesh);

    // Switch player
    currentPlayer = 1 - currentPlayer;
}

// Example: Add a piece to column 3
addPiece(3);

// Step 4: Check Win (To be implemented)

// Step 5: Game Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();