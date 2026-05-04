const verbs = [
  { meaning: "切る", base: "cut", past: "cut", pp: "cut" },
  { meaning: "打つ", base: "hit", past: "hit", pp: "hit" },
  { meaning: "置く", base: "put", past: "put", pp: "put" },
  { meaning: "読む", base: "read", past: "read", pp: "read" },
  { meaning: "据える", base: "set", past: "set", pp: "set" },
  { meaning: "〜になる", base: "become", past: "became", pp: "become" },
  { meaning: "来る", base: "come", past: "came", pp: "come" },
  { meaning: "走る", base: "run", past: "ran", pp: "run" }
];

const fieldLabels = {
  base: "現在形",
  past: "過去形",
  pp: "過去分詞"
};


const ui = {
  setup: document.getElementById("setup-panel"),
  quiz: document.getElementById("quiz-panel"),
  result: document.getElementById("result-panel"),
  mode: document.getElementById("mode"),
  questionCount: document.getElementById("question-count"),
  startBtn: document.getElementById("start-btn"),
  progress: document.getElementById("progress"),
  score: document.getElementById("score"),
  prompt: document.getElementById("prompt"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  checkBtn: document.getElementById("check-btn"),
  nextBtn: document.getElementById("next-btn"),
  resultSummary: document.getElementById("result-summary"),
  weakList: document.getElementById("weak-list"),
  retryWeakBtn: document.getElementById("retry-weak-btn"),
  restartBtn: document.getElementById("restart-btn")
};

let questions = [];
let current = 0;
let correct = 0;
let weakPool = [];
let pendingResult = null;

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function makeQuestion(verb, mode) {
  if (mode === "base_to_past") {
    return { verb, prompt: `原形: ${verb.base} の過去形は？`, fields: ["past"] };
  }
  if (mode === "base_to_pp") {
    return { verb, prompt: `原形: ${verb.base} の過去分詞は？`, fields: ["pp"] };
  }
  if (mode === "meaning_to_all") {
    return { verb, prompt: `意味: ${verb.meaning} の3活用を入力`, fields: ["base", "past", "pp"] };
  }
  const randomMode = ["meaning_to_all", "base_to_past", "base_to_pp"][Math.floor(Math.random() * 3)];
  return makeQuestion(verb, randomMode);
}

function buildQuestions(pool, mode, count) {
  const source = shuffle(pool);
  const output = [];
  while (output.length < count) {
    const verb = source[output.length % source.length];
    output.push(makeQuestion(verb, mode));
  }
  return shuffle(output);
}

function renderQuestion() {
  const q = questions[current];
  ui.progress.textContent = `${current + 1} / ${questions.length}`;
  ui.score.textContent = `正解: ${correct}`;
  ui.prompt.textContent = q.prompt;
  ui.answers.innerHTML = "";
  q.fields.forEach((field) => {
    const row = document.createElement("div");
    row.className = "answer-row";
    row.innerHTML = `<label>${fieldLabels[field]}<input data-field="${field}" autocomplete="off" /></label>`;
    ui.answers.appendChild(row);
  });
  ui.feedback.textContent = "";
  ui.checkBtn.classList.remove("hidden");
  ui.nextBtn.classList.add("hidden");
}

function gradeCurrent() {
  const q = questions[current];
  let isCorrect = true;
  const details = [];

  q.fields.forEach((field) => {
    const input = ui.answers.querySelector(`[data-field='${field}']`);
    const got = input.value.trim().toLowerCase();
    const expected = q.verb[field].toLowerCase();
    if (got !== expected) {
      isCorrect = false;
      details.push(`${fieldLabels[field]}: ${q.verb[field]}`);
    }
  });

  if (isCorrect) {
    correct += 1;
    ui.feedback.textContent = "✅ 正解";
  } else {
    ui.feedback.textContent = `❌ 不正解（正答: ${details.join(", ")}）`;
    weakPool.push(q.verb);
  }
  ui.score.textContent = `正解: ${correct}`;
  ui.checkBtn.classList.add("hidden");
  ui.nextBtn.classList.remove("hidden");
}

function showResults() {
  ui.quiz.classList.add("hidden");
  ui.result.classList.remove("hidden");
  ui.resultSummary.textContent = `${questions.length}問中 ${correct}問正解（${Math.round((correct / questions.length) * 100)}%）`;
  ui.weakList.innerHTML = "";
  const uniqueWeak = [...new Map(weakPool.map((v) => [v.base, v])).values()];
  if (!uniqueWeak.length) {
    ui.weakList.innerHTML = "<li>苦手なし！</li>";
  } else {
    uniqueWeak.forEach((v) => {
      const li = document.createElement("li");
      li.textContent = `${v.meaning}: ${v.base} / ${v.past} / ${v.pp}`;
      ui.weakList.appendChild(li);
    });
  }
  pendingResult = uniqueWeak;
}

function startSession(pool = verbs) {
  const mode = ui.mode.value;
  const requestedCount = Number(ui.questionCount.value);
  const count = Math.min(30, Math.max(3, requestedCount || 8));
  questions = buildQuestions(pool, mode, count);
  current = 0;
  correct = 0;
  weakPool = [];
  ui.setup.classList.add("hidden");
  ui.result.classList.add("hidden");
  ui.quiz.classList.remove("hidden");
  renderQuestion();
}

ui.startBtn.addEventListener("click", () => startSession(verbs));
ui.checkBtn.addEventListener("click", gradeCurrent);
ui.nextBtn.addEventListener("click", () => {
  current += 1;
  if (current >= questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
});
ui.retryWeakBtn.addEventListener("click", () => {
  const pool = pendingResult && pendingResult.length ? pendingResult : verbs;
  startSession(pool);
});
ui.restartBtn.addEventListener("click", () => {
  ui.result.classList.add("hidden");
  ui.setup.classList.remove("hidden");
});
