window.PI_TRIVIA = [
  {
    question: "What is the value of PI to two decimal places?",
    options: ["3.14", "3.15", "3.13", "3.16"],
    answer: 0
  },
  {
    question: "What is PI?",
    options: [
      "The ratio of a circle's circumference to its diameter",
      "The ratio of a circle's area to its radius",
      "A type of triangle",
      "A famous mathematician"
    ],
    answer: 0
  },
  {
    question: "Which day is celebrated as PI Day?",
    options: ["March 14", "April 3", "June 28", "July 22"],
    answer: 0
  },
  {
    question: "Which of these is a common approximation for PI?",
    options: ["22/7", "2/3", "7/22", "3/2"],
    answer: 0
  },
  {
    question: "Is PI a rational or irrational number?",
    options: ["Irrational", "Rational", "Whole", "Prime"],
    answer: 0
  },
  {
    question: "Who first used the symbol π for PI?",
    options: ["William Jones", "Isaac Newton", "Leonhard Euler", "Euclid"],
    answer: 0
  }
];

window.getRandomTrivia = function() {
  return window.PI_TRIVIA[Math.floor(Math.random() * window.PI_TRIVIA.length)];
};
