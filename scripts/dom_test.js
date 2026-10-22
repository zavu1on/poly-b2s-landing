const questions = [
  {
    text: "Если человека назвали мордофиля, то это…",
    note: "Ну зачем же вы так... В Этимологическом словаре русского языка Макса Фасмера поясняется, что мордофилей называют чванливого человека. Ну а «чванливый» — это высокомерный, тщеславный.",
    answers: [
      { text: "Значит, что он тщеславный.", correct: true },
      { text: "Значит, что у него лицо как у хряка." },
      { text: "Значит, что чумазый." },
    ],
  },
  {
    text: "«Да этот Ярополк — фуфлыга!» Что не так с Ярополком?",
    note: "Точно! Словарь Даля говорит, что фуфлыгой называют невзрачного малорослого человека. А еще так называют прыщи.",
    answers: [
      { text: "Он маленький и невзрачный.", correct: true },
      { text: "Он тот еще алкоголик." },
      { text: "Он не держит свое слово." },
    ],
  },
  {
    text: "Если человека прозвали пятигузом, значит, он…",
    note: "Может сесть сразу на пять стульев. Согласно Этимологическому словарю русского языка Макса Фасмера, пятигуз — это ненадежный, непостоянный человек.",
    answers: [
      { text: "Не держит слово.", correct: true },
      { text: "Изменяет жене" },
      { text: "Без гроша в кармане." },
    ],
  },
  {
    text: "Кто такой шлындра?",
    note: "Да! В Словаре русского арго «шлындрать» означает бездельничать, шляться.",
    answers: [{ text: "Обманщик." }, { text: "Нытик." }, { text: "Бродяга.", correct: true }],
  },
  {
    text: "В каком случае про человека можно сказать, что он охренел (в смысле «обнаглел/перешёл границы»), а не просто удивился?",
    note: "Правильно. Слово «охренел» многозначно, оно означает «обнаглел, потерял совесть».",
    answers: [
      { text: "Он без спроса берёт твои вещи и делает вид, что так и надо.", correct: true },
      {
        text: "Он в наглую лезет без очереди и ещё возмущается, что его не пропускают.",
        correct: true,
      },
      { text: "Он съел много хрена и искренне удивился: «Какой жгучий, вот это да!»" },
      { text: "В осеннем лесу наблюдается завихрение листьев." },
    ],
  },
];

const list = document.querySelector(".test__list");
const end = document.querySelector(".test__end");
const result = document.querySelector(".test__result");

const shuffle = (items) => {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

const queue = shuffle(questions);
let current = 0;
let score = 0;
let locked = false;
let finished = false;

const createAnswer = (answer, question, item) => {
  const block = document.createElement("div");

  block.className = "answer";
  block.innerHTML = '<p class="answer__text"></p>';
  block.firstChild.textContent = answer.text;

  if (answer.correct) {
    const note = document.createElement("p");
    note.className = "answer__note";
    note.textContent = question.note;
    block.append(note);
  }

  block.addEventListener("click", () => pick(block, answer, item));
  
  return block;
};

const showNext = () => {
  if (current === queue.length) {
    finished = true;
    list.classList.add("test__list--done");
    result.textContent = `Правильных ответов: ${score} из ${queue.length}`;
    end.hidden = false;
    return;
  }
  
  const question = queue[current];
  const item = document.createElement("li");

  item.className = "question";
  item.dataset.index = current;
  current++;
  item.innerHTML = `
    <div class="question__head">
      <span class="question__text">${current}. ${question.text}</span>
      <span class="question__mark"></span>
    </div>
    <div class="question__answers"></div>`;
  item
    .querySelector(".question__answers")
    .append(...shuffle(question.answers).map((answer) => createAnswer(answer, question, item)));
  list.append(item);
};

const pick = (block, answer, item) => {
  if (locked) return;
  locked = true;

  const correct = Boolean(answer.correct);
  const box = item.querySelector(".question__answers");
  const blocks = [...box.children];
  const order = correct ? [...blocks.filter((b) => b !== block), block] : blocks;

  if (correct) score++;

  block.classList.add("answer--shake");
  block.addEventListener("animationend", () => block.classList.remove("answer--shake"));
  
  if (correct) block.classList.add("answer--open");

  setTimeout(() => {
    item
      .querySelector(".question__mark")
      .classList.add(correct ? "question__mark--ok" : "question__mark--bad");

    order.forEach((b, i) => {
      b.style.transitionDelay = `${i * 0.3}s`;
      b.classList.add("answer--leave");
    });

    setTimeout(
      () => {
        box.remove();
        locked = false;
        showNext();
      },
      order.length * 300 + 600,
    );
  }, 2000);
};

list.addEventListener("click", (event) => {
  const head = event.target.closest(".question__head");
  if (!finished || !head) return;

  const item = head.parentElement;
  const wasOpen = item.querySelector(".question__solution");

  for (const solution of list.querySelectorAll(".question__solution")) {
    solution.remove();
  }

  if (wasOpen) return;

  const question = queue[item.dataset.index];
  const solution = document.createElement("div");
  
  solution.className = "answer question__solution";
  solution.innerHTML = '<p class="answer__text"></p><p class="answer__note"></p>';
  solution.children[0].textContent = question.answers
    .filter((answer) => answer.correct)
    .map((answer) => answer.text)
    .join(" ");
  solution.children[1].textContent = question.note;
  item.append(solution);
});

document.addEventListener("DOMContentLoaded", () => showNext())