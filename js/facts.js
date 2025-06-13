window.PI_FACTS = [
  "Did you know? PI has been calculated to over 62 trillion digits!",
  "PI Day is celebrated on March 14th (3/14).",
  "The symbol π was first used for PI in 1706.",
  "PI is an irrational number, meaning it never ends or repeats.",
  "The world record for memorizing PI is over 70,000 digits!",
  "PI appears in many formulas in physics and engineering.",
  "The first 6 digits of PI are 3.14159.",
  "PI is the ratio of a circle's circumference to its diameter.",
  "No exact fraction equals PI, but 22/7 is a common approximation.",
  "PI is used in probability, statistics, and even music theory!"
];

window.showRandomPIFact = function(motivationElem) {
  const fact = window.PI_FACTS[Math.floor(Math.random() * window.PI_FACTS.length)];
  motivationElem.textContent = fact;
  motivationElem.style.opacity = 1;
};
