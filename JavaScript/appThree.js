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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

    const moonGeometry = new THREE.SphereGeometry(moonSize, subdivisions, subdivisions);

    lua = new THREE.Mesh(moonGeometry, moonMaterial);

    lua.position.y = -50;
    lua.castShadow = true;
    lua.receiveShadow = true;

    cena.add(lua);
}


// Função para criar textura com número
// function criarNumeroTextura(numero) {
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     canvas.width = 64;
//     canvas.height = 64;
//     context.font = '24px Arial';
//     context.fillStyle = 'black';
//     context.fillText(numero.toString(), 10, 30);
//     const texture = new THREE.CanvasTexture(canvas);
//     return texture;
// }

function addTextoBemVindo() {
    // Carregar a fonte (você pode precisar de uma fonte adequada, por exemplo, uma fonte tipo 'helvetiker')
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        // Criar um objeto TextGeometry
        var textoGeometry = new THREE.TextGeometry('Lunar Tic Tac Toe', {
            font: font,
            size: 5, // Tamanho do texto
            height: 1 // Altura do texto
        });

        // Criar um material para o texto
        var textoMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Criar uma malha (mesh) com o texto e o material
        var textoMesh = new THREE.Mesh(textoGeometry, textoMaterial);

        // Posicionar o texto na cena
        textoMesh.position.set(-20, 10, -10); // Ajuste conforme necessário

        // Adicionar o texto à cena
        cena.add(textoMesh);

 

        // Após 10 segundos, animar o texto para voar para fora da cena
        setTimeout(() => {
            var tween = new TWEEN.Tween(textoMesh.position)
                .to({ x: 50, y: 20, z: -20 }, 3000) // Defina a posição final para onde o texto voará
                .easing(TWEEN.Easing.Quadratic.Out) // Escolha a função de easing para a animação
                .onComplete(() => {
                    // Remover o texto da cena após a animação
                    cena.remove(textoMesh);
                })
                .start(); // Inicie a animação
        }, 5000); // 10000 milissegundos = 10 segundos
    });
}


