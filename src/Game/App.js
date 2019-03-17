import Canvas from './Canvas'

class App {
    constructor(id) {
        this.canvas = new Canvas(id);
        this.map = {
            tileWidth: 128,
            tileHeight: 64,
            cols: 4,
            grid: [
                [
                    1, 1, 1, 1,
                ],
                [
                    2, 2, 1, 1,
                ],
                [
                    2, 2, 1, 1,
                ],
                [
                    2, 2, 1, 1,
                ],
                [
                    2, 2, 1, 1,
                ],
                [
                    2, 2, 1, 1,
                ],
                [
                    2, 2, 1, 1,
                ]
            ],
            queue: 0
        };

        this.render();
    }
    
    render() {
        const rows = this.map.grid.length;

        for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
            this.renderColumnsFromRow(rowIndex)
        }
    }

    renderColumnsFromRow(rowIndex) {
        const row = this.map.grid[rowIndex];

        if (!row) {
            return;
        }

        const columns = row.length;

        for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
            this.renderTile(rowIndex, columnIndex);
        }
    }

    renderTile(rowIndex, columnIndex) {
        const tile = this.map.grid[rowIndex][columnIndex];

        if (!tile) {
            return;
        }

        const context = this.canvas.getContext();

        let x, y;

        y = (this.map.tileHeight / 2) * rowIndex;
        
        if (rowIndex % 2) {
            x = (this.map.tileWidth / 2) + (this.map.tileWidth * columnIndex);
        } else {
            x = this.map.tileWidth * columnIndex;
        }
        
        context.rect(x, y, this.map.tileWidth, this.map.tileHeight);

        context.stroke();
    }
}

export default App;