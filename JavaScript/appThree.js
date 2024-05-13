// Importação da biblioteca ThreeJS baseada no importmap
import * as THREE from 'three';

// Importação da biblioteca que nos permite explorar a nossa cena através do importmap
import { PointerLockControls } from 'PointerLockControls';

// Importação da biblioteca que nos permite importar objetos 3D em formato FBX baseada no importmap
import { FBXLoader } from 'FBXLoader';

document.addEventListener("DOMContentLoaded", Start);

var cena = new THREE.Scene();
var camaraPerspetiva = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
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

// Função para criar o tabuleiro
function criarTabuleiro() {
    const tamanhoTabuleiro = 3; 
    const tamanhoCasa = 1;

    const tabuleiro = new THREE.Group();

    var numero = 9;

    for (let i = 0; i < tamanhoTabuleiro; i++) {
        for (let j = 0; j < tamanhoTabuleiro; j++) {
            const cor = ((i + j) % 2 === 0) ? 0xffffff : 0xffff00; // Alternar entre branco e amarelo
            const geometry = new THREE.BoxGeometry(tamanhoCasa, 0.1, tamanhoCasa);
            const material = new THREE.MeshStandardMaterial({ color: cor });
            const casa = new THREE.Mesh(geometry, material);
            casa.position.set(j - tamanhoTabuleiro / 2 + 0.5, 0, i - tamanhoTabuleiro / 2 + 0.5); // Centralizar o tabuleiro
            tabuleiro.add(casa);

            // Adicionar número em cada quadradinho
            const numeroTextura = criarNumeroTextura(numero);
            const numeroMaterial = new THREE.MeshBasicMaterial({ map: numeroTextura, transparent: true });
            const numeroMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), numeroMaterial);
            numeroMesh.position.set(j - tamanhoTabuleiro / 2 + 0.55, 0.2, i - tamanhoTabuleiro / 2 + 0.55); // Posição no canto superior direito do quadrado
            tabuleiro.add(numeroMesh);

            numero--;
        }
    }

    // Adicionar o tabuleiro à cena
    cena.add(tabuleiro);
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

function Start(){
    // Configurar PointerLockControls
    controls = new PointerLockControls(camaraPerspetiva, renderer.domElement);

    // Adiciona o PointerLockControls à cena
    cena.add(controls.getObject());

    // Cria o menu inicial
    mostrarMenuInicial();

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

    // Posicionar a câmara
    camaraPerspetiva.position.set(0, 10, 12); // Ajuste a posição da câmera para que o tabuleiro seja centralizado e tenha uma visão mais ampla

    // Definir a direção para a câmara olhar
    camaraPerspetiva.lookAt(0, 0, 0);

    // Renderizar a cena
    renderer.render(cena, camaraPerspetiva);

    document.addEventListener('click', function () {
        if (!controls.isLocked) {
            controls.lock();
        }
    });    

    // Adicionar eventos de teclado para movimentar a câmera
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);

    // Iniciar o loop de animação
    loop();
}

function iniciarJogo() {
    // Remover o menu inicial
    var menuInicial = document.getElementById('menu-inicial');
    menuInicial.remove();

    // Criar o tabuleiro de xadrez
    criarTabuleiro();

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
    menuInicialContainer.style.backgroundColor = 'black';
    menuInicialContainer.style.top = '0'; // Posiciona o menu no topo da janela
    document.body.appendChild(menuInicialContainer);

    // Criar texto de boas-vindas
    var textoBoasVindas = document.createElement('div');
    textoBoasVindas.style.color = 'white'; // Define a cor do texto como branco
    textoBoasVindas.innerHTML = '<h1>Bem-vindo ao Jogo de Cobras e Escadas</h1><p>Pressione iniciar para começar</p>';
    menuInicialContainer.appendChild(textoBoasVindas);

    // Adicionar um botão de iniciar jogo
    var botaoIniciar = document.createElement('button');
    botaoIniciar.style.padding = '10px 20px';
    botaoIniciar.style.color = 'white';
    botaoIniciar.style.backgroundColor = 'blue';
    botaoIniciar.style.border = 'none';
    botaoIniciar.innerHTML = 'Iniciar';
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
    
    // Remover o tabuleiro
    cena.remove(tabuleiro);
    
    // Mostrar o menu inicial novamente
    mostrarMenuInicial();
}

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

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

    renderer.render(cena, camaraPerspetiva);

    requestAnimationFrame(loop);
}