function addTable() {
    const tableGeometry = new THREE.BoxGeometry(10, 0.5, 12.5); // Tamanho da mesa ajustado
    const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x3B414A }); // Cor da mesa
    const table = new THREE.Mesh(tableGeometry, tableMaterial);

    // Posicionar a mesa em uma localização visível
    table.position.set(0, 2, 0); // Ajuste a altura para que fique em cima da lua

    table.receiveShadow = true;
    table.castShadow = true;
    cena.add(table);

    const legGeometry = new THREE.BoxGeometry(0.5, 5, 0.5);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x3B414A });

    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(table.position.x - 4.75, table.position.y - 2.75, table.position.z - 6);
    leg1.receiveShadow = true;
    leg1.castShadow = true;
    cena.add(leg1);

    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(table.position.x + 4.75, table.position.y - 2.75, table.position.z - 6);
    leg2.receiveShadow = true;
    leg2.castShadow = true;
    cena.add(leg2);

    const leg3 = new THREE.Mesh(legGeometry, legMaterial);
    leg3.position.set(table.position.x - 4.75, table.position.y - 2.75, table.position.z + 6);
    leg3.receiveShadow = true;
    leg3.castShadow = true;
    cena.add(leg3);

    const leg4 = new THREE.Mesh(legGeometry, legMaterial);
    leg4.position.set(table.position.x + 4.75, table.position.y - 2.75, table.position.z + 6);
    leg4.receiveShadow = true;
    leg4.castShadow = true;
    cena.add(leg4);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('Images/pngwing.com.png', function(texture) {
        console.log('Textura carregada:', texture);

        // Criar material usando a textura com transparência e dos dois lados
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });

        // Ajustar a escala da geometria para que a imagem seja visível
        const imageGeometry = new THREE.PlaneGeometry(10, 10); // Ajuste o tamanho conforme necessário

        // Criar um objeto para representar a imagem
        const imageMesh = new THREE.Mesh(imageGeometry, material);

        // Posição inicial acima do tabuleiro para animação de flutuação
        imageMesh.position.set(table.position.x - 2.75, table.position.y + 10.5, table.position.z - 7); // Ajuste conforme necessário

        // Adicionar a imagem à cena
        cena.add(imageMesh);

        // Animação de aterrissagem suave
        function animateLanding() {
            new TWEEN.Tween(imageMesh.position)
                .to({ y: table.position.y + 2.5 }, 3000) // Descer suavemente em 3 segundos
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        }

        // Animação de flutuação contínua
        function animateFloat() {
            new TWEEN.Tween(imageMesh.position)
                .to({ y: table.position.y + 3 }, 1500) // Subir um pouco
                .easing(TWEEN.Easing.Quadratic.InOut)
                .yoyo(true) // Fazer a animação de ida e volta
                .repeat(Infinity) // Repetir infinitamente
                .start();
        }

        animateLanding(); // Iniciar a animação de aterrissagem
        setTimeout(animateFloat, 3000); // Iniciar a animação de flutuação após a aterrissagem
    });
}
function addBoard() {
    const boardSize = 7.5; // Tamanho do tabuleiro ajustado
    const cellSize = boardSize / 3; // Tamanho da célula

    // Criar geometria para o tabuleiro
    const boardGeometry = new THREE.BoxGeometry(boardSize, 0.05, boardSize);
    const boardMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Cor do tabuleiro
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.name = 'board';
    // Posicionar o tabuleiro em cima da mesa
    board.position.set(0, 3, 0); // Ajuste a altura para que fique em cima da mesa
    boardInitialPosition = board.position.clone(); // Guardar posição inicial do tabuleiro

    // Adicionar o tabuleiro à cena
    cena.add(board);

    // Adicionar linhas horizontais ao tabuleiro
    for (let i = 1; i < 3; i++) {
        const lineGeometry = new THREE.BoxGeometry(boardSize, 0.05, 0.05);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Cor das linhas
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 3.025, i * cellSize - boardSize / 2); // Ajustar a altura das linhas
        cena.add(line);
    }

    // Adicionar linhas verticais ao tabuleiro
    for (let i = 1; i < 3; i++) {
        const lineGeometry = new THREE.BoxGeometry(0.05, 0.05, boardSize);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Cor das linhas
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(i * cellSize - boardSize / 2, 3.025, 0); // Ajustar a altura das linhas
        cena.add(line);
    }

    // Lógica do Jogo da Velha (Tic-Tac-Toe)
    const loader = new THREE.TextureLoader();
    const crossTexture = loader.load('Images/Cross.png');
    const circleTexture = loader.load('Images/Circle.png');

    const pieces = [];

    // Geometria e material para os círculos
    const circleGeometry = new THREE.PlaneGeometry(1, 1); // Tamanho da peça ajustado
    const circleMaterial = new THREE.MeshBasicMaterial({ map: circleTexture, transparent: true });

    // Geometria e material para as cruzes
    const crossGeometry = new THREE.PlaneGeometry(1, 1); // Tamanho da peça ajustado
    const crossMaterial = new THREE.MeshBasicMaterial({ map: crossTexture, transparent: true });

    cameraInitialPosition = camera.position.clone();
}
function addFlag() {
    const poleHeight = 15;
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, poleHeight, 32);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x3B414A }); // Cor do mastro (marrom)
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(6, 2.5, 0); // Ajuste conforme necessário
    cena.add(pole);

    // Carrega a textura da bandeira
    const loader = new THREE.TextureLoader();
    loader.load('Images/utad.png', function(texture) {
        const flagWidth = 2;
        const flagHeight = 1.5;
        const flagGeometry = new THREE.PlaneGeometry(flagWidth, flagHeight);
        const flagMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);

        // Ajuste da posição da bandeira
        flag.position.set(pole.position.x + flagWidth / 2, pole.position.y + poleHeight / 2 - 0.1, pole.position.z); // Ajuste na posição Y para subir e um pouco para baixo para não ficar para fora

        cena.add(flag);
    });
}
let selectedPiece = null;

// Função para adicionar peça (cruz ou círculo) ao tabuleiro

function addPiece(row, col, piece) {
    const pieceTexture = piece === 'X' ? 'Images/cross.png' : piece === 'O' ? 'Images/circle.png' : null; // Textura da peça
    const pieceGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const pieceMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(pieceTexture), transparent: true });
    const pieceMesh = new THREE.Mesh(pieceGeometry, pieceMaterial);
    pieceMesh.name = piece === 'X' ? 'cross' : 'circle'; // Assign a name to the piece

    const boardSize = 7.5;
    const cellSize = boardSize / 3; // Cada célula é um terço do tabuleiro
    const boardOffset = boardSize / 2; // Metade do tamanho do tabuleiro

    const posX = -boardOffset + col * cellSize + cellSize / 2; // Posição X no centro da célula
    const posZ = -boardOffset + row * cellSize + cellSize / 2; // Posição Z no centro da célula

    const posY = 4; // Ajuste da altura para que as peças fiquem na superfície do tabuleiro

    // Posição inicial fora do tabuleiro para animação de aterrissagem
    pieceMesh.position.set(posX, posY + 10, posZ); 
    pieceMesh.rotation.x = -Math.PI / 2; // Rotacionar para que a peça fique deitada no tabuleiro
    cena.add(pieceMesh);

    // Animação de aterrissagem
    new TWEEN.Tween(pieceMesh.position)
        .to({ y: posY + 2 }, 500) // Movimento inicial para baixo
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            new TWEEN.Tween(pieceMesh.position)
                .to({ y: posY }, 300) // Movimento final para aterrissar
                .easing(TWEEN.Easing.Bounce.Out)
                .onComplete(() => {
                    animateRotation(); // Inicia a animação de rotação contínua após a aterrissagem
                })
                .start();
        })
        .start();

    // Adiciona uma animação contínua de rotação ao redor do eixo Y (vertical)
    function animateRotation() {
        new TWEEN.Tween(pieceMesh.rotation)
            .to({ y: pieceMesh.rotation.y + Math.PI * 2 }, 2000) // Rotação completa em 2000ms (2 segundos)
            .onComplete(() => {
                animateRotation(); // Chama a função recursivamente para criar um loop de animação
            })
            .start(); // Inicia a animação
    }



    animateRotation(); // Inicia a animação pela primeira vez

    boardState[row][col] = piece; // Atualiza o estado do tabuleiro
}
// Adicione essa variável para controlar quem é o jogador atual

