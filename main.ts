type Hop1Zuo1 = NonTam2Piece[];

type Field = {
    currentBoard: Board,
    hop1zuo1OfUpward: NonTam2PieceUpward[],
    hop1zuo1OfDownward: NonTam2PieceDownward[],
}

type GAME_STATE = {
    f: Field,
    IA_is_down: boolean,
    tam_itself_is_tam_hue: boolean,
    backupDuringStepping: null | [Coord, Piece]
};

let GAME_STATE: GAME_STATE = {
    f: {
        currentBoard: [
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"]
        ] as Board,
        hop1zuo1OfDownward: [],
        hop1zuo1OfUpward: [],
    },
    IA_is_down: true,
    tam_itself_is_tam_hue: true,
    backupDuringStepping: null
}

type UI_STATE = {
    selectedCoord: null | Coord | ["Hop1zuo1", number];
};

let UI_STATE: UI_STATE = {
    selectedCoord: null
};

function eraseGuide(): void {
    removeChildren(document.getElementById("contains_guides")!);
    removeChildren(document.getElementById("contains_guides_on_upward")!);
}

function toAbsoluteCoord_([row, col]: Coord, IA_is_down: boolean): AbsoluteCoord {
    return [
        [
            AbsoluteRow.A, AbsoluteRow.E, AbsoluteRow.I,
            AbsoluteRow.U, AbsoluteRow.O, AbsoluteRow.Y,
            AbsoluteRow.AI, AbsoluteRow.AU, AbsoluteRow.IA
        ][IA_is_down ? row : 8 - row],
        [
            AbsoluteColumn.K, AbsoluteColumn.L, AbsoluteColumn.N,
            AbsoluteColumn.T, AbsoluteColumn.Z, AbsoluteColumn.X,
            AbsoluteColumn.C, AbsoluteColumn.M, AbsoluteColumn.P
        ][IA_is_down ? col : 8 - col]
    ];
}

function fromAbsoluteCoord_([absrow, abscol]: AbsoluteCoord, IA_is_down: boolean): Coord {
    let rowind: BoardIndex;

    if (absrow === AbsoluteRow.A) { rowind = 0; }
    else if (absrow === AbsoluteRow.E) { rowind = 1; }
    else if (absrow === AbsoluteRow.I) { rowind = 2; }
    else if (absrow === AbsoluteRow.U) { rowind = 3; }
    else if (absrow === AbsoluteRow.O) { rowind = 4; }
    else if (absrow === AbsoluteRow.Y) { rowind = 5; }
    else if (absrow === AbsoluteRow.AI) { rowind = 6; }
    else if (absrow === AbsoluteRow.AU) { rowind = 7; }
    else if (absrow === AbsoluteRow.IA) { rowind = 8; }
    else {
        let _should_not_reach_here: never = absrow;
        throw new Error("does not happen");
    }

    let colind: BoardIndex;

    if (abscol === AbsoluteColumn.K) { colind = 0; }
    else if (abscol === AbsoluteColumn.L) { colind = 1; }
    else if (abscol === AbsoluteColumn.N) { colind = 2; }
    else if (abscol === AbsoluteColumn.T) { colind = 3; }
    else if (abscol === AbsoluteColumn.Z) { colind = 4; }
    else if (abscol === AbsoluteColumn.X) { colind = 5; }
    else if (abscol === AbsoluteColumn.C) { colind = 6; }
    else if (abscol === AbsoluteColumn.M) { colind = 7; }
    else if (abscol === AbsoluteColumn.P) { colind = 8; }
    else {
        let _should_not_reach_here: never = abscol;
        throw new Error("does not happen");
    }

    if (IA_is_down) {
        return [rowind, colind];
    } else {
        return [8 - rowind as BoardIndex, 8 - colind as BoardIndex];
    }
}

function toAbsoluteCoord(coord: Coord): AbsoluteCoord {
    return toAbsoluteCoord_(coord, GAME_STATE.IA_is_down)
}

function fromAbsoluteCoord(abs: AbsoluteCoord): Coord {
    return fromAbsoluteCoord_(abs, GAME_STATE.IA_is_down);
}

function erasePhantom() {
    let contains_phantom = document.getElementById("contains_phantom")!;
    while (contains_phantom.firstChild) {
        contains_phantom.removeChild(contains_phantom.firstChild);
    }
}

function cancelStepping() {
    eraseGuide();
    erasePhantom();
    document.getElementById("protective_cover_over_field")!.classList.add("nocover");

    // resurrect the original one
    const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;
    const from: Coord = backup[0];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = backup[1];
    GAME_STATE.backupDuringStepping = null;

    UI_STATE.selectedCoord = null;

    // draw
    drawField(GAME_STATE.f);
}


