class ElementMediator {

    constructor() {
        this.__canvas = document.getElementById("canvas");
        this.__objModelInput = document.getElementById("objModelInput");
        this.__swapYZButton = document.getElementById("swapYZButton");
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
}
