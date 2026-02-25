/***********************
 * Tabs (Switch games)
 ***********************/
const tabTtt = document.getElementById("tabTtt");
const tabRps = document.getElementById("tabRps");
const tttPanel = document.getElementById("tttPanel");
const rpsPanel = document.getElementById("rpsPanel");

function showTtt(){
  tabTtt.classList.add("active");
  tabRps.classList.remove("active");
  tttPanel.classList.remove("hidden");
  rpsPanel.classList.add("hidden");
}
function showRps(){
  tabRps.classList.add("active");
  tabTtt.classList.remove("active");
  rpsPanel.classList.remove("hidden");
  tttPanel.classList.add("hidden");
}
tabTtt.addEventListener("click", showTtt);
tabRps.addEventListener("click", showRps);

/***********************
 * Game 1: TicTacToe (Minimax)
 * O -> Logo
 ***********************/
const tttBoardEl = document.getElementById("tttBoard");
const tttStatusEl = document.getElementById("tttStatus");
const tttResetBtn = document.getElementById("tttResetBtn");
const tttDifficultyEl = document.getElementById("tttDifficulty");

const HUMAN = "X";
const AI = "O";

let tttBoard = Array(9).fill(null);
let tttGameOver = false;
let tttHumanTurn = true;

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function tttSetStatus(text){ tttStatusEl.textContent = text; }

function tttCheckWinner(b){
  for (const [a,c,d] of wins){
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(x => x)) return "DRAW";
  return null;
}

function tttAvailableMoves(b){
  const moves = [];
  for (let i=0;i<9;i++) if (!b[i]) moves.push(i);
  return moves;
}

function tttRender(){
  tttBoardEl.innerHTML = "";
  for (let i=0;i<9;i++){
    const cell = document.createElement("div");
    const disabled = tttBoard[i] || tttGameOver || !tttHumanTurn;
    cell.className = "cell" + (disabled ? " disabled" : "");

    // X -> text, O -> logo image
    if (tttBoard[i] === HUMAN){
      cell.textContent = "X";
    } else if (tttBoard[i] === AI){
      const img = document.createElement("img");
      img.src = "logo.png";
      img.alt = "لوگو";
      img.className = "oLogo";
      cell.appendChild(img);
    } else {
      cell.textContent = "";
    }

    cell.addEventListener("click", () => tttOnCellClick(i));
    tttBoardEl.appendChild(cell);
  }
}

function tttOnCellClick(i){
  if (tttGameOver || !tttHumanTurn || tttBoard[i]) return;

  tttBoard[i] = HUMAN;
  tttHumanTurn = false;

  const res = tttCheckWinner(tttBoard);
  if (res) return tttEndGame(res);

  tttRender();
  tttSetStatus("نوبت هوش مصنوعی...");

  setTimeout(tttAiMove, 220);
}

function tttEndGame(result){
  tttGameOver = true;
  if (result === HUMAN) tttSetStatus("بردی! 🎉");
  else if (result === AI) tttSetStatus("باختی! 😅");
  else tttSetStatus("مساوی 🤝");
  tttRender();
}