function getThingsGoingAfterSecondTamMoveThatStepsInTheLatterHalf(theVerySrc: Coord, firstDest: Coord, stepsOn: Coord) {
    eraseGuide();
    document.getElementById("protective_cover_over_field")!.classList.remove("nocover");
    document.getElementById("protective_tam_cover_over_field")!.classList.remove("nocover");

    // delete the original one
    GAME_STATE.backupDuringStepping = [firstDest, "Tam2"];
    GAME_STATE.f.currentBoard[firstDest[0]][firstDest[1]] = null;

    document.getElementById("cancelButton")!.remove();

    // draw
    drawField(GAME_STATE.f);
    drawPhantomAt(firstDest, "Tam2");
    drawCancel(function () {
        eraseGuide();
        erasePhantom();
        document.getElementById("protective_cover_over_field")!.classList.add("nocover");
        document.getElementById("protective_tam_cover_over_field")!.classList.add("nocover");

        // resurrect the original one
        GAME_STATE.f.currentBoard[theVerySrc[0]][theVerySrc[1]] = "Tam2";
        GAME_STATE.backupDuringStepping = null;

        UI_STATE.selectedCoord = null;

        // draw
        drawField(GAME_STATE.f);
    });
    drawHoverAt_<"Tam2">(stepsOn, "Tam2", function (coord: Coord, piece: "Tam2") {
        const contains_guides = document.getElementById("contains_guides")!;

        let centralNode = createPieceSizeImageOnBoardByPath_Shifted(coord, "selection2", "selection");

        centralNode.style.cursor = "pointer";

        centralNode.style.zIndex = "200";
        contains_guides.appendChild(centralNode);

        const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
            coord,
            piece,
            GAME_STATE.f.currentBoard,
            GAME_STATE.tam_itself_is_tam_hue);

        if (guideListGreen.length > 0) { throw new Error("should not happen"); }

        for (let ind = 0; ind < guideListYellow.length; ind++) {
            const [i, j] = guideListYellow[ind];
            const destPiece = GAME_STATE.f.currentBoard[i][j];

            // cannot step twice
            if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
                continue;
            }

            let img = createCircleGuideImageAt(guideListYellow[ind], "ctam");

            img.addEventListener('click', function () {
                const message: NormalMove = {
                    type: "TamMove",
                    stepStyle: "StepsDuringLatter",
                    src: toAbsoluteCoord(theVerySrc),
                    firstDest: toAbsoluteCoord(firstDest),
                    secondDest: toAbsoluteCoord(guideListYellow[ind])
                }

                sendNormalMessage(message);

                eraseGuide();
                erasePhantom();
                document.getElementById("protective_cover_over_field")!.classList.add("nocover");
                document.getElementById("protective_tam_cover_over_field")!.classList.add("nocover");
                return;
            });

            img.style.zIndex = "200";
            contains_guides.appendChild(img);
        }

        return;
    });
    return;
}

function afterFirstTamMove(from: Coord, to: Coord, hasAlreadyStepped: boolean) {
    eraseGuide();
    document.getElementById("protective_tam_cover_over_field")!.classList.remove("nocover");

    // stepping should now have been completed
    document.getElementById("protective_cover_over_field")!.classList.add("nocover");

    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;
    GAME_STATE.f.currentBoard[to[0]][to[1]] = "Tam2";
    drawField(GAME_STATE.f);

    const drawTam2HoverNonshiftedAt = function (coord: Coord) {
        let contains_phantom = document.getElementById("contains_phantom")!;

        let img = createPieceSizeImageOnBoardByPath(
            coord,
            toPath_("Tam2"),
            "piece_image_on_board"
        );

        img.style.zIndex = "100";
        img.style.cursor = "pointer";

        const selectTam2Hover = function () {
            const contains_guides = document.getElementById("contains_guides")!;

            let centralNode = createPieceSizeImageOnBoardByPath(coord, "selection2", "selection");

            centralNode.style.cursor = "pointer";

            centralNode.style.zIndex = "200";
            contains_guides.appendChild(centralNode);

            const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
                coord,
                "Tam2",
                GAME_STATE.f.currentBoard,
                GAME_STATE.tam_itself_is_tam_hue);

            if (guideListGreen.length > 0) { throw new Error("should not happen"); }

            for (let ind = 0; ind < guideListYellow.length; ind++) {
                const [i, j] = guideListYellow[ind];
                const destPiece = GAME_STATE.f.currentBoard[i][j];

                // cannot step twice
                if (hasAlreadyStepped && destPiece !== null) {
                    continue;
                }

                let img = createCircleGuideImageAt(guideListYellow[ind], "ctam");

                if (destPiece === null) {
                    img.addEventListener('click', function () {
                        (function getThingsGoingAfterSecondTamMoveThatDoesNotStepInTheLatterHalf(theVerySrc: Coord, firstDest: Coord, to: Coord, hasAlreadyStepped: boolean) {
                            console.assert(GAME_STATE.f.currentBoard[to[0]][to[1]] == null);

                            let message: NormalMove = {
                                type: "TamMove",
                                stepStyle: hasAlreadyStepped ? 'StepsDuringFormer' : 'NoStep',
                                src: toAbsoluteCoord(theVerySrc),
                                firstDest: toAbsoluteCoord(firstDest),
                                secondDest: toAbsoluteCoord(to)
                            };

                            sendNormalMessage(message);

                            document.getElementById("protective_tam_cover_over_field")!.classList.add("nocover");
                            erasePhantom();
                            document.getElementById("cancelButton")!.remove(); // destroy the cancel button, since it can no longer be cancelled
                            eraseGuide(); // this removes the central guide, as well as the yellow and green ones

                            return;
                        })(from, coord, guideListYellow[ind], hasAlreadyStepped);
                    });
                } else {
                    img.addEventListener('click', function () {
                        getThingsGoingAfterSecondTamMoveThatStepsInTheLatterHalf(from, coord, guideListYellow[ind]);
                    });
                }

                img.style.zIndex = "200";
                contains_guides.appendChild(img);
            }

        }

        img.addEventListener('click', selectTam2Hover);
        contains_phantom.appendChild(img);

        // draw as already selected
        selectTam2Hover();
    }

    drawPhantomAt(from, "Tam2");
    drawCancel(function cancelTam2FirstMove() {
        eraseGuide();
        erasePhantom();
        document.getElementById("protective_tam_cover_over_field")!.classList.add("nocover");
        document.getElementById("protective_cover_over_field")!.classList.add("nocover");

        // resurrect the original one
        GAME_STATE.f.currentBoard[to[0]][to[1]] = null;
        GAME_STATE.f.currentBoard[from[0]][from[1]] = "Tam2";

        UI_STATE.selectedCoord = null;

        // draw
        drawField(GAME_STATE.f);
    });
    drawTam2HoverNonshiftedAt(to);
}

