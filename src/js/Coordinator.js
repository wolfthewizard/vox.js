function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


class Coordinator {

    static MAX_FPS = 60;
    static rotateMultiplier = 0.001;
    static translateMultiplier = 0.001;
    
    constructor(renderer, inputHandler, camera) {
        this.__renderer = renderer;
        this.__inputHandler = inputHandler;
        this.__camera = camera;
        this.centerPosition = new Vector3(0, 0, 0);

        this.__rerenderQueued = true;

        this.rotateMultiplier = Coordinator.rotateMultiplier;
        this.translateMultiplier = Coordinator.translateMultiplier;

        this.externalRotateMultiplier = 1.0;
        this.externalTranslateMultiplier = 1.0;
    }

    async run() {
        const minDelay = 1000 / Coordinator.MAX_FPS;
        const updateLatency = 1000;
        let previousUpdateTime = Date.now() - minDelay;

        let framesSinceLastUpdate = 0;
        let lastFrameUpdateId = Math.floor(previousUpdateTime / updateLatency);
        let lastFrameUpdateTime = previousUpdateTime;

        while (true) {
            const startTime = Date.now();
            const deltaTime = startTime - previousUpdateTime;
            previousUpdateTime = startTime;

            this.__calculateFrame(deltaTime);

            framesSinceLastUpdate += 1;
            const thisFrameId = Math.floor(startTime / updateLatency);
            if (thisFrameId != lastFrameUpdateId) {
                lastFrameUpdateId = thisFrameId;
                const fps = framesSinceLastUpdate / ((startTime - lastFrameUpdateTime) / 1000);
                elementMediator.fpsDisplaySpan.innerHTML = `${fps.toFixed(2)}fps`;

                framesSinceLastUpdate = 0;
                lastFrameUpdateTime = startTime;
            }

            const endTime = Date.now();
            const calculationDuration = endTime - startTime;
            const sleepTime = calculationDuration < minDelay ? minDelay - calculationDuration : 0;
            await sleep(sleepTime);
        }
    }

    queueRerender() {
        this.__rerenderQueued = true;
    }

    __calculateFrame(deltaTime) {
        this.__reposition(deltaTime);
        this.__render();
    }

    __reposition(deltaTime) {
        const axes = this.__inputHandler.axes;
        if (!axes.isZero()) {
            const orientationChange = axes.timesScalar(deltaTime);
            const cameraOrientation = this.__camera.orientation;
            const deltaX = 
                orientationChange.position.z * Math.sin(cameraOrientation.rotation.y) * Math.cos(cameraOrientation.rotation.x) + 
                orientationChange.position.x * Math.cos(cameraOrientation.rotation.y) * Math.cos(cameraOrientation.rotation.x) +
                orientationChange.position.y * Math.sin(cameraOrientation.rotation.y) * Math.sin(cameraOrientation.rotation.x)
            const deltaZ = 
                orientationChange.position.z * Math.cos(cameraOrientation.rotation.y) * Math.cos(cameraOrientation.rotation.x) - 
                orientationChange.position.x * Math.sin(cameraOrientation.rotation.y) * Math.cos(cameraOrientation.rotation.x) +
                orientationChange.position.y * Math.cos(cameraOrientation.rotation.y) * Math.sin(cameraOrientation.rotation.x)
            const deltaY = 
                orientationChange.position.y * Math.cos(cameraOrientation.rotation.x) -
                orientationChange.position.z * Math.sin(cameraOrientation.rotation.x)
            orientationChange.position = new Vector3(deltaX, deltaY, deltaZ);
            orientationChange.position = orientationChange.position.timesScalar(
                this.translateMultiplier * this.externalTranslateMultiplier
            );
            orientationChange.rotation = orientationChange.rotation.timesScalar(
                this.rotateMultiplier * this.externalRotateMultiplier
            );
            orientationChange.elevation *= this.translateMultiplier * this.externalTranslateMultiplier;
            this.__camera.move(orientationChange);
            this.__rerenderQueued = true;
        }
    }

    __render() {
        if (this.__rerenderQueued) {
            this.__rerenderQueued = false;
            this.__renderer.requestRender();
        }
    }
}
