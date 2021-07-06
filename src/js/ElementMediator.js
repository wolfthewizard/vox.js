class ElementMediator {

    constructor() {
        this.__canvas = document.getElementById("canvas");
        this.__objModelInput = document.getElementById("objModelInput");
        this.__swapYZButton = document.getElementById("swapYZButton");
        this.__modeSelect = document.getElementById("modeSelect");
        this.__resetPositionButton = document.getElementById("resetPositionButton");
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
}