function drawPhantomAt(coord: Coord, piece: Piece) {
    let contains_phantom = document.getElementById("contains_phantom")!;
    erasePhantom();

    const phantom: HTMLImageElement = createPieceImgToBePlacedOnBoard(coord, piece);
    phantom.style.opacity = "0.1";
    contains_phantom.appendChild(phantom);
}

function drawCancel(fn: () => void) {
    let contains_phantom = document.getElementById("contains_phantom")!;

    let cancelButton = createPieceSizeImageOnBoardByPath_Shifted([9, 7.5], "piece/bmun", "piece_image_on_board");
    cancelButton.width = 80;
    cancelButton.height = 80;

    cancelButton.style.zIndex = "100";
    cancelButton.style.cursor = "pointer";
    cancelButton.setAttribute('id', 'cancelButton');

    cancelButton.addEventListener('click', fn);
    contains_phantom.appendChild(cancelButton);
}

function drawHoverAt_<T extends "Tam2" | NonTam2PieceUpward>(coord: Coord, piece: T,
    selectHover_: (coord: Coord, piece: T) => void) {
    let contains_phantom = document.getElementById("contains_phantom")!;

    let img = createPieceSizeImageOnBoardByPath_Shifted(
        coord,
        toPath_(piece),
        "piece_image_on_board"
    );

    img.style.zIndex = "100";
    img.style.cursor = "pointer";

    const selectHover = function () {
        selectHover_(coord, piece);
    }

    img.addEventListener('click', selectHover);
    contains_phantom.appendChild(img);

    // draw as already selected
    selectHover();
}

function stepping(from: Coord, piece: "Tam2" | NonTam2PieceUpward, to: Coord) {
    eraseGuide();
    document.getElementById("protective_cover_over_field")!.classList.remove("nocover");

    // delete the original one
    GAME_STATE.backupDuringStepping = [from, piece];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;

    // draw
    drawField(GAME_STATE.f);
    drawPhantomAt(from, piece);
    drawCancel(cancelStepping);
    drawHoverAt_(to, piece, function (coord: Coord, piece: "Tam2" | NonTam2PieceUpward) {
        const contains_guides = document.getElementById("contains_guides")!;

        let centralNode = createPieceSizeImageOnBoardByPath_Shifted(coord, "selection2", "selection");

        centralNode.style.cursor = "pointer";

        centralNode.style.zIndex = "200";
        contains_guides.appendChild(centralNode);

        const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
            coord,
            piece,
            GAME_STATE.f.currentBoard,
            GAME_STATE.tam_itself_is_tam_hue);

        display_guide_after_stepping(coord, { piece: piece, path: "ct" }, contains_guides, guideListYellow);

        if (piece === "Tam2") {
            if (guideListGreen.length > 0) { throw new Error("should not happen"); }
            return;
        }
        display_guide_after_stepping(coord, { piece: piece, path: "ct2" }, contains_guides, guideListGreen);
    });
}

