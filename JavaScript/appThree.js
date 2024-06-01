import * as THREE from 'three';
import { PointerLockControls } from 'PointerLockControls';
import { FBXLoader } from 'FBXLoader';

document.addEventListener("DOMContentLoaded", Start);

var skybox;
var cena = new THREE.Scene();
var camaraPerspetiva = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
var camaraSuperior = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
var cameraAtual = camaraPerspetiva;
var renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth - 15, window.innerHeight - 80);
renderer.setClearColor(0xaaaaaa);

document.body.appendChild(renderer.domElement);

var objetoImportado;
var mixerAnimacao;
var relogio = new THREE.Clock();
var importer = new FBXLoader();
var controls;
var lua;
var asteroide;

function addMoon() {
    const moonSize = 50;
    const subdivisions = 50;

    const moonTexture = new THREE.TextureLoader().load('Images/moon.png', function(texture){
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const repeatFactor = 10;
        texture.repeat.set(repeatFactor, repeatFactor);
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
    });

    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });

    const moonGeometry = new THREE.SphereGeometry(moonSize, subdivisions, subdivisions);

    lua = new THREE.Mesh(moonGeometry, moonMaterial);

    lua.position.y = -50;

    cena.add(lua);
}

function criarNumeroTextura(numero) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    context.font = '24px Arial';
    context.fillStyle = 'black';
    context.fillText(numero.toString(), 10, 30);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function Start() {
    controls = new PointerLockControls(camaraPerspetiva, renderer.domElement);
    cena.add(controls.getObject());

    mostrarMenuInicial();
    addMoon();

    var focoLuz = new THREE.SpotLight(0xffffff, 2);
    focoLuz.position.set(0, 5, 10);
    focoLuz.target.position.set(0, 0, 0);
    cena.add(focoLuz.target);
    focoLuz.target.updateMatrixWorld();
    cena.add(focoLuz);

    cena.add(skybox);
    
    camaraPerspetiva.position.set(0, 10, 12);
    camaraPerspetiva.lookAt(0, 0, 0);

    camaraSuperior.position.set(0, 50, 0);
    camaraSuperior.lookAt(0, 0, 0);

    renderer.render(cena, cameraAtual);

    document.addEventListener('click', function () {
        if (!controls.isLocked) {
            controls.lock();
        }
    });

    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);

    adicionarObjeto3D(); // Adicionar o objeto 3D aqui
    loop();
}

function iniciarJogo() {
    var menuInicial = document.getElementById('menu-inicial');
    menuInicial.remove();
    controls.lock();
}

function mostrarMenuInicial() {
    var menuInicialContainer = document.createElement('div');
    menuInicialContainer.id = 'menu-inicial';
    menuInicialContainer.style.position = 'absolute';
    menuInicialContainer.style.width = '100%';
    menuInicialContainer.style.height = '100%';
    menuInicialContainer.style.display = 'flex';
    menuInicialContainer.style.flexDirection = 'column';
    menuInicialContainer.style.justifyContent = 'center';
    menuInicialContainer.style.alignItems = 'center';
    menuInicialContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    menuInicialContainer.style.top = '0';
    document.body.appendChild(menuInicialContainer);

    var textoBoasVindas = document.createElement('div');
    textoBoasVindas.style.color = 'white';
    textoBoasVindas.innerHTML = '<h1 style="margin-top: 20px">Tic tac Toe Game</h1><p style="margin-left: 80px;">Press start!</p>';
    menuInicialContainer.appendChild(textoBoasVindas);

    var botaoIniciar = document.createElement('button');
    botaoIniciar.style.padding = '10px 20px';
    botaoIniciar.style.color = 'white';
    botaoIniciar.style.backgroundColor = 'orange';
    botaoIniciar.style.border = 'none';
    botaoIniciar.innerHTML = 'Start';
    botaoIniciar.style.borderRadius = '15px';
    botaoIniciar.addEventListener('click', iniciarJogo);
    menuInicialContainer.appendChild(botaoIniciar);
}

