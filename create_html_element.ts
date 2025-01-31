/**
 * Every function must return an HTMLElement.
 * No write to the global variable is permitted.
 * Every call to document.createElement should live here.
 */

const BOX_SIZE = 70;
const MAX_PIECE_SIZE = BOX_SIZE - 1;
const PIECE_SIZE = 60;

function createPieceSizeImageOnBoardByPathAndXY(top: number, left: number, path: string, className: string): HTMLImageElement {
    let i = document.createElement("img");
    i.classList.add(className);
    i.style.top = `${top}px`;
    i.style.left = `${left}px`;
    i.src = `image/${path}.png`;
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}

function createPieceSizeImageOnBoardByPath(coord: Coord, path: string, className: string): HTMLImageElement {
    let [row_index, column_index] = coord;
    return createPieceSizeImageOnBoardByPathAndXY(
        1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        path,
        className
    );
}

function createPieceSizeImageOnBoardByPath_Shifted(coord: readonly [number, number], path: string, className: string): HTMLImageElement {
    let [row_index, column_index] = coord;
    return createPieceSizeImageOnBoardByPathAndXY(
        1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE),
        1 + column_index * BOX_SIZE,
        path,
        className
    );
}

function createCircleGuideImageAt(coord: Coord, path: string): HTMLImageElement {
    const [row_index, column_index] = coord;
    let img = document.createElement("img");
    img.classList.add("guide");
    img.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.src = `image/${path}.png`;
    img.width = MAX_PIECE_SIZE;
    img.height = MAX_PIECE_SIZE;
    img.style.cursor = "pointer";
    img.style.opacity = "0.3";
    return img;
}

function createCiurl(side: boolean, o: { left: number, top: number, rotateDeg: number }): HTMLImageElement {
    let img = document.createElement("img");
    img.src = `image/ciurl_${side}.png`;
    img.width = 150;
    img.height = 15;
    img.classList.add("ciurl");
    img.style.left = `${o.left}px`;
    img.style.top = `${o.top}px`;
    img.style.zIndex = "300";
    img.style.transform = `rotate(${o.rotateDeg}deg)`;
    img.style.position = "absolute";
    return img;
}