// Função para alternar entre jogador e bot





// Função para verificar se o jogo terminou
function checkGameOver() {
    // Verifica se o tabuleiro está cheio
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (boardState[i][j] === '') {
                return false; // Ainda há espaços vazios, o jogo não terminou
            }
        }
    }
    return true; // O tabuleiro está cheio, o jogo terminou
}

// Função para verificar se há um vencedor
function checkWinner() {
    const winConditions = [
        [[0, 0], [0, 1], [0, 2]], // Linhas
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]], // Colunas
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]], // Diagonais
        [[0, 2], [1, 1], [2, 0]]
    ];

    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (boardState[a[0]][a[1]] && boardState[a[0]][a[1]] === boardState[b[0]][b[1]] && boardState[a[0]][a[1]] === boardState[c[0]][c[1]]) {
            // Retorna a peça do vencedor e exibe o menu de fim de jogo
            showGameOverMenu(boardState[a[0]][a[1]]);
            return boardState[a[0]][a[1]];
        }
    }

    // Verifica se o jogo terminou em empate e exibe o menu de fim de jogo
    if (checkGameOver()) {
        showGameOverMenu(null);
        return null;
    }

    return null; // Não há vencedor
}

// Função para fazer a jogada do bot
function botPlay() {
    // Verifica se o jogo terminou
    if (checkGameOver()) {
        alert('Draw. Nice Game, Try Again!'); // Exibe mensagem de fim de jogo
        return;
    }

    // Escolhe uma posição aleatória no tabuleiro
    let row, col;
    do {
        row = Math.floor(Math.random() * 3);
        col = Math.floor(Math.random() * 3);
    } while (boardState[row][col] !== ''); // Repete até encontrar uma posição vazia

    // Adiciona a peça do bot ao tabuleiro
    addPiece(row, col, botPiece);}

    // Verifica se há um vencedor após a jogada do bot
    // const winner = checkWinner();
//     if (winner) {
//         alert('Player ' + winner + ' wins!'); // Exibe mensagem de vitória
//     }
// }

// Adiciona evento de clique no documento para manipular cliques no tabuleiro
document.addEventListener('click', function(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, cameraAtual);

    const intersects = raycaster.intersectObjects(cena.children); // Verifica interseções com objetos na cena
    for (const intersect of intersects) {
        const col = Math.floor((intersect.point.x + boardSize / 2) / cellSize); // Calculate the column on the board
        const row = Math.floor((intersect.point.z + boardSize / 2) / cellSize); // Calculate the row on the board

        console.log('Row:', row, 'Col:', col); // Debugging output

        // Check if the calculated row and col are within the board boundaries
        if (row >= 0 && row < boardState.length && col >= 0 && col < boardState[0].length) {
            if (boardState[row][col] === '') { // If the position is empty
                addPiece(row, col, playerPiece); // Add the player's piece to the position
                const winner = checkWinner(); // Check if there is a winner after the player's move
                if (winner) {
                    alert('Player ' + winner + ' wins!'); // Display the winning message
                    return;
                }
                botPlay(); // Execute the bot's move
                return;
            }
        } else {
            console.warn('Calculated row or col is out of bounds:', 'Row:', row, 'Col:', col); // Debugging output
        }
    }
});
function showThanksMessage() {
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const geometry = new THREE.TextGeometry('Thanks for playing the game', {
            font: font,
            size: 10, // Aumentando o tamanho do texto para facilitar a visualização
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: false
        });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.set(-20, 10, -50); // Ajustando a posição Z para garantir que o texto esteja na frente de outros objetos
        console.log('Texto criado:', textMesh.position); // Adicionando um console.log para verificar a posição do texto

        if (!cena) {
            console.error("A cena não está definida ou é inválida.");
            return;
        }

        cena.add(textMesh);

        // Animação de entrada da mensagem
        const initialPosition = { x: -20, y: 10, z: -50 };
        const targetPosition = { x: -20, y: 10, z: -20 };
        const duration = 2000;
        const easing = TWEEN.Easing.Quadratic.Out;

        new TWEEN.Tween(initialPosition)
            .to(targetPosition, duration)
            .easing(easing)
            .onUpdate(function() {
                textMesh.position.set(this.x, this.y, this.z);
            })
            .start();
    }, undefined, function(error) {
        console.error('Erro ao carregar a fonte:', error);
    });
}

