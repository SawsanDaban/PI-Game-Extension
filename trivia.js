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
  },
  // --- Additional questions below ---
  {
    question: "What is the Greek letter for PI?",
    options: ["π", "Ω", "Σ", "Δ"],
    answer: 0
  },
  {
    question: "Which famous scientist calculated PI to 35 decimal places?",
    options: ["Isaac Newton", "Albert Einstein", "Archimedes", "Carl Gauss"],
    answer: 0
  },
  {
    question: "PI is used in which branch of mathematics?",
    options: ["Geometry", "Algebra", "Calculus", "All of the above"],
    answer: 3
  },
  {
    question: "What is the approximate value of PI to 5 decimal places?",
    options: ["3.14159", "3.14149", "3.14169", "3.14139"],
    answer: 0
  },
  {
    question: "Which of these formulas uses PI?",
    options: [
      "Area of a circle: πr²",
      "Area of a triangle: ½bh",
      "Perimeter of a square: 4a",
      "Volume of a cube: a³"
    ],
    answer: 0
  },
  {
    question: "What is the record for most digits of PI memorized (as of 2023)?",
    options: [
      "Over 70,000 digits",
      "Over 10,000 digits",
      "Over 100,000 digits",
      "Over 1,000 digits"
    ],
    answer: 0
  },
  {
    question: "Which country holds an annual PI recitation contest?",
    options: ["Japan", "USA", "France", "India"],
    answer: 0
  },
  {
    question: "What is the value of PI divided by 2 called?",
    options: ["Half PI", "Tau", "Pi/2", "Omega"],
    answer: 2
  },
  {
    question: "What is the value of Tau (τ) in terms of PI?",
    options: ["2π", "π/2", "π²", "π+2"],
    answer: 0
  },
  {
    question: "Which of these is NOT true about PI?",
    options: [
      "It is a transcendental number",
      "It is a repeating decimal",
      "It is irrational",
      "It is used in trigonometry"
    ],
    answer: 1
  }
];

window.getRandomTrivia = function() {
  return window.PI_TRIVIA[Math.floor(Math.random() * window.PI_TRIVIA.length)];
};
