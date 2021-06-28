function sleep(length) {
    return new Promise(() => {
        setTimeout(length);
    });
}


class Coordinator {

    static MAX_FPS = 60;
    
    constructor(renderer, inputHandler) {
        this.__renderer = renderer;
        this.__inputHandler = inputHandler;
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

    __calculateFrame(deltaTime) {
        // todo
    }
}
