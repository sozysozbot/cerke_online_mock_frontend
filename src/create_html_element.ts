/**
 * Every function must return an HTMLElement.
 * No write to the global variable is permitted.
 * Every call to document.createElement should live here.
 */

import { Coord, Piece } from "cerke_online_utility/lib";
import { toPath_ } from "./type__piece";
import {
  BOX_SIZE,
  PIECE_SIZE,
  MAX_PIECE_SIZE,
  coordToPieceXY,
  coordToPieceXY_Shifted,
  indToHop1Zuo1Horizontal,
} from "./html_top_left";

export function createArrowPiece(
  path: string,
  coord: readonly [number, number],
) {
  const [row_index, column_index] = coord;
  const top = 1 + row_index * BOX_SIZE + 159.5;
  const left = column_index * BOX_SIZE + 19.25;
  const i = document.createElement("img");
  i.classList.add("selection");
  i.style.top = `${top}px`;
  i.style.left = `${left}px`;
  i.src = `image/${path}.png`;
  i.width = 140;
  i.height = 140;
  return i;
}

export function createPieceSizeImageOnBoardByPathAndXY(
  top: number,
  left: number,
  path: string,
  className: string,
): HTMLImageElement {
  const i = document.createElement("img");
  i.setAttribute("draggable", "false");
  i.classList.add(className);
  i.style.top = `${top}px`;
  i.style.left = `${left}px`;
  i.src = `image/${path}.png`;
  i.width = PIECE_SIZE;
  i.height = PIECE_SIZE;
  return i;
}

export function createPieceSizeImageOnBoardByPath(
  coord: Coord,
  path: string,
  className: string,
): HTMLImageElement {
  const { top, left } = coordToPieceXY(coord);
  return createPieceSizeImageOnBoardByPathAndXY(top, left, path, className);
}

export function createCancelButton(): HTMLImageElement {
  return createPieceSizeImageOnBoardByPathAndXY(
    1 + 9 * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE),
    1 + 7.5 * BOX_SIZE,
    "piece/bmun",
    "piece_image_on_board",
  );
}

export function createPieceSizeImageOnBoardByPath_Shifted(
  coord: Coord,
  path: string,
  className: string,
): HTMLImageElement {
  const { top, left } = coordToPieceXY_Shifted(coord);
  return createPieceSizeImageOnBoardByPathAndXY(top, left, path, className);
}

export function createPieceSizeSelectionButtonOnBoard_Shifted(coord: Coord) {
  const centralNode = createPieceSizeImageOnBoardByPath_Shifted(
    coord,
    "selection2",
    "selection",
  );
  centralNode.style.cursor = "pointer";
  centralNode.style.zIndex = "200";
  return centralNode;
}

export function createCircleGuideImageAt(
  coord: Coord,
  path: string,
): HTMLImageElement {
  const [row_index, column_index] = coord;
  const img = document.createElement("img");
  img.setAttribute("draggable", "false");
  img.classList.add("guide");
  img.style.top = `${1 +
    row_index * BOX_SIZE +
    (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
  img.style.left = `${1 +
    column_index * BOX_SIZE +
    (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
  img.src = `image/${path}.png`;
  img.width = MAX_PIECE_SIZE;
  img.height = MAX_PIECE_SIZE;
  img.style.cursor = "pointer";
  img.style.opacity = "0.3";
  return img;
}

export function createCiurl(
  side: boolean,
  o: { left: number; top: number; rotateDeg: number },
): HTMLImageElement {
  const img = document.createElement("img");
  img.setAttribute("draggable", "false");
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

export function createPieceImgToBePlacedOnHop1zuo1(
  ind: number,
  path: string,
): HTMLImageElement {
  return createPieceSizeImageOnBoardByPathAndXY(
    1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
    indToHop1Zuo1Horizontal(ind),
    path,
    "piece_image_on_hop1zuo1",
  );
}

export function createPieceImgToBePlacedOnBoard(
  coord: Coord,
  piece: Piece,
): HTMLImageElement {
  return createPieceSizeImageOnBoardByPath(
    coord,
    toPath_(piece),
    "piece_image_on_board",
  );
}

export function createImageButton(
  img_name: String,
  top: number,
): HTMLInputElement {
  const node = document.createElement("input");
  node.setAttribute("type", "image");
  node.src = `image/${img_name}.png`;
  node.height = 200;
  node.style.backgroundColor = "#e0e0e0";
  node.style.position = "absolute";
  node.style.left = "660px";
  node.style.top = `${top}px`;
  node.style.border = "1px solid #aaaaaa";
  return node;
}
