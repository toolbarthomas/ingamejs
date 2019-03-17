class Canvas {
    constructor(id) {
        this.id = id;
    }

    getContext() {
        const id = this.id;

        if (!id) {
            return;
        }

        const node = document.getElementById(id);

        if (!node) {
            return;
        }

        return node.getContext('2d');
    }
};

export default Canvas;