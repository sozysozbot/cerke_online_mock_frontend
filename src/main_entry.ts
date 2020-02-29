const {
  calculate_hands_and_score_from_pieces,
  hand_to_score,
} = require("exports-loader?calculate_hands_and_score_from_pieces,hand_to_score!./lib/cerke_calculate_hands/calculate_hand");
(window as any).calculate_hands_and_score_from_pieces = calculate_hands_and_score_from_pieces;
(window as any).hand_to_score = hand_to_score;

import { drawField } from "./main";
import { GAME_STATE } from "./game_state";

drawField();

document.getElementById("kait_kaik_button")!.addEventListener("click", () => {
  document.getElementById("kait_kaik")!.classList.add("nocover");
  GAME_STATE.is_my_turn = JSON.parse(sessionStorage.is_first_move_my_move);
});
