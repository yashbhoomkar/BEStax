const MANDATORY_DATASET_COLUMNS = [
  "User Prompt",
  "Generated Query",
  "Expected Query",
  "Date of the row created"
];

const DEFAULT_DATASETS = [
  {
    name: "Customer Orders Sample",
    description: "Sample dataset containing customer order information for testing and evaluation.",
    databaseName: "CustomerOrdersDB",
    databaseType: "MySQL",
    columns: [...MANDATORY_DATASET_COLUMNS],
    rows: [
      {
        "User Prompt": "Show all orders placed in January",
        "Generated Query": "SELECT * FROM orders WHERE MONTH(order_date) = 1;",
        "Expected Query": "SELECT * FROM orders WHERE MONTH(order_date) = 1;",
        "Date of the row created": "2026-03-26"
      }
    ]
  },
  {
    name: "Employee Records Sample",
    description: "Sample dataset containing employee records and department mappings.",
    databaseName: "EmployeeRecordsDB",
    databaseType: "PostgreSQL",
    columns: [...MANDATORY_DATASET_COLUMNS],
    rows: [
      {
        "User Prompt": "List all employees in the engineering department",
        "Generated Query": "SELECT * FROM employees WHERE department = 'Engineering';",
        "Expected Query": "SELECT * FROM employees WHERE department = 'Engineering';",
        "Date of the row created": "2026-03-26"
      }
    ]
  }
];

const DEFAULT_EVALUATORS = [
  {
    name: "Semantic Evaluator",
    description: "Checks if the Query Generated Serves the purpose intended by the user",
    range: "0 or 1",
    databases: "Applicable to Every Database",
    systemPrompt: "Evaluate whether the generated query satisfies the user's intent.",
    currentModel: "Gemini"
  },
  {
    name: "Syntactic Evaluator",
    description: "Checks the syntax of the generated query",
    range: "0 to 1",
    databases: "Applicable to Every Database",
    systemPrompt: "Evaluate whether the generated query is syntactically correct.",
    currentModel: "Gemini"
  },
  {
    name: "Safety",
    description:
      "Checks if the generated query is read-only or tries to alter the data in the database. if read-only then score as 1 else 0.",
    range: "0 or 1",
    databases: "Applicable to Every Database",
    systemPrompt: "Evaluate whether the query is safe and read-only.",
    currentModel: "Gemini"
  }
];

const DEFAULT_PROJECTS = [
  {
    name: "Customer Orders SQL Evaluation",
    datasetName: "Customer Orders Sample",
    score: "0.84",
    lastUpdated: "2026-03-26",
    description: "Baseline evaluation project for customer order SQL generation.",
    evaluatorName: "Semantic Evaluator",
    evaluatorNames: ["Semantic Evaluator"],
    datasetSnapshot: {}
  },
  {
    name: "Employee Records Syntax Review",
    datasetName: "Employee Records Sample",
    score: "0.91",
    lastUpdated: "2026-03-26",
    description: "Tracks syntax quality on employee record query generation.",
    evaluatorName: "Syntactic Evaluator",
    evaluatorNames: ["Syntactic Evaluator"],
    datasetSnapshot: {}
  }
];

const DEFAULT_MODEL_MANAGER = [
  { modelKey: "Gemini_MODEL_NAME", modelName: "gemini-2.5-flash" },
  { modelKey: "Claude_MODEL_NAME", modelName: "claude-3-5-sonnet-latest" },
  { modelKey: "OpenAI_MODEL_NAME", modelName: "gpt-4.1-mini" }
];

const DEFAULT_API_KEY_RECORDS = [
  { apiName: "Gemini_API_KEY", apiKey: "" },
  { apiName: "Claude_API_KEY", apiKey: "" },
  { apiName: "OpenAI_API_KEY", apiKey: "" }
];

module.exports = {
  MANDATORY_DATASET_COLUMNS,
  DEFAULT_DATASETS,
  DEFAULT_EVALUATORS,
  DEFAULT_PROJECTS,
  DEFAULT_MODEL_MANAGER,
  DEFAULT_API_KEY_RECORDS
};
