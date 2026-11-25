const questions = [
  { text: '7 × 9', answer: '63', wrongAnswers: ['56', '72', '64'] },
  { text: '5 × 18', answer: '90', wrongAnswers: ['80', '95', '85'] },
  { text: '-2 + 1031', answer: '1029', wrongAnswers: ['1033', '1031', '-1029'] },
  { text: '0.5 × 0.5', answer: '0.25', wrongAnswers: ['1', '0.5', '2.5'] },
  { text: '0.75 ÷ 0.75', answer: '1', wrongAnswers: ['0', '0.75', '0.5625'] },
  { text: '5 + 5 ÷ 5', answer: '6', wrongAnswers: ['2', '15', '5'] },
  { text: '200 + 2 × 21', answer: '242', wrongAnswers: ['4242', '221', '223'] },
];

// The score the player needs to win
const PASS_SCORE = 5;

// Seconds the player gets for each question(timer)
const QUESTION_TIME = 20;

/*----- state variables -----*/
let score = 0;
let playerAnswers = [];
let currentQuestionIndex = 0;
let timeLeft = QUESTION_TIME;
let countdown = null;

/// DOM codes
const startScreenEl = document.getElementById('start-screen');
const quizScreenEl = document.getElementById('quiz-screen');
const resultScreenEl = document.getElementById('result-screen');
const questionNumberEl = document.getElementById('question-number');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const progressFillEl = document.getElementById('progress-fill');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const resultTitleEl = document.getElementById('result-title');
const finalScoreEl = document.getElementById('final-score');
const resultMessageEl = document.getElementById('result-message');
const reviewEl = document.getElementById('review');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');


// Event Listeners
// start button click 
startBtn.addEventListener('click', init);
// restart button click
restartBtn.addEventListener('click', init);
nextBtn.addEventListener('click', handleNext);

////////Functions

//Timer code
function startTimer() {
  stopTimer();
  timeLeft = QUESTION_TIME;
  timerEl.textContent = `Time: ${timeLeft}s`;

  countdown = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      timerEl.textContent = "Time's up!";
      checkAnswer(null);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(countdown);
  countdown = null;
}

// Start (or restart) the game:
// go back to question 1 - reset the score - clear the old answers
function init() {
  currentQuestionIndex = 0;
  score = 0;
  playerAnswers = [];
  startScreenEl.setAttribute('hidden', true);
  resultScreenEl.setAttribute('hidden', true);
  quizScreenEl.removeAttribute('hidden');
  loadQuestion();
  render();
}

// Show the current question and its 4 answer buttons, then start the timer
function loadQuestion() {
  const question = questions[currentQuestionIndex];
  questionEl.textContent = `${question.text} = ?`;

  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  nextBtn.setAttribute('hidden', true);

  // Put the right answer with the wrong ones, then mix them up
  const choices = [question.answer, ...question.wrongAnswers];
  choices.sort(() => Math.random() - 0.5);

choicesEl.innerHTML = ''
choices.forEach((choice) => {
  const choiceBtn = document.createElement('button')
    choiceBtn.type = 'button'
    choiceBtn.className = 'choice'
    choiceBtn.textContent = choice
    choiceBtn.addEventListener('click', handleChoice);
    choicesEl.appendChild(choiceBtn)
  })

  startTimer()
}

// Runs when the player clicks an answer button
function handleChoice(evt) {
  checkAnswer(evt.target.textContent);
}

// Check the answer, color the buttons and show the Next button.
// selectedAnswer is null when the time runs out.
function checkAnswer(selectedAnswer) {
  stopTimer();

  const question = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === question.answer;

  if (isCorrect) {
    score++;
    feedbackEl.textContent = 'Correct!';
    feedbackEl.classList.add('good');
  } else if (selectedAnswer === null) {
    feedbackEl.textContent = `Time's up! The answer is ${question.answer}.`;
    feedbackEl.classList.add('bad');
  } else {
    feedbackEl.textContent = `Wrong. The answer is ${question.answer}.`;
    feedbackEl.classList.add('bad');
  }

  playerAnswers.push({
  text: question.text,
  answer: question.answer,
  picked: selectedAnswer === null ? 'no answer' : selectedAnswer,
  isCorrect: isCorrect,}
);

  // Lock all buttons: green for the right answer, red for the wrong pick
  const choiceBtns = choicesEl.querySelectorAll('.choice');
  choiceBtns.forEach((choiceBtn) => {
    choiceBtn.disabled = true;
    if (choiceBtn.textContent === question.answer) {
      choiceBtn.classList.add('correct');
    } else if (choiceBtn.textContent === selectedAnswer) {
      choiceBtn.classList.add('wrong');
    }
  });

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  nextBtn.textContent = isLastQuestion ? 'See results' : 'Next';
  nextBtn.removeAttribute('hidden');

  render();
}

// Go to the next question, or to the results after the last one
function handleNext() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
    render();
  } else {
    showResults();
  }
}

// Update the question number, score and progress bar
function render() {
  questionNumberEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  scoreEl.textContent = `Score: ${score}`;
  progressFillEl.style.width = `${(playerAnswers.length / questions.length) * 100}%`;
}

// Show the win/lose message, final score and a review of every question
function showResults() {
  stopTimer();
  const hasWon = score >= PASS_SCORE;

  quizScreenEl.setAttribute('hidden', true);
  resultScreenEl.removeAttribute('hidden');

  resultTitleEl.textContent = hasWon ? 'You win!' : 'You lose';
  resultTitleEl.className = hasWon ? 'result-title win' : 'result-title loss';
  finalScoreEl.textContent = `${score} / ${questions.length}`;
  resultMessageEl.textContent = hasWon
    ? `Great job! You needed ${PASS_SCORE} correct answers and you got ${score}.`
    : `You needed at least ${PASS_SCORE} correct answers. Try again!`;

  reviewEl.innerHTML = '';
  playerAnswers.forEach((playerAnswer) => {
    const reviewItem = document.createElement('li');
    reviewItem.className = playerAnswer.isCorrect ? 'right' : 'missed';
    reviewItem.textContent = playerAnswer.isCorrect
      ? `${playerAnswer.text} = ${playerAnswer.answer} (correct)`
      : `${playerAnswer.text} = ${playerAnswer.answer} (you chose ${playerAnswer.picked})`;
    reviewEl.appendChild(reviewItem);
  });
}