async function sendAfterHalfAcceptance(message: AfterHalfAcceptance, src: Coord, step: Coord) {
    const res: Ret_AfterHalfAcceptance =
        await sendStuff<AfterHalfAcceptance, Ret_AfterHalfAcceptance>(
            "`after half acceptance`",
            message,
            response => {
                console.log('Success; the server returned:', JSON.stringify(response));
                return response;
            }
        );

    if (!res.legal) {
        alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
        throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
    }

    // no water entry
    if (!res.dat.waterEntryHappened) {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateFieldAfterHalfAcceptance(message, src, step);
        drawField(GAME_STATE.f);
        return;
    }

    await displayWaterEntryLogo();
    displayCiurl(res.dat.ciurl);
    await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));

    if (res.dat.ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        eraseGuide();
        UI_STATE.selectedCoord = null;

        cancelStepping();
        // now it's opponent's turn
    } else {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateFieldAfterHalfAcceptance(message, src, step);
        drawField(GAME_STATE.f);
    }
}

async function sendStuff<T, U>(log: string, message: T, validateInput: (response: any) => U): Promise<U> {
    console.log(`Sending ${log}:`, JSON.stringify(message));
    let url = 'https://serene-reef-96808.herokuapp.com/';
    const data = {
        "id": (Math.random() * 100000) | 0,
        "message": message
    };

    const res: void | U = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .then(validateInput)
        .catch(error => console.error('Error:', error));

    console.log(res);

    if (!res) {
        alert("network error!");
        throw new Error("network error!");
    }
    return res;
}

async function sendNormalMessage(message: NormalMove) {
    const res: Ret_NormalMove = await sendStuff<NormalMove, Ret_NormalMove>("normal move", message, response => {
        console.log('Success; the server returned:', JSON.stringify(response));
        return response;
    });

    if (!res.legal) {
        alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
        throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
    }

    // no water entry
    if (!res.dat.waterEntryHappened) {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateField(message);
        drawField(GAME_STATE.f);
        return;
    }

    await displayWaterEntryLogo();
    displayCiurl(res.dat.ciurl);
    await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));

    if (res.dat.ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        eraseGuide();
        UI_STATE.selectedCoord = null;

        if (message.type === "NonTamMove" && message.data.type === "SrcStepDstFinite") {
            cancelStepping();
            // FIXME: implement handing over the turn
        }
    } else {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateField(message);
        drawField(GAME_STATE.f);
    }
}

function updateFieldAfterHalfAcceptance(message: AfterHalfAcceptance, src: Coord, step: Coord) {
    if (message.dest === null) {
        cancelStepping();
        return;
    }

    let [dest_i, dest_j] = fromAbsoluteCoord(message.dest);

    // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.
    const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;
    let piece: Piece = backup[1];

    cancelStepping();   // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]

    const [src_i, src_j] = src;
    const [step_i, step_j] = step;
    if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
        throw new Error("step is unoccupied");
    }

    let destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

    /* it's possible that you are returning to the original position, in which case you don't do anything */
    if (coordEq([src_i, src_j], [dest_i, dest_j])) {
        return;
    }

    if (destPiece !== null) {
        if (destPiece === "Tam2") {
            throw new Error("dest is occupied by Tam2");
        } else if (destPiece.side === Side.Upward) {
            throw new Error("dest is occupied by an ally");
        } else if (destPiece.side === Side.Downward) {
            const flipped: NonTam2PieceUpward = {
                color: destPiece.color,
                prof: destPiece.prof,
                side: Side.Upward
            }
            GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
        } else {
            let _should_not_reach_here: never = destPiece.side;
            throw new Error("should not reach here");
        }
    }

    GAME_STATE.f.currentBoard[src_i][src_j] = null;
    GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
}

