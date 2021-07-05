class InputHandler {

    static ignoredKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
    ];
    
    constructor() {
        this.pressedKeys = {
            "ArrowUp": false,
            "ArrowDown": false,
            "ArrowLeft": false,
            "ArrowRight": false,
            "w": false,
            "s": false,
            "a": false,
            "d": false,
            "q": false,
            "e": false,
            "+": false,
            "-": false
        };
    }

    prepareHandling() {
        window.addEventListener("keydown", (e) => {
            if (InputHandler.ignoredKeys.includes(e.key.toString())) {
                e.preventDefault();
            }
            this.pressedKeys[e.key] = true;
        });

        window.addEventListener("keyup", (e) => {
            this.pressedKeys[e.key] = false;
        });
    }

    get axes() {
        return new Orientation(
            new Vector3(
                this.pressedKeys["d"] - this.pressedKeys["a"],
                this.pressedKeys["e"] - this.pressedKeys["q"],
                this.pressedKeys["w"] - this.pressedKeys["s"]
            ),
            new Vector3(
                this.pressedKeys["ArrowUp"] - this.pressedKeys["ArrowDown"],
                this.pressedKeys["ArrowLeft"] - this.pressedKeys["ArrowRight"],
                0
            ),
            this.pressedKeys["+"] ? 1 : 0 + this.pressedKeys["-"] ? -1 : 0
        );
    }
}