function tttRandomChoice(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

// Minimax
function tttBestMove(b){
  let bestScore = -Infinity;
  let move = null;

  for (const m of tttAvailableMoves(b)){
    const copy = b.slice();
    copy[m] = AI;
    const score = tttMinimax(copy, 0, false);
    if (score > bestScore){
      bestScore = score;
      move = m;
    }
  }
  return move;
}

function tttMinimax(b, depth, isMaximizing){
  const result = tttCheckWinner(b);
  if (result === AI) return 10 - depth;
  if (result === HUMAN) return depth - 10;
  if (result === "DRAW") return 0;

  if (isMaximizing){
    let best = -Infinity;
    for (const m of tttAvailableMoves(b)){
      const copy = b.slice();
      copy[m] = AI;
      best = Math.max(best, tttMinimax(copy, depth + 1, false));
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of tttAvailableMoves(b)){
      const copy = b.slice();
      copy[m] = HUMAN;
      best = Math.min(best, tttMinimax(copy, depth + 1, true));
    }
    return best;
  }
}

function tttAiMove(){
  if (tttGameOver) return;

  const diff = tttDifficultyEl.value;
  const moves = tttAvailableMoves(tttBoard);

  let move;
  if (diff === "easy"){
    move = (Math.random() < 0.55) ? tttRandomChoice(moves) : tttBestMove(tttBoard);
  } else if (diff === "normal"){
    move = (Math.random() < 0.20) ? tttRandomChoice(moves) : tttBestMove(tttBoard);
  } else {
    move = tttBestMove(tttBoard);
  }

  tttBoard[move] = AI;

  const res = tttCheckWinner(tttBoard);
  if (res) return tttEndGame(res);

  tttHumanTurn = true;
  tttRender();
  tttSetStatus("نوبت شما: X");
}

function tttReset(){
  tttBoard = Array(9).fill(null);
  tttGameOver = false;
  tttHumanTurn = true;
  tttSetStatus("نوبت شما: X");
  tttRender();
}
tttResetBtn.addEventListener("click", tttReset);
tttReset();

/***********************
 * Game 2: Rock-Paper-Scissors (Learning AI)
 ***********************/
const rpsYouScoreEl = document.getElementById("rpsYouScore");
const rpsAiScoreEl = document.getElementById("rpsAiScore");
const rpsDrawScoreEl = document.getElementById("rpsDrawScore");
const rpsYouPickEl = document.getElementById("rpsYouPick");
const rpsAiPickEl = document.getElementById("rpsAiPick");
const rpsMsgEl = document.getElementById("rpsMsg");
const rpsDebugEl = document.getElementById("rpsDebug");
const rpsResetBtn = document.getElementById("rpsResetBtn");
const rpsBtns = document.querySelectorAll(".pick");

const RPS = ["rock","paper","scissors"];
const RPS_ICON = { rock:"✊ سنگ", paper:"✋ کاغذ", scissors:"✌️ قیچی" };

let rpsYou = 0, rpsAi = 0, rpsDraw = 0;

// Markov 1-step: last human -> next human counts
let rpsTrans = {
  rock:{rock:0,paper:0,scissors:0},
  paper:{rock:0,paper:0,scissors:0},
  scissors:{rock:0,paper:0,scissors:0}
};
let rpsLastHuman = null;

function rpsBeats(a,b){
  return (a==="rock"&&b==="scissors")||(a==="paper"&&b==="rock")||(a==="scissors"&&b==="paper");
}
function rpsCounter(move){
  return (move==="rock") ? "paper" : (move==="paper") ? "scissors" : "rock";
}
function rpsRandom(){
  return RPS[Math.floor(Math.random()*RPS.length)];
}

function rpsPredictNext(){
  if (!rpsLastHuman) return rpsRandom();
  const s = rpsTrans[rpsLastHuman];
  const total = s.rock + s.paper + s.scissors;
  if (total === 0) return rpsRandom();
  let best = "rock";
  if (s.paper > s[best]) best = "paper";
  if (s.scissors > s[best]) best = "scissors";
  return best;
}

function rpsAiChoose(){
  const predicted = rpsPredictNext();
  const aiMove = rpsCounter(predicted);

  if (!rpsLastHuman){
    rpsDebugEl.textContent = "الگو: هنوز حرکت قبلی ندارم → رندوم.";
  } else {
    const s = rpsTrans[rpsLastHuman];
    rpsDebugEl.textContent =
      `بعد از (${RPS_ICON[rpsLastHuman]}): rock=${s.rock}, paper=${s.paper}, scissors=${s.scissors} → پیش‌بینی: ${RPS_ICON[predicted]} → پاسخ AI: ${RPS_ICON[aiMove]}`;
  }
  return aiMove;
}

function rpsUpdateScores(){
  rpsYouScoreEl.textContent = rpsYou;
  rpsAiScoreEl.textContent = rpsAi;
  rpsDrawScoreEl.textContent = rpsDraw;
}

function rpsPlay(humanMove){
  const aiMove = rpsAiChoose();

  rpsYouPickEl.textContent = RPS_ICON[humanMove];
  rpsAiPickEl.textContent = RPS_ICON[aiMove];

  if (humanMove === aiMove){
    rpsDraw++;
    rpsMsgEl.textContent = "مساوی 🤝";
  } else if (rpsBeats(humanMove, aiMove)){
    rpsYou++;
    rpsMsgEl.textContent = "بردی! 🎉";
  } else {
    rpsAi++;
    rpsMsgEl.textContent = "باختی 😅";
  }

  // learning update
  if (rpsLastHuman) rpsTrans[rpsLastHuman][humanMove] += 1;
  rpsLastHuman = humanMove;

  rpsUpdateScores();
}

function rpsReset(){
  rpsYou = rpsAi = rpsDraw = 0;
  rpsLastHuman = null;
  rpsTrans = {
    rock:{rock:0,paper:0,scissors:0},
    paper:{rock:0,paper:0,scissors:0},
    scissors:{rock:0,paper:0,scissors:0}
  };
  rpsYouPickEl.textContent = "-";
  rpsAiPickEl.textContent = "-";
  rpsMsgEl.textContent = "یکی را انتخاب کن";
  rpsDebugEl.textContent = "الگو: هنوز داده ندارم.";
  rpsUpdateScores();
}

rpsBtns.forEach(b => b.addEventListener("click", () => rpsPlay(b.dataset.move)));
rpsResetBtn.addEventListener("click", rpsReset);
rpsReset();

// default view
showTtt();