// Função para explorar a cena
function explorarCena() {
    // Aqui você pode adicionar a lógica para explorar a cena

    var gameOverMenu = document.getElementById('game-over-menu');
    if (gameOverMenu) {
        gameOverMenu.remove();
    }

    // Chama a função para mostrar a mensagem 3D
    showThanksMessage();
}
    
function showGameOverMenu(winner) {
    // Cria o contêiner do menu de fim de jogo
    var gameOverMenuContainer = document.createElement('div');
    gameOverMenuContainer.id = 'game-over-menu';
    gameOverMenuContainer.style.position = 'absolute';
    gameOverMenuContainer.style.width = '100%';
    gameOverMenuContainer.style.height = '100%';
    gameOverMenuContainer.style.display = 'flex';
    gameOverMenuContainer.style.flexDirection = 'column';
    gameOverMenuContainer.style.justifyContent = 'center'; // Centraliza verticalmente
    gameOverMenuContainer.style.alignItems = 'center'; // Centraliza horizontalmente
    gameOverMenuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Fundo preto com 80% de opacidade
    gameOverMenuContainer.style.top = '0'; // Posiciona o menu no topo da janela
    document.body.appendChild(gameOverMenuContainer);

    // Cria texto dinâmico com base no vencedor
    var gameOverText = winner ? winner + ' wins!' : 'Game Over!';
    // Cria elemento de texto para mostrar o resultado do jogo
    var gameOverResult = document.createElement('h1');
    gameOverResult.innerHTML = gameOverText;
    gameOverResult.style.color = 'white'; // Define a cor do texto como branco
    gameOverMenuContainer.appendChild(gameOverResult);

    // Adiciona um botão para explorar a cena


    // Adiciona um botão para reiniciar o jogo
    var restartButton = document.createElement('button');
    restartButton.textContent = 'Explorar Cena';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '1.2em';
    restartButton.style.marginTop = '20px';
    restartButton.style.backgroundColor = 'green';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.cursor = 'pointer';
    restartButton.addEventListener('click', function() {
        // Chamada de função para reiniciar o jogo
        explorarCena();
        // Remove o menu de fim de jogo após reiniciar o jogo
        gameOverMenuContainer.remove();
    });
    gameOverMenuContainer.appendChild(restartButton);





    // Adiciona estilos ao documento
    var style = document.createElement('style');
    style.innerHTML = `
        #game-over-menu h1 {
            font-size: 3em;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            animation: float 3s ease-in-out infinite;
            transform-style: preserve-3d;
            perspective: 500px;
        }

        #game-over-menu h1::before, #game-over-menu h1::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            transform: translateZ(-30px);
            z-index: -1;
            opacity: 0.5;
        }

        #game-over-menu h1::after {
            transform: translateZ(-60px);
            opacity: 0.2;
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotateX(0) rotateY(0);
            }
            50% {
                transform: translateY(-20px) rotateX(10deg) rotateY(10deg);
            }
        }
    `;
    document.head.appendChild(style);
}

function Start() {
    controls = new PointerLockControls(camaraPerspetiva, renderer.domElement);
    cena.add(controls.getObject());

    mostrarMenuInicial();
    addMoon();

    var focoLuz = new THREE.SpotLight(0xffffff, 1.0);  // Diminuir intensidade
    focoLuz.position.set(0, 5, 10);
    focoLuz.castShadow = true;
    cena.add(focoLuz);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);  // Diminuir intensidade
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;

    cena.add(directionalLight);

    var planeGeometry = new THREE.PlaneGeometry(200, 200);
    var planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -60;
    plane.receiveShadow = true;

    cena.add(plane);

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
    textoBoasVindas.innerHTML = '<h1 data-text="Lunar Tic Tac Toe">Lunar Tic Tac Toe</h1><p style="text-align: center;">Press start!</p>';
    textoBoasVindas.style.color = 'white'; // Define a cor do texto como branco
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
    var objetoMaterial = new THREE.MeshStandardMaterial({ map: asteroideTexture }); // Material com textura
    asteroide = new THREE.Mesh(objetoGeometry, objetoMaterial);

    asteroide.castShadow = true;
    asteroide.receiveShadow = true;

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