function updateField(message: NormalMove) {
    if (message.type === "NonTamMove") {
        if (message.data.type === "FromHand") {
            const k: {
                type: 'FromHand';
                color: Color;
                prof: Profession;
                dest: AbsoluteCoord;
            } = message.data;

            // remove the corresponding one from hand
            const ind = GAME_STATE.f.hop1zuo1OfUpward.findIndex(
                piece => piece.color === k.color && piece.prof === k.prof
            );
            if (ind === -1) {
                throw new Error("What should exist in the hand does not exist");
            }
            const [removed] = GAME_STATE.f.hop1zuo1OfUpward.splice(ind, 1);

            // add the removed piece to the destination
            const [i, j] = fromAbsoluteCoord(k.dest);
            if (GAME_STATE.f.currentBoard[i][j] !== null) {
                throw new Error("Trying to parachute the piece onto an occupied space");
            }

            GAME_STATE.f.currentBoard[i][j] = removed;

        } else if (message.data.type === "SrcDst") {
            const k: {
                type: 'SrcDst';
                src: AbsoluteCoord;
                dest: AbsoluteCoord;
            } = message.data;

            const [src_i, src_j] = fromAbsoluteCoord(k.src);
            const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);

            let piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j]
            if (piece === null) {
                throw new Error("src is unoccupied");
            }

            let destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

            /* it's NOT possible that you are returning to the original position, in which case you don't do anything */

            if (destPiece !== null) {
                if (destPiece === "Tam2") {
                    throw new Error("dest is occupied by Tam2");
                } else if (destPiece.side === Side.Upward) {
                    throw new Error("dest is occupied by an ally");
                } else if (destPiece.side === Side.Downward) {
                    const flipped: NonTam2PieceUpward = {
                        color: destPiece.color,
                        prof: destPiece.prof,
                        side: Side.Upward
                    }
                    GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
                } else {
                    let _should_not_reach_here: never = destPiece.side;
                    throw new Error("should not reach here");
                }
            }

            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        } else if (message.data.type === "SrcStepDstFinite") {
            const k: {
                type: 'SrcStepDstFinite';
                src: AbsoluteCoord;
                step: AbsoluteCoord;
                dest: AbsoluteCoord;
            } = message.data;

            const [src_i, src_j] = fromAbsoluteCoord(k.src);
            const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);

            // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.

            const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;

            let piece: Piece = backup[1];

            cancelStepping();

            // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]

            const [step_i, step_j] = fromAbsoluteCoord(k.step);
            if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
                throw new Error("step is unoccupied");
            }

            let destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

            /* it's possible that you are returning to the original position, in which case you don't do anything */
            if (coordEq([src_i, src_j], [dest_i, dest_j])) {
                return;
            }

            if (destPiece !== null) {
                if (destPiece === "Tam2") {
                    throw new Error("dest is occupied by Tam2");
                } else if (destPiece.side === Side.Upward) {
                    throw new Error("dest is occupied by an ally");
                } else if (destPiece.side === Side.Downward) {
                    const flipped: NonTam2PieceUpward = {
                        color: destPiece.color,
                        prof: destPiece.prof,
                        side: Side.Upward
                    }
                    GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
                } else {
                    let _should_not_reach_here: never = destPiece.side;
                    throw new Error("should not reach here");
                }
            }

            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;

        } else {
            let _should_not_reach_here: never = message.data;
        }

    } else if (message.type === "TamMove") {
        const k = message;
        const [firstDest_i, firstDest_j] = fromAbsoluteCoord(k.firstDest);
        const [secondDest_i, secondDest_j] = fromAbsoluteCoord(k.secondDest);
        if (message.stepStyle === "StepsDuringLatter") {
            // We decided that Tam2 should not be present on the board if it is StepsDuringLatter
            GAME_STATE.f.currentBoard[secondDest_i][secondDest_j] = "Tam2";
            return;
        }

        // If not StepsDuringLatter, we decided that the piece should actually be located in firstDest after the first move
        let piece: Piece | null = GAME_STATE.f.currentBoard[firstDest_i][firstDest_j]
        if (piece === null) {
            throw new Error("firstDest is unoccupied");
        }

        if (piece !== "Tam2") {
            throw new Error("TamMove but not Tam2");
        }

        /* it's possible that you are returning to the original position, in which case you don't do anything */
        if (coordEq([firstDest_i, firstDest_j], [secondDest_i, secondDest_j])) {
            return;
        }

        GAME_STATE.f.currentBoard[firstDest_i][firstDest_j] = null;
        GAME_STATE.f.currentBoard[secondDest_i][secondDest_j] = piece;
    } else {
        let _should_not_reach_here: never = message;
    }
}

/* Intentionally does not verify whether the piece itself is downward */
function isProtectedByDownwardTamHueAUai(coord: Coord): boolean {
    return eightNeighborhood(coord).filter(([a, b]) => {
        let piece = GAME_STATE.f.currentBoard[a][b];
        if (piece == null) { return false; }
        if (piece === "Tam2") { return false; }
        return piece.prof === Profession.Uai1 && piece.side === Side.Downward
    }).length > 0;
}

function getThingsGoing(piece: "Tam2" | NonTam2PieceUpward, from: Coord, to: Coord) {
    let destPiece: "Tam2" | null | NonTam2Piece = GAME_STATE.f.currentBoard[to[0]][to[1]];

    if (destPiece == null) { // dest is empty square; try to simply move
        let message: NormalMove;

        if (piece !== "Tam2") {
            let abs_src: AbsoluteCoord = toAbsoluteCoord(from);
            let abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
            message = {
                type: "NonTamMove",
                data: {
                    type: "SrcDst",
                    src: abs_src,
                    dest: abs_dst
                }
            };

            sendNormalMessage(message);
            return;
        } else {
            afterFirstTamMove(from, to, false);
            return;
        }
    }

    if (destPiece === "Tam2" || destPiece.side === Side.Upward || piece === "Tam2"
        || isProtectedByDownwardTamHueAUai(to)) { // can step, but cannot take
        stepping(from, piece, to);
        return;
    }

    if (confirm(DICTIONARY.ja.whetherToTake)) {
        let abs_src: AbsoluteCoord = toAbsoluteCoord(from);
        let abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
        let message: NormalNonTamMove = {
            type: "NonTamMove",
            data: {
                type: "SrcDst",
                src: abs_src,
                dest: abs_dst
            }
        }

        sendNormalMessage(message);
        return;
    } else {
        stepping(from, piece, to);
        return;
    }
}

