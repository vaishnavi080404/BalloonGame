 const canvas = document.getElementById("gameCanvas");
        const context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const folder = "assets/";
        const popColors = ["#45c445", "#459cc4", "#e4e810", "#e81080", "#e81010", "#e86e10", "#00E5FF", "#2910e8", "#e89210", "#b210e8"];
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // IMAGES OBJECTS
        const images = {
            bg: new Image(),
            body: new Image(),
            handle: new Image(),
            nozzle: new Image(),
            string: new Image(),
            balloons: [],
            letters: []
        };

        let imagesLoaded = 0;
        let gameStarted = false;

        // POSITIONS
        const pump = { x: canvas.width - 250, y: canvas.height - 250, width: 160, height: 160 };
        const handle = { x: pump.x + 10, y: pump.y - 40, width: 140, height: 100 };
        const nozzle = { x: pump.x - 85, y: pump.y - 25, width: 150, height: 150 };
        const balloonStartPosition = { x: nozzle.x + 38, y: nozzle.y + 13 };
        const balloonSize = 110;

        // GAME STATE
        let handlePushDown = 0; 
        let currentLetterIndex = 0;
        let activeBalloon = { scale: 0.1, colorIndex: 0, letterIndex: 0 };
        let flyingBalloons = [];
        let popEffects = [];

        // LOAD IMAGES
        const onImageLoad = () => {
            imagesLoaded++;
            if (imagesLoaded >= 5 && !gameStarted) { //at least 5 images to start
                gameStarted = true;
                document.getElementById('loading-text').style.display = 'none';
                createNewBalloon();
                gameLoop();
            }
        };

        const loadImage = (imageObject, fileName) => {
            imageObject.src = folder + fileName;
            imageObject.onload = onImageLoad;
        };
