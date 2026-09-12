const questions = [
  {
    text: "Choose a number between 7 and refrigerator.",
    answers: ["8", "purple", "Delhi Metro", "no"]
  },
  {
    text: "You are now Minister of Maggi. Your first law?",
    answers: ["two packets means one serving", "ban soupy Maggi", "masala packet tax", "national Maggi holiday"]
  },
  {
    text: "Pick a valid unit of time.",
    answers: ["two minutes", "after this reel", "kal", "I'm on my way"]
  },
  {
    text: "You join a call with nine people. First move?",
    answers: ["leave", "mute and listen", "say hello for some reason", "take a screenshot"]
  },
  {
    text: "Someone says “I have tea.”",
    answers: ["call immediately", "voice note", "names first", "pretend I don't care"]
  },
  {
    text: "Which object has the most authority?",
    answers: ["school ID card", "steel bottle", "TV remote", "mummy's slipper"]
  },
  {
    text: "Pick a believable excuse.",
    answers: ["my phone died at 87%", "I was typing", "I didn't see it", "I sent it in my mind"]
  },
  {
    text: "What counts as studying?",
    answers: ["opening the PDF", "highlighting the heading", "one exam reel", "complaining in the group"]
  },
  {
    text: "Your friend says “don't tell anyone.”",
    answers: ["obviously not", "tell one person", "tell the group", "forget instantly"]
  },
  {
    text: "Choose the safest sentence.",
    answers: ["ma'am is absent", "trust me", "quick call?", "kal dekhte hain"]
  }
];

const reactionStickers = [
  { src:"assets/brain-fell.png", alt:"Brain fell down sticker", title:"brain temporarily unavailable", line:"Please try thinking again later." },
  { src:"assets/dora.png", alt:"Dora reaction sticker", title:"Dora has had enough", line:"Even she cannot explore a reason for that answer." },
  { src:"assets/kermit-guide.png", alt:"Kermit internet guide sticker", title:"internet privileges reviewed", line:"The committee recommends supervision." },
  { src:"assets/use-brain.png", alt:"Please use brain sticker", title:"gentle reminder", line:"The equipment was provided for a reason." },
  { src:"assets/almost-cared.png", alt:"Almost cared sticker", title:"historic moment", line:"Someone nearly cared. Nearly." },
  { src:"assets/einstein-ez.png", alt:"Einstein easy sticker", title:"apparently this was EZ", line:"Confidence remains several marks ahead of ability." },
  { src:"assets/modi-laugh.png", alt:"Laughing reaction sticker", title:"live audience reaction", line:"No statement has been issued." },
  { src:"assets/need-brain.png", alt:"You need this brain sticker", title:"a small donation", line:"Use it carefully. Stock is limited." },
  { src:"assets/do-we-care.png", alt:"Do we care chart sticker", title:"survey results are in", line:"The yellow section is being investigated." },
  { src:"assets/nokia.png", alt:"Nokia phone reaction sticker", title:"Nokia-level consequences", line:"Durable, unnecessary and headed directly toward you." },
  { src:"assets/e100.gif", alt:"E100 reaction meme", title:"E100 energy", line:"Premium confidence. Ingredients remain undisclosed." },
  { src:"assets/bin-laden.png", alt:"Extreme reaction meme", title:"the situation has escalated", line:"That answer created an international incident." },
  { src:"assets/hitler.png", alt:"Historical reaction meme", title:"absolutely not", line:"The committee has rejected the entire direction." },
  { src:"assets/modi-gun.png", alt:"Dramatic reaction meme", title:"strong response", line:"Negotiations have ended." },
  { src:"assets/bihari-dog.gif", alt:"Gang reaction dog meme", title:"the gang has been informed", line:"This is no longer a private matter." }
];

const ethanResult = {
  src:"assets/ethan.gif",
  alt:"Ethan the goat meme",
  title:"of course you got Ethan",
  line:"The system recognised you immediately. Goat frfr."
};

