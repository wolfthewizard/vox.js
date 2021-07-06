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

        this.__rerenderQueued = true;

        this.rotateMultiplier = Coordinator.rotateMultiplier;
        this.translateMultiplier = Coordinator.translateMultiplier;
    }

    async run() {
        const minDelay = 1000 / Coordinator.MAX_FPS;
        let previousUpdateTime = Date.now() - minDelay;
        while (true) {
            const startTime = Date.now();
            const deltaTime = startTime - previousUpdateTime;
            previousUpdateTime = startTime;

            this.__calculateFrame(deltaTime);

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
            orientationChange.position = orientationChange.position.timesScalar(
                this.translateMultiplier
            );
            orientationChange.rotation = orientationChange.rotation.timesScalar(
                this.rotateMultiplier
            );
            orientationChange.elevation *= this.translateMultiplier;
            this.__camera.move(orientationChange);
            this.__rerenderQueued = true;

            console.log(this.__camera.__orientationInfo.elevation);
        }
    }

    __render() {
        if (this.__rerenderQueued) {
            this.__rerenderQueued = false;
            this.__renderer.requestRender();
        }
    }
}