// LOADING THE IMAGES NOW
        loadImage(images.bg, "bg.png");
        loadImage(images.body, "pump.png");
        loadImage(images.handle, "handle.png");
        loadImage(images.nozzle, "nozzle.png");
        loadImage(images.string, "string.png");

        for (let i = 1; i <= 10; i++) {
            let balloonImage = new Image();
            loadImage(balloonImage, "b" + i + ".png");
            images.balloons.push(balloonImage);
        }

        for (let i = 0; i < alphabet.length; i++) {
            let letterImage = new Image();
            loadImage(letterImage, alphabet[i] + ".png");
            images.letters.push(letterImage);
        }

        // GAME FUNCTIONS
        const createNewBalloon = () => { // new balloon on pump
            activeBalloon = {
                scale: 0.1, // start with small in size
                colorIndex: Math.floor(Math.random() * 10),
                letterIndex: currentLetterIndex
            };
            currentLetterIndex = (currentLetterIndex + 1) % alphabet.length;
        };

        const updateGame = () => {
            // move handle back up after being pushed
            if (handlePushDown > 0) handlePushDown -= 2;

            // move flying balloons
            flyingBalloons.forEach(balloon => {
                balloon.x += balloon.speedX;
                balloon.y += balloon.speedY;
                
                // bounce off left/right walls
                if (balloon.x < 0 || balloon.x > canvas.width - 100) {
                    balloon.speedX *= -1;
                }
                // bounce off top/bottom walls
                if (balloon.y < 0 || balloon.y > canvas.height - 120) {
                    balloon.speedY *= -1;
                }
            });

            // update pop effects
            popEffects = popEffects.filter(effect => {
                effect.lifeTime--;
                return effect.lifeTime > 0;
            });
        };

        const drawBalloon = (x, y, scale, colorIndex, letterIndex, showString) => {
            let size = balloonSize * scale;
            // draw string
            if (showString && images.string.complete) {
                context.drawImage(images.string, x + size/2 - 10*scale, y + size - 25*scale, 20*scale, 80*scale);
            }
            // draw balloon body
            let balloonImage = images.balloons[colorIndex];
            if (balloonImage && balloonImage.complete) {
                context.drawImage(balloonImage, x, y, size, size);
            }
            // draw letter
            let letterImage = images.letters[letterIndex];
            if (letterImage && letterImage.complete) {
                let letterSize = 50 * scale;
                context.drawImage(letterImage, x + size/2 - letterSize/2, y + size/2 - letterSize/2, letterSize, letterSize);
            }
        };

        const drawPopEffect = (x, y, color) => {
            context.save();
            context.translate(x + 50, y + 60);
            // draw burst star shape
            context.fillStyle = color;
            context.beginPath();
            for (let i = 0; i < 10; i++) {
                context.rotate(Math.PI / 5);
                context.lineTo(0, 0);
                context.lineTo(15, 70);
                context.lineTo(0, 40);
            }
            context.fill();
            // draw "POP" text
            context.fillStyle = "white";
            context.font = "bold 30px Arial";
            context.textAlign = "center";
            context.fillText("POP!", 0, 0);
            context.restore();
        };

        const drawGame = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            // draw background
            if (images.bg.complete) {
                context.drawImage(images.bg, 0, 0, canvas.width, canvas.height);
            }
            // draw handle
            if (images.handle.complete) {
                context.drawImage(images.handle, handle.x, handle.y + handlePushDown, handle.width, handle.height);
            }
            // draw all flying balloons
            flyingBalloons.forEach(balloon => {
                drawBalloon(balloon.x, balloon.y, balloon.scale, balloon.colorIndex, balloon.letterIndex, true);
            });
            // draw active balloon on pump
            let currentSize = balloonSize * activeBalloon.scale;
            let balloonX = balloonStartPosition.x - currentSize/2;
            let balloonY = balloonStartPosition.y - currentSize + 15;
            drawBalloon(balloonX, balloonY, activeBalloon.scale, activeBalloon.colorIndex, activeBalloon.letterIndex, false);
            // draw pump nozzle and body
            if (images.nozzle.complete) {
                context.drawImage(images.nozzle, nozzle.x, nozzle.y, nozzle.width, nozzle.height);
            }
            if (images.body.complete) {
                context.drawImage(images.body, pump.x, pump.y, pump.width, pump.height);
            }
            // draw all pop effects
            popEffects.forEach(effect => {
                drawPopEffect(effect.x, effect.y, effect.color);
            });
        };
        const gameLoop = () => {
            updateGame();
            drawGame();
            requestAnimationFrame(gameLoop); // loop the game 
        };
        // INPUT HANDLING
        const handleClick = (clickX, clickY) => {
            let currentHandleY = handle.y + handlePushDown;
            // check if handle is clicked
            if (clickX > handle.x - 20 && clickX < handle.x + handle.width + 20 && 
                clickY > currentHandleY - 20 && clickY < currentHandleY + handle.height + 20) {
                
                handlePushDown = 40;
                activeBalloon.scale += 0.15;
                // release balloon when it is fully inflated
                if (activeBalloon.scale >= 1.0) {
                    flyingBalloons.push({
                        x: balloonStartPosition.x - balloonSize/2,
                        y: balloonStartPosition.y - balloonSize + 15,
                        speedX: (Math.random() - 0.5) * 3,
                        speedY: -(Math.random() * 1.5 + 1),
                        scale: 1.0,
                        colorIndex: activeBalloon.colorIndex,
                        letterIndex: activeBalloon.letterIndex
                    });
                    createNewBalloon();
                }
                return;
            }
            // check if flying balloon was clicked
            for (let i = flyingBalloons.length - 1; i >= 0; i--) {
                let balloon = flyingBalloons[i];
                if (clickX > balloon.x && clickX < balloon.x + balloonSize && 
                    clickY > balloon.y && clickY < balloon.y + balloonSize) {
                
                    popEffects.push({ 
                        x: balloon.x, 
                        y: balloon.y, 
                        lifeTime: 20, 
                        color: popColors[balloon.colorIndex] || "red" 
                    });
                    flyingBalloons.splice(i, 1);
                    return;
                }
            }
        };
        window.addEventListener('mousedown', e => handleClick(e.clientX, e.clientY));
        

















