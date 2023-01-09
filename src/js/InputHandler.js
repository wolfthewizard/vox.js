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
            "i": false,
            "j": false,
            "k": false,
            "l": false,
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
        const tAxis1 = new Vector3(
            this.pressedKeys["d"] - this.pressedKeys["a"],
            this.pressedKeys["e"] - this.pressedKeys["q"],
            -(this.pressedKeys["w"] - this.pressedKeys["s"])
        );
        const dAxis1 = new Vector3(
            this.pressedKeys["ArrowUp"] - this.pressedKeys["ArrowDown"],
            this.pressedKeys["ArrowLeft"] - this.pressedKeys["ArrowRight"],
            0
        );
        const dAxis2 = new Vector3(
            this.pressedKeys["i"] - this.pressedKeys["k"],
            this.pressedKeys["j"] - this.pressedKeys["l"],
            0
        );
        const sAxis1 = this.pressedKeys["+"] ? -1 : 0 + this.pressedKeys["-"] ? 1 : 0
        const inputAxes = new InputAxes(tAxis1, dAxis1, dAxis2, sAxis1);
        return inputAxes;
    }
}