function getThingsGoingAfterStepping_Finite(src: Coord, step: Coord, piece: Piece, dest: Coord) {
    if (piece === "Tam2") {
        afterFirstTamMove(src, dest, true);
        return;
    }

    const message: NormalNonTamMove = {
        type: "NonTamMove",
        data: {
            type: "SrcStepDstFinite",
            step: toAbsoluteCoord(step),
            dest: toAbsoluteCoord(dest),
            src: toAbsoluteCoord(src)
        }
    }

    sendNormalMessage(message);
    return;
}

async function sendInfAfterStep(message: InfAfterStep) {
    const res = await sendStuff<InfAfterStep, Ret_InfAfterStep>(
        "inf after step",
        message,
        response => {
            console.log('Success; the server returned:', JSON.stringify(response));
            return response;
        }
    );

    if (!res.legal) {
        alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
        throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
    }

    displayCiurl(res.ciurl);

    document.getElementById("cancelButton")!.remove(); // destroy the cancel button, since it can no longer be cancelled

    eraseGuide(); // this removes the central guide, as well as the yellow and green ones

    let step: Coord = fromAbsoluteCoord(message.step);
    let plannedDirection: Coord = fromAbsoluteCoord(message.plannedDirection);
    // recreate the selection node, but this time it is not clickable and hence not deletable
    let centralNode = createPieceSizeImageOnBoardByPath_Shifted(step, "selection2", "selection");
    centralNode.style.zIndex = "200";

    const contains_guides = document.getElementById("contains_guides")!;
    contains_guides.appendChild(centralNode);

    const piece: NonTam2PieceUpward = {
        color: message.color,
        prof: message.prof,
        side: Side.Upward
    };

    // now re-add the green candidates in only one direction
    const { infinite: guideListGreen } = calculateMovablePositions(
        step,
        piece,
        GAME_STATE.f.currentBoard,
        GAME_STATE.tam_itself_is_tam_hue);

    // filter the result
    const filteredList = guideListGreen.filter(function (c: Coord) {
        const subtractStep = function ([x, y]: Coord): [number, number] {
            const [step_x, step_y] = step;
            return [x - step_x, y - step_y];
        }

        const limit: number = res.ciurl.filter(x => x).length;

        const [deltaC_x, deltaC_y] = subtractStep(c);
        const [deltaPlan_x, deltaPlan_y] = subtractStep(plannedDirection);

        return (
            // 1. (c - step) crossed with (plannedDirection - step) gives zero
            deltaC_x * deltaPlan_y - deltaPlan_x * deltaC_y === 0 &&

            // 2.  (c - step) dotted with (plannedDirection - step) gives positive
            deltaC_x * deltaPlan_x + deltaC_y * deltaPlan_y > 0 &&

            // 3. deltaC must not exceed the limit enforced by ciurl
            Math.max(Math.abs(deltaC_x), Math.abs(deltaC_y)) <= limit
        );
    });

    const src: Coord = fromAbsoluteCoord(message.src);

    let passer = createCircleGuideImageAt(src, "ct");
    passer.addEventListener('click', function (ev) {
        sendAfterHalfAcceptance({
            type: "AfterHalfAcceptance",
            dest: null
        }, src, step);
    });
    passer.style.zIndex = "200";
    contains_guides.appendChild(passer);

    for (let ind = 0; ind < filteredList.length; ind++) {
        const [i, j] = filteredList[ind];
        if (coordEq(src, [i, j])) {
            continue; // yellow takes precedence over green
        }
        const destPiece = GAME_STATE.f.currentBoard[i][j];

        // cannot step twice
        if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
            continue;
        }

        let img = createCircleGuideImageAt(filteredList[ind], "ct2");

        img.addEventListener('click', function (ev) {
            sendAfterHalfAcceptance({
                type: "AfterHalfAcceptance",
                dest: [i, j]
            }, src, step);
        });

        img.style.zIndex = "200";
        contains_guides.appendChild(img);
    }
}

