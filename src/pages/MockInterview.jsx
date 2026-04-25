import MockInterviewSession from "../components/MockInterviewSession";

function MockInterview() {

  const questionBank = [

  // FRONTEND
  {
    question: "Which tag is used to create a hyperlink in HTML?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: "<a>",
    category: "Frontend",
    level: "easy"
  },
  {
    question: "Which CSS property is used to change text color?",
    options: ["font-color", "text-color", "color", "background-color"],
    answer: "color",
    category: "Frontend",
    level: "easy"
  },
  {
    question: "Which HTML tag is used for inserting an image?",
    options: ["<img>", "<image>", "<pic>", "<src>"],
    answer: "<img>",
    category: "Frontend",
    level: "easy"
  },
  {
    question: "Which hook is used for state in React?",
    options: ["useEffect", "useState", "useRef", "useMemo"],
    answer: "useState",
    category: "Frontend",
    level: "easy"
  },

  // JAVASCRIPT
  {
    question: "Which symbol is used for single-line comments in JavaScript?",
    options: ["#", "//", "<!-- -->", "**"],
    answer: "//",
    category: "Frontend",
    level: "easy"
  },
  {
    question: "Which method is used to output data in JavaScript?",
    options: ["print()", "console.log()", "echo()", "printf()"],
    answer: "console.log()",
    category: "Frontend",
    level: "easy"
  },
  {
    question: "What will this JavaScript code output?\nconsole.log(0 == false);",
    options: ["true", "false", "undefined", "error"],
    answer: "true",
    category: "Frontend",
    level: "medium"
  },
  {
    question: "What does “callback” mean in JavaScript?",
    options: ["Function inside loop", "Function passed as argument", "Recursive function", "Built-in function"],
    answer: "Function passed as argument",
    category: "Frontend",
    level: "medium"
  },
  {
    question: "What is event loop?",
    options: ["Async handler", "Compiler", "Framework", "DB"],
    answer: "Async handler",
    category: "Frontend",
    level: "medium"
  },

  // PYTHON / BACKEND
  {
    question: "Which keyword is used to define a function in Python?",
    options: ["function", "def", "fun", "define"],
    answer: "def",
    category: "Backend",
    level: "easy"
  },
  {
    question: "What will this Python code output?\nprint(len(\"Hello\"))",
    options: ["4", "5", "6", "Error"],
    answer: "5",
    category: "Backend",
    level: "medium"
  },
  {
    question: "What will this Python code output?\nprint(type([]))",
    options: ["list", "<class 'list'>", "array", "object"],
    answer: "<class 'list'>",
    category: "Backend",
    level: "medium"
  },
  {
    question: "What is Node.js mainly used for?",
    options: ["Styling web pages", "Running JavaScript on server", "Database management", "Image editing"],
    answer: "Running JavaScript on server",
    category: "Backend",
    level: "easy"
  },

  // DATABASE
  {
    question: "What does SQL stand for?",
    options: ["Structured Query Language", "Simple Query Language", "Sequential Query Language", "System Query Logic"],
    answer: "Structured Query Language",
    category: "Database",
    level: "easy"
  },
  {
    question: "Which SQL clause is used to filter records?",
    options: ["ORDER BY", "WHERE", "GROUP BY", "SELECT"],
    answer: "WHERE",
    category: "Database",
    level: "easy"
  },
  {
    question: "Which command is used to create a table in MySQL?",
    options: ["MAKE TABLE", "CREATE TABLE", "ADD TABLE", "NEW TABLE"],
    answer: "CREATE TABLE",
    category: "Database",
    level: "medium"
  },
  {
    question: "Which of the following is a primary key property?",
    options: ["Can be duplicate", "Can be null", "Unique and not null", "Only numeric"],
    answer: "Unique and not null",
    category: "Database",
    level: "medium"
  },
  {
    question: "Which normal form removes partial dependency?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: "2NF",
    category: "Database",
    level: "hard"
  },
  {
    question: "Which database is a NoSQL database?",
    options: ["MySQL", "Oracle", "MongoDB", "PostgreSQL"],
    answer: "MongoDB",
    category: "Database",
    level: "easy"
  },
  {
    question: "What type of database is MongoDB?",
    options: ["Relational", "Document-based", "Hierarchical", "Network"],
    answer: "Document-based",
    category: "Database",
    level: "easy"
  },
  {
    question: "What is the default port of MongoDB?",
    options: ["3306", "27017", "8080", "5000"],
    answer: "27017",
    category: "Database",
    level: "medium"
  },

  // CORE CS
  {
    question: "What does CPU stand for?",
    options: ["Central Process Unit", "Central Processing Unit", "Computer Power Unit", "Core Processing Unit"],
    answer: "Central Processing Unit",
    category: "Core",
    level: "easy"
  },
  {
    question: "Which data structure uses LIFO?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    answer: "Stack",
    category: "Core",
    level: "easy"
  },

  // PROGRAMMING
  {
    question: "What is the extension of a C++ file?",
    options: [".c", ".cpp", ".java", ".py"],
    answer: ".cpp",
    category: "Programming",
    level: "easy"
  },
  {
    question: "In Java, which keyword is used to inherit a class?",
    options: ["implement", "inherits", "extends", "using"],
    answer: "extends",
    category: "Programming",
    level: "medium"
  },
  {
    question: "Which keyword is used in C++ for inheritance?",
    options: ["extends", "inherit", ":", "super"],
    answer: ":",
    category: "Programming",
    level: "hard"
  },
  {
    question: "What is the output of this C code?\nint a = 10;\nprintf(\"%d\", a++);",
    options: ["10", "11", "Error", "9"],
    answer: "10",
    category: "Programming",
    level: "medium"
  },
  {
    question: "What will this Java code output?\nSystem.out.println(10 + 20 + \"30\");",
    options: ["102030", "3030", "303", "60"],
    answer: "3030",
    category: "Programming",
    level: "medium"
  }

];

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const finalQuestions = shuffle(questionBank).slice(0, 10);

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <MockInterviewSession questions={finalQuestions} />
    </div>
  );
}

export default MockInterview;