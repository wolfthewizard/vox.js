class ElementMediator {

    constructor() {
        this.__canvas = document.getElementById("canvas");
        this.__objModelInput = document.getElementById("objModelInput");
        this.__swapYZButton = document.getElementById("swapYZButton");
        this.__modeSelect = document.getElementById("modeSelect");
        this.__resetPositionButton = document.getElementById("resetPositionButton");
        this.__modelColorInput = document.getElementById("modelColorInput");
        this.__movementSpeedRange = document.getElementById("movementSpeedRange");
        this.__rotationSpeedRange = document.getElementById("rotationSpeedRange");
        this.__movementSpeedValue = document.getElementById("movementSpeedValue");
        this.__rotationSpeedValue = document.getElementById("rotationSpeedValue");
    }

    get canvas() {
        return this.__canvas;
    }

    get objModelInput() {
        return this.__objModelInput;
    }

    get swapYZButton() {
        return this.__swapYZButton;
    }

    get modeSelect() {
        return this.__modeSelect;
    }

    get resetPositionButton() {
        return this.__resetPositionButton;
    }

    get modelColorInput() {
        return this.__modelColorInput;
    }

    get movementSpeedRange() {
        return this.__movementSpeedRange;
    }

    get movementSpeedValue() {
        return this.__movementSpeedValue;
    }

    get rotationSpeedRange() {
        return this.__rotationSpeedRange;
    }

    get rotationSpeedValue() {
        return this.__rotationSpeedValue;
    }
}
