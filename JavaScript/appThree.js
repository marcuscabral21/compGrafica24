// Importação da biblioteca ThreeJS baseada no importmap
import * as THREE from 'three';

// Importação da biblioteca que nos permite explorar a nossa cena através do importmap
import { PointerLockControls } from 'PointerLockControls';

// Importação da biblioteca que nos permite importar objetos 3D em formato FBX baseada no importmap
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

// Variável que guardará o objeto importado
var objetoImportado;

// Variável que irá guardar o controlador de animações do objeto importado
var mixerAnimacao;

// Variável que é responsável por controlar o tempo da aplicação
var relogio = new THREE.Clock();

// Variável com o objeto responsável por importar ficheiros FBX
var importer = new FBXLoader();

var controls;

// Variável para a lua
var lua;

function addMoon() {
    const moonSize = 50; // Raio da esfera
    const subdivisions = 50; // Subdivisões da esfera

    const moonTexture = new THREE.TextureLoader().load('Images/moon.png', function(texture){
        texture.wrapS = THREE.RepeatWrapping; // Permitir repetição horizontal
        texture.wrapT = THREE.RepeatWrapping; // Permitir repetição vertical
        const repeatFactor = 10; // Defina quantas vezes a textura deve se repetir
        texture.repeat.set(repeatFactor, repeatFactor);
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
    });

    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });

    const moonGeometry = new THREE.SphereGeometry(moonSize, subdivisions, subdivisions); // Alterado para SphereGeometry

    lua = new THREE.Mesh(moonGeometry, moonMaterial);

    lua.position.y = -50;

    cena.add(lua);
}

// Função para criar textura com número
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
    // Configurar PointerLockControls
    controls = new PointerLockControls(camaraPerspetiva, renderer.domElement);

    // Adiciona o PointerLockControls à cena
    cena.add(controls.getObject());

    // Cria o menu inicial
    mostrarMenuInicial();

    // Adicionar lua
    addMoon();

    // Criação de um foco de luz com a cor branca (#ffffff) e intensidade a 1 (intensidade normal).
    var focoLuz = new THREE.SpotLight(0xffffff, 2); // Cor branca, intensidade 1

    // Mudar a posição da luz para ficar 5 unidades acima da câmera e 10 unidades para a frente
    focoLuz.position.set(0, 5, 10);

    // Dizemos a light para ficar a apontar para a posição do centro do tabuleiro.
    focoLuz.target.position.set(0, 0, 0); // Define o alvo da luz para o centro do tabuleiro
    cena.add(focoLuz.target); // Adiciona o alvo da luz à cena
    focoLuz.target.updateMatrixWorld(); // Atualiza a posição do alvo no mundo

    // Adicionamos a luz à cena
    cena.add(focoLuz);

    cena.add(skybox);
    
    // Posicionar a câmara inicial
    camaraPerspetiva.position.set(0, 10, 12); // Ajuste a posição da câmera para que o tabuleiro seja centralizado e tenha uma visão mais ampla
    camaraPerspetiva.lookAt(0, 0, 0);

    // Configurar a câmera de visão superior
    camaraSuperior.position.set(0, 50, 0); // Posicione a câmera bem acima do tabuleiro
    camaraSuperior.lookAt(0, 0, 0);

    // Renderizar a cena
    renderer.render(cena, cameraAtual);

    document.addEventListener('click', function () {
        if (!controls.isLocked) {
            controls.lock();
        }
    });    

    // Adicionar eventos de teclado para movimentar a câmera e alternar entre câmeras
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);

    // Iniciar o loop de animação
    loop();
}

function iniciarJogo() {
    // Remover o menu inicial
    var menuInicial = document.getElementById('menu-inicial');
    menuInicial.remove();

    // Ativar o bloqueio do cursor para permitir a exploração da cena
    controls.lock();
}

function mostrarMenuInicial() {
    // Criar o contêiner do menu inicial
    var menuInicialContainer = document.createElement('div');
    menuInicialContainer.id = 'menu-inicial';
    menuInicialContainer.style.position = 'absolute';
    menuInicialContainer.style.width = '100%';
    menuInicialContainer.style.height = '100%';
    menuInicialContainer.style.display = 'flex';
    menuInicialContainer.style.flexDirection = 'column';
    menuInicialContainer.style.justifyContent = 'center'; // Centraliza verticalmente
    menuInicialContainer.style.alignItems = 'center'; // Centraliza horizontalmente
    menuInicialContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Fundo preto com 80% de opacidade
    menuInicialContainer.style.top = '0'; // Posiciona o menu no topo da janela
    document.body.appendChild(menuInicialContainer);

    // Criar texto de boas-vindas
    var textoBoasVindas = document.createElement('div');
    textoBoasVindas.style.color = 'white'; // Define a cor do texto como branco
    textoBoasVindas.innerHTML = '<h1 style="margin-top: 20px">Tic tac Toe Game</h1><p style="margin-left: 80px;">Press start!</p>';
    menuInicialContainer.appendChild(textoBoasVindas);

    // Adicionar um botão de iniciar jogo
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

// Função para criar o botão "Voltar ao Menu"
function criarBotaoVoltarMenu() {
    // Criar o botão
    var botaoVoltar = document.createElement('button');
    botaoVoltar.style.position = 'absolute';
    botaoVoltar.style.top = '20px'; // Ajuste a posição conforme necessário
    botaoVoltar.style.right = '20px'; // Ajuste a posição conforme necessário
    botaoVoltar.style.padding = '10px 20px';
    botaoVoltar.style.color = 'white';
    botaoVoltar.style.backgroundColor = 'blue';
    botaoVoltar.style.border = 'none';
    botaoVoltar.innerHTML = 'Voltar ao Menu';
    
    // Adicionar evento de clique para voltar ao menu
    botaoVoltar.addEventListener('click', voltarMenuInicial);
    
    // Adicionar o botão ao corpo do documento
    document.body.appendChild(botaoVoltar);
}

// Função para voltar ao menu inicial
function voltarMenuInicial() {
    // Limpar a cena
    cena.clear();
    
    // Remover os controles do jogador
    cena.remove(controls.getObject());
    
    // Mostrar o menu inicial novamente
    mostrarMenuInicial();
}

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

// Declaração das variáveis globais
var cena, luzDoSol, sol, skybox;
var isDia = true; // Variável para controlar se é dia ou noite

// Código para carregar as texturas e criar a skybox
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
        case 87: // W
            moveForward = true;
            break;
        case 83: // S
            moveBackward = true;
            break;
        case 65: // A
            moveLeft = true;
            break;
        case 68: // D
            moveRight = true;
            break;
        case 49: // 1
            cameraAtual = camaraPerspetiva;
            break;
        case 50: // 2
            cameraAtual = camaraSuperior;
            break;
    }
}

function onDocumentKeyUp(event) {
    var keyCode = event.keyCode;
    switch (keyCode) {
        case 87: // W
            moveForward = false;
            break;
        case 83: // S
            moveBackward = false;
            break;
        case 65: // A
            moveLeft = false;
            break;
        case 68: // D
            moveRight = false;
            break;
    }
}

function loop(){
    if (moveForward) controls.moveForward(0.1);
    if (moveBackward) controls.moveForward(-0.1);
    if (moveLeft) controls.moveRight(-0.1);
    if (moveRight) controls.moveRight(0.1);

    // Adicionar rotação contínua para a lua
    if (lua) {
        lua.rotation.y += 0.01; // Ajuste a velocidade de rotação conforme necessário
    }

    renderer.render(cena, cameraAtual);
    requestAnimationFrame(loop);
}