function criarBotaoVoltarMenu() {
    var botaoVoltar = document.createElement('button');
    botaoVoltar.style.position = 'absolute';
    botaoVoltar.style.top = '20px';
    botaoVoltar.style.right = '20px';
    botaoVoltar.style.padding = '10px 20px';
    botaoVoltar.style.color = 'white';
    botaoVoltar.style.backgroundColor = 'blue';
    botaoVoltar.style.border = 'none';
    botaoVoltar.innerHTML = 'Voltar ao Menu';
    botaoVoltar.addEventListener('click', voltarMenuInicial);
    document.body.appendChild(botaoVoltar);
}

function voltarMenuInicial() {
    cena.clear();
    cena.remove(controls.getObject());
    mostrarMenuInicial();
}

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var texture_dir = new THREE.TextureLoader().load('./SkyBox/xpos.png');
var texture_esq = new THREE.TextureLoader().load('./SkyBox/xneg.png');
var texture_up = new THREE.TextureLoader().load('./SkyBox/ypos.png');
var texture_dn = new THREE.TextureLoader().load('./SkyBox/yneg.png');
var texture_bk = new THREE.TextureLoader().load('./SkyBox/zpos.png');
var texture_ft = new THREE.TextureLoader().load('./SkyBox/zneg.png');

var materialArray = [];

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dir }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_esq }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));

for (var i = 0; i < 6; i++)
    materialArray[i].side = THREE.BackSide;

var skyboxGeo = new THREE.BoxGeometry(100, 100, 100);
skybox = new THREE.Mesh(skyboxGeo, materialArray);

function onDocumentKeyDown(event) {
    var keyCode = event.keyCode;
    switch (keyCode) {
        case 87:
            moveForward = true;
            break;
        case 83:
            moveBackward = true;
            break;
        case 65:
            moveLeft = true;
            break;
        case 68:
            moveRight = true;
            break;
        case 49:
            cameraAtual = camaraPerspetiva;
            break;
        case 50:
            cameraAtual = camaraSuperior;
            break;
    }
}

function onDocumentKeyUp(event) {
    var keyCode = event.keyCode;
    switch (keyCode) {
        case 87:
            moveForward = false;
            break;
        case 83:
            moveBackward = false;
            break;
        case 65:
            moveLeft = false;
            break;
        case 68:
            moveRight = false;
            break;
    }
}

function adicionarObjeto3D() {
    var textureLoader = new THREE.TextureLoader();
    var asteroideTexture = textureLoader.load('./Images/martian-texture.png');
    var objetoGeometry = new THREE.IcosahedronGeometry(3, 1); // Geometria menor para criar um asteroide
    var objetoMaterial = new THREE.MeshBasicMaterial({ map: asteroideTexture }); // Material com textura
    asteroide = new THREE.Mesh(objetoGeometry, objetoMaterial);

    // Posicionar o objeto dentro do skybox
    asteroide.position.set(0, 20, -30); // Ajuste a posição conforme necessário

    // Adicionar o objeto à cena
    cena.add(asteroide);
}

var angulo = 0;
var velocidadeAngular = 0.008; // Ajuste a velocidade conforme necessário
var raioOrbita = 50;// Ajuste o raio da órbita conforme necessário
var alturaOrbita = 30; // Ajuste a altura da órbita conforme necessário

function loop() {
    if (moveForward) controls.moveForward(0.1);
    if (moveBackward) controls.moveForward(-0.1);
    if (moveLeft) controls.moveRight(-0.1);
    if (moveRight) controls.moveRight(0.1);

    if (lua) {
        lua.rotation.y += 0.01;
    }

    if (asteroide) {
        asteroide.rotation.y += 0.05;

        // Lógica para mover o asteroide em uma órbita circular ao redor da lua
        asteroide.position.x = lua.position.x + raioOrbita * Math.cos(angulo);
        asteroide.position.y = lua.position.y + raioOrbita * Math.sin(angulo) + alturaOrbita;
        angulo += velocidadeAngular;
    }

    renderer.render(cena, cameraAtual);
    requestAnimationFrame(loop);
}