const allStickers = [...reactionStickers, ethanResult];
const guaranteedReactionSrc = "assets/bin-laden.png";

const chairmanResult = {
  src:"assets/e100.gif",
  alt:"E100 reaction meme",
  title:"self-appointed chairman",
  line:"One nickname and suddenly bro expects quarterly reports."
};

const reactionCaptions = [
  "mummy has been notified.",
  "the samosa is taking notes.",
  "terrible. locked in.",
  "the pigeon disagrees.",
  "this answer has legal consequences.",
  "even Dora is lost.",
  "the group chat will hear of this."
];

const views = {
  start: document.querySelector("#startView"),
  quiz: document.querySelector("#quizView"),
  loading: document.querySelector("#loadingView"),
  result: document.querySelector("#resultView")
};

const $ = selector => document.querySelector(selector);
let questionIndex = 0;
let playerName = "";
let moving = false;
let reactionOrder = [];
let reservedFinalResult = null;
const imageCache = new Map();

function showView(name) {
  Object.values(views).forEach(view => view.classList.remove("is-visible"));
  views[name].classList.add("is-visible");
}

function normalizeWords(value) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function editDistance(a, b) {
  const row = Array.from({ length:b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = previous;
    }
  }
  return row[b.length];
}

function resemblesAny(words, targets, tolerance) {
  return words.some(word => targets.some(target =>
    word.includes(target) ||
    (word.length >= 5 && target.includes(word)) ||
    (word.length >= 4 && editDistance(word, target) <= tolerance)
  ));
}

function getRiggedResult(value) {
  const words = normalizeWords(value);
  const veronikaHints = ["veronika", "veronica", "vernika", "vronika", "vecna", "gupta", "gupti"];
  const sohamHints = ["soham", "sohum", "sohan", "jindal"];
  const braggyTitles = ["boss", "king", "sigma", "ceo", "chairman", "founder", "alpha", "legend", "don"];

  if (resemblesAny(words, veronikaHints, 2)) return ethanResult;
  if (resemblesAny(words, sohamHints, 1) || words.some(word => braggyTitles.includes(word))) {
    return chairmanResult;
  }
  return null;
}

function randomItem(items) {
  if (window.crypto && window.crypto.getRandomValues) {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return items[value[0] % items.length];
  }
  return items[Math.floor(Math.random() * items.length)];
}

function shuffled(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildReactionGroups(stickerPool) {
  const deck = shuffled(stickerPool);
  const guaranteedIndex = deck.findIndex(sticker => sticker.src === guaranteedReactionSrc);
  if (guaranteedIndex > 0) {
    const [guaranteedSticker] = deck.splice(guaranteedIndex, 1);
    deck.unshift(guaranteedSticker);
  }
  const questionNumbers = shuffled(questions.map((_, index) => index));
  const doubleQuestions = new Set(questionNumbers.slice(0, 5));
  return questions.map((_, index) => {
    const amount = doubleQuestions.has(index) ? 2 : 1;
    return deck.splice(0, amount);
  });
}

function wait(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

async function placeReactionSticker(sticker) {
  const image = $("#reactionImage");
  image.src = sticker.src;
  image.alt = sticker.alt;
  try {
    await image.decode();
  } catch (error) {}
}

async function swapReactionSticker(sticker) {
  const image = $("#reactionImage");
  image.classList.add("is-swapping");
  await wait(100);
  await placeReactionSticker(sticker);
  $("#reactionText").textContent = randomItem(reactionCaptions);
  window.requestAnimationFrame(() => image.classList.remove("is-swapping"));
  await wait(750);
}

async function playReactionSequence(sequence) {
  await Promise.all(sequence.map(sticker => preloadImage(sticker.src)));
  await placeReactionSticker(sequence[0]);
  $("#reactionText").textContent = randomItem(reactionCaptions);
  $("#reaction").classList.remove("is-leaving");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => $("#reaction").classList.add("is-visible"));
  });

  await wait(850);
  for (let index = 1; index < sequence.length; index += 1) {
    await swapReactionSticker(sequence[index]);
  }

  $(".question-content").classList.add("is-switching");
  await wait(100);
  $("#reaction").classList.add("is-leaving");
  $("#reaction").classList.remove("is-visible");
  await wait(180);
  $("#reaction").classList.remove("is-leaving");
}

function preloadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function preloadUpcomingStickers(index) {
  const upcoming = reactionOrder.slice(index, index + 2).flat();
  if (index >= questions.length - 2 && reservedFinalResult) upcoming.push(reservedFinalResult);
  [...new Set(upcoming.map(item => item.src))].forEach(preloadImage);
}

function renderQuestion() {
  const question = questions[questionIndex];
  $("#stepLabel").textContent = (questionIndex + 1) + " / " + questions.length;
  $("#questionNumber").textContent = "question " + (questionIndex + 1);
  $("#questionText").textContent = question.text;
  $("#progressFill").style.width = ((questionIndex + 1) / questions.length * 100) + "%";

  const answerArea = $("#answers");
  answerArea.replaceChildren();
  question.answers.forEach(answerText => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.textContent = answerText;
    button.addEventListener("click", () => chooseAnswer(button));
    answerArea.appendChild(button);
  });
  preloadUpcomingStickers(questionIndex);
}

async function chooseAnswer(button) {
  if (moving) return;
  moving = true;
  button.classList.add("is-picked");
  document.querySelectorAll(".answer").forEach(answer => { answer.disabled = true; });

  await playReactionSequence(reactionOrder[questionIndex]);
  nextQuestion();
}

function nextQuestion() {
  questionIndex += 1;
  moving = false;
  if (questionIndex < questions.length) {
    renderQuestion();
    window.requestAnimationFrame(() => {
      $(".question-content").classList.remove("is-switching");
      document.querySelector(".answer").focus();
    });
  } else {
    $(".question-content").classList.remove("is-switching");
    runLoading();
  }
}

function runLoading() {
  $("#stepLabel").textContent = "";
  $("#progressFill").style.width = "100%";
  showView("loading");
  const lines = ["one sec...", "checking something...", "oh.", "found it."];
  let lineIndex = 0;
  const textTimer = window.setInterval(() => {
    lineIndex += 1;
    if (lineIndex < lines.length) $("#loadingText").textContent = lines[lineIndex];
  }, 240);
  window.setTimeout(() => {
    window.clearInterval(textTimer);
    showResult();
  }, 980);
}

function showResult() {
  const result = reservedFinalResult;
  $("#resultEyebrow").textContent = playerName;
  $("#resultTitle").textContent = result.title;
  $("#resultImage").src = result.src;
  $("#resultImage").alt = result.alt;
  $("#resultLine").textContent = result.line;
  showView("result");
  $("#restartButton").focus();
}

function startQuiz(event) {
  event.preventDefault();
  const value = $("#nameInput").value.trim();
  if (!value) {
    $("#formError").textContent = "put a name first";
    $("#nameInput").focus();
    return;
  }
  playerName = value;
  questionIndex = 0;
  moving = false;
  const finalCandidates = allStickers.filter(sticker => sticker.src !== guaranteedReactionSrc);
  reservedFinalResult = getRiggedResult(playerName) || randomItem(finalCandidates);
  const reactionPool = allStickers.filter(sticker => sticker.src !== reservedFinalResult.src);
  reactionOrder = buildReactionGroups(reactionPool);
  $("#formError").textContent = "";
  showView("quiz");
  renderQuestion();
}

function restart() {
  playerName = "";
  questionIndex = 0;
  moving = false;
  $("#nameInput").value = "";
  $("#progressFill").style.width = "0";
  $("#stepLabel").textContent = "";
  showView("start");
  $("#nameInput").focus();
}

$("#nameForm").addEventListener("submit", startQuiz);
$("#restartButton").addEventListener("click", restart);