async function displayWaterEntryLogo() {
    const water_entry_logo = document.getElementById("water_entry_logo")!;
    water_entry_logo.style.display = "block";
    water_entry_logo.classList.add("water_entry");
    const protective_cover_over_field = document.getElementById("protective_cover_over_field")!;
    protective_cover_over_field.classList.remove("nocover");
    protective_cover_over_field.style.backgroundColor = "rgba(0, 0, 0, 0)";

    setTimeout(function () {
        water_entry_logo.style.display = "none";
        protective_cover_over_field.classList.add("nocover");
        protective_cover_over_field.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }, 1200 * 0.8093);
    await new Promise(resolve => setTimeout(resolve, 1000 * 0.8093));
}

function displayCiurl(ciurl: Ciurl) {
    // copied and pasted from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
    // Standard Normal variate using Box-Muller transform.
    const randn_bm = function (): number {
        var u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    const contains_ciurl = document.getElementById("contains_ciurl")!;

    clearCiurl();

    // should always lie around 300 ~ 370, when BOX_SIZE is 70
    const averageLeft = BOX_SIZE * (335 / 70 + randn_bm() / 6);
    const hop1zuo1_height = 140;
    const board_height = 631;
    const averageTop = 84 + hop1zuo1_height + board_height;

    let imgs: HTMLImageElement[] = ciurl.map((side, ind) => createCiurl(side, {
        left: averageLeft + BOX_SIZE * 0.2 * randn_bm(),
        top: averageTop + (ind + 0.5 - ciurl.length / 2) * 26 + BOX_SIZE * 0.05 * randn_bm(),
        rotateDeg: Math.random() * 40 - 20
    }));

    // Fisher-Yates
    for (let i = imgs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    }

    for (let i = 0; i < imgs.length; i++) {
        contains_ciurl.appendChild(imgs[i]);
    }

    const sound = new Audio("sound/ciurl4.ogg");
    sound.play();
}

function clearCiurl() {
    removeChildren(document.getElementById("contains_ciurl")!);
}

function display_guide_after_stepping(
    coord: Coord,
    q: { piece: Piece, path: "ct" } | { piece: NonTam2Piece, path: "ct2" },
    parent: HTMLElement,
    list: Array<Coord>
): void {
    const src = UI_STATE.selectedCoord;

    if (src == null) {
        throw new Error("though stepping, null startpoint!!!!!")
    } else if (src[0] === "Hop1zuo1") {
        throw new Error("though stepping, hop1zuo1 startpoint!!!!!")
    }

    for (let ind = 0; ind < list.length; ind++) {
        const [i, j] = list[ind];
        const destPiece = GAME_STATE.f.currentBoard[i][j];

        // cannot step twice
        if (destPiece === "Tam2"
            || (
                destPiece !== null
                && (destPiece.side === Side.Upward || isProtectedByDownwardTamHueAUai(list[ind]))
            )
        ) {
            continue;
        }

        let img = createCircleGuideImageAt(list[ind], q.path);

        img.addEventListener('click', q.path === "ct" ? function () {
            getThingsGoingAfterStepping_Finite(src, coord, q.piece, list[ind]);
        } : function () {
            sendInfAfterStep({
                type: "InfAfterStep",
                color: q.piece.color,
                prof: q.piece.prof,
                step: toAbsoluteCoord(coord),
                plannedDirection: toAbsoluteCoord(list[ind]),
                src: toAbsoluteCoord(src)
            });
        });

        img.style.zIndex = "200";
        parent.appendChild(img);
    }
}

function display_guides(coord: Coord, piece: "Tam2" | NonTam2PieceUpward, parent: HTMLElement, list: Array<Coord>) {
    for (let ind = 0; ind < list.length; ind++) {
        // draw the yellow guides
        let img = createCircleGuideImageAt(list[ind], "ct");

        // click on it to get things going
        img.addEventListener('click', function () {
            getThingsGoing(piece, coord, list[ind]);
        });

        parent.appendChild(img);
    }
}

function selectOwnPieceOnBoard(coord: Coord, piece: "Tam2" | NonTam2PieceUpward) {
    /* erase the guide in all cases, since the guide also contains the selectedness of Hop1zuo1 */
    eraseGuide();

    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] === "Hop1zuo1" || !coordEq(UI_STATE.selectedCoord, coord)) {
        UI_STATE.selectedCoord = coord;

        const contains_guides = document.getElementById("contains_guides")!;

        let centralNode = createPieceSizeImageOnBoardByPath(coord, "selection2", "selection");
        centralNode.style.cursor = "pointer";

        // click on it to erase
        centralNode.addEventListener('click', function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });

        contains_guides.appendChild(centralNode);

        const { finite: guideListFinite, infinite: guideListInfinite } = calculateMovablePositions(
            coord,
            piece,
            GAME_STATE.f.currentBoard,
            GAME_STATE.tam_itself_is_tam_hue);

        display_guides(coord, piece, contains_guides, [...guideListFinite, ...guideListInfinite]);

    } else {
        /* Clicking what was originally selected will make it deselect */
        UI_STATE.selectedCoord = null;
    }
}

function selectOwnPieceOnHop1zuo1(ind: number, piece: NonTam2Piece) {
    // erase the existing guide in all circumstances
    eraseGuide();

    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] !== "Hop1zuo1" || UI_STATE.selectedCoord[1] !== ind) {

        UI_STATE.selectedCoord = ["Hop1zuo1", ind];

        const contains_guides_on_upward = document.getElementById("contains_guides_on_upward")!;
        let centralNode = createPieceSizeImageOnBoardByPathAndXY(
            1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
            1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
            "selection2",
            "selection"
        );

        centralNode.style.cursor = "pointer";

        // click on it to erase
        centralNode.addEventListener('click', function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });
        contains_guides_on_upward.appendChild(centralNode);

        const contains_guides = document.getElementById("contains_guides")!;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let ij: Coord = [i as BoardIndex, j as BoardIndex];

                // skip if already occupied
                if (GAME_STATE.f.currentBoard[i][j] != null) {
                    continue;
                }

                // draw the yellow guides
                let img = createCircleGuideImageAt(ij, "ct");

                // click on it to get things going
                img.addEventListener('click', function () {
                    (function getThingsGoingFromHop1zuo1(piece: NonTam2Piece, to: Coord) {
                        let dest = GAME_STATE.f.currentBoard[to[0]][to[1]];

                        // must parachute onto an empty square
                        if (dest != null) {
                            alert("Cannot parachute onto an occupied square");
                            throw new Error("Cannot parachute onto an occupied square");
                        }

                        let abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
                        let message: NormalNonTamMove = {
                            type: "NonTamMove",
                            data: {
                                type: "FromHand",
                                color: piece.color,
                                prof: piece.prof,
                                dest: abs_dst
                            }
                        };

                        sendNormalMessage(message);
                    })(piece, ij);
                });

                contains_guides.appendChild(img);
            }
        }
    } else {
        /* re-click: deselect */
        UI_STATE.selectedCoord = null;
    }
}

function createPieceImgToBePlacedOnHop1zuo1(ind: number, path: string): HTMLImageElement {
    return createPieceSizeImageOnBoardByPathAndXY(
        1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        path,
        "piece_image_on_hop1zuo1"
    );
}

function createPieceImgToBePlacedOnBoard(coord: Coord, piece: Piece) {
    return createPieceSizeImageOnBoardByPath(coord, toPath_(piece), "piece_image_on_board");
}

function removeChildren(parent: HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function drawField(field: Field) {
    const drawBoard = function (board: Board) {
        const contains_pieces_on_board = document.getElementById("contains_pieces_on_board")!;
        GAME_STATE.f.currentBoard = board;

        // delete everything
        removeChildren(contains_pieces_on_board);

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const piece: Piece | null = board[i][j];
                if (piece == null) {
                    continue;
                }

                const coord: Coord = [i as BoardIndex, j as BoardIndex];
                let imgNode: HTMLImageElement = createPieceImgToBePlacedOnBoard(coord, piece);

                if (piece === "Tam2") {
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener('click', function () {
                        selectOwnPieceOnBoard(coord, piece)
                    });
                } else if (piece.side === Side.Upward) {
                    let q: NonTam2PieceUpward = {
                        prof: piece.prof,
                        side: Side.Upward,
                        color: piece.color
                    };
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener('click', function () {
                        selectOwnPieceOnBoard(coord, q)
                    });
                }

                contains_pieces_on_board.appendChild(imgNode);
            }
        }
    }

    const drawHop1zuo1OfUpward = function (list: NonTam2PieceUpward[]) {
        const contains_pieces_on_upward = document.getElementById("contains_pieces_on_upward")!;
        GAME_STATE.f.hop1zuo1OfUpward = list;

        // delete everything
        removeChildren(contains_pieces_on_upward);

        for (let i = 0; i < list.length; i++) {
            const piece: NonTam2PieceUpward = list[i];
            let imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));

            imgNode.style.cursor = "pointer";
            imgNode.addEventListener('click', function () {
                selectOwnPieceOnHop1zuo1(i, piece)
            });

            contains_pieces_on_upward.appendChild(imgNode);
        }
    }

    const drawHop1zuo1OfDownward = function (list: NonTam2PieceDownward[]) {
        const contains_pieces_on_downward = document.getElementById("contains_pieces_on_downward")!;
        GAME_STATE.f.hop1zuo1OfDownward = list;

        // delete everything
        removeChildren(contains_pieces_on_downward);

        for (let i = 0; i < list.length; i++) {
            const piece: NonTam2PieceDownward = list[i];
            let imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            contains_pieces_on_downward.appendChild(imgNode);
        }
    }

    drawBoard(field.currentBoard);
    drawHop1zuo1OfUpward(field.hop1zuo1OfUpward);
    drawHop1zuo1OfDownward(field.hop1zuo1OfDownward);
}
