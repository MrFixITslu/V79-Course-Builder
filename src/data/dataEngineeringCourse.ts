/**
 * Beginner-friendly Data Engineering course seed.
 *
 * The course is intentionally stored as normal V79 Academy data so it can be
 * edited with the existing course builder, displayed in the Student Portal,
 * exported, versioned and published like any other course.
 *
 * DP-700 alignment: Microsoft Fabric Data Engineer Associate with foundations
 * in SQL, Python, dimensional modelling, ETL/ELT, Azure, Spark, OneLake,
 * Lakehouse, Data Factory, KQL, security, monitoring and optimization.
 */

type LessonSeed = {
  title: string;
  description: string;
  objectives: string[];
  concepts: string[];
  example: string;
  practice: string[];
};

type QuizQuestionSeed = {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
};

type ModuleSeed = {
  title: string;
  description: string;
  lessons: LessonSeed[];
  quiz: QuizQuestionSeed[];
  assignmentTitle: string;
  assignmentDescription: string;
};

export const DATA_ENGINEERING_COURSE_ID = "course-data-engineering-dp700-01";

const modules: ModuleSeed[] = [
  {
    title: "Module 1: Data Engineering Foundations",
    description: "Understand what data engineers build, how data moves through a platform, and the difference between operational and analytical workloads.",
    lessons: [
      {
        title: "What a Data Engineer Actually Does",
        description: "Learn the data engineer role through a simple source-to-dashboard mental model.",
        objectives: [
          "Explain the responsibilities of a data engineer",
          "Describe the stages of a modern data pipeline",
          "Identify common source and destination systems"
        ],
        concepts: [
          "A data engineer makes data reliable, usable, secure and available for analytics.",
          "A typical flow is source → ingest → store → transform → serve → monitor.",
          "Source systems can include business applications, databases, APIs, files and event streams.",
          "Consumers include dashboards, analysts, data scientists, machine-learning systems and business applications."
        ],
        example: "A retail application writes orders to a transactional database. A pipeline copies new orders into analytical storage, cleans product and customer fields, calculates revenue measures, and exposes a trusted sales table to Power BI.",
        practice: [
          "List three source systems you use or know about.",
          "For each source, write who needs the data and why.",
          "Draw arrows from source → storage → transformation → reporting."
        ]
      },
      {
        title: "Batch, Streaming, OLTP and OLAP",
        description: "Learn the four workload ideas that appear repeatedly in data-engineering design questions.",
        objectives: [
          "Differentiate batch and streaming processing",
          "Differentiate OLTP and OLAP systems",
          "Choose an appropriate approach for common scenarios"
        ],
        concepts: [
          "Batch processing handles a bounded group of records on a schedule or trigger.",
          "Streaming processing handles continuously arriving events with low latency.",
          "OLTP systems are optimized for fast day-to-day transactions such as order entry.",
          "OLAP systems are optimized for analytical queries across large historical datasets."
        ],
        example: "A bank account transfer is an OLTP transaction. A monthly profitability report is an OLAP workload. A nightly customer export is batch. Real-time fraud signals are streaming.",
        practice: [
          "Classify five business examples as batch or streaming.",
          "Classify each example as primarily OLTP or OLAP.",
          "Explain one case where near-real-time processing is useful but true streaming is unnecessary."
        ]
      },
      {
        title: "Reliability, Data Quality and SLAs",
        description: "Move from 'the pipeline ran' to 'the data can be trusted'.",
        objectives: [
          "Define useful reliability and quality checks",
          "Explain freshness, completeness, validity and uniqueness",
          "Describe why retries, logging and SLAs matter"
        ],
        concepts: [
          "Freshness asks whether the data arrived when expected.",
          "Completeness asks whether required records and fields are present.",
          "Validity asks whether values follow business rules and expected formats.",
          "Uniqueness helps detect duplicate records.",
          "A production pipeline needs monitoring, retries, logging and a clear recovery path."
        ],
        example: "If yesterday had 12,000 orders and today has 20, a successful pipeline run may still be wrong. A volume threshold and freshness check can flag the issue before executives see the dashboard.",
        practice: [
          "Define four quality checks for an orders table.",
          "Write an SLA for a daily 7:00 AM sales dashboard.",
          "Describe what should happen if the source is unavailable for one hour."
        ]
      }
    ],
    quiz: [
      {
        question: "Which sequence best represents a typical data-engineering flow?",
        options: ["Source → ingest → store → transform → serve → monitor", "Dashboard → source → delete → archive", "Transform → source → monitor → email"],
        correct: "Source → ingest → store → transform → serve → monitor",
        explanation: "Most modern platforms move data from sources through ingestion, storage and transformation before serving and monitoring it."
      },
      {
        question: "Which workload is normally optimized for analytical queries over large historical datasets?",
        options: ["OLAP", "OLTP", "DNS"],
        correct: "OLAP",
        explanation: "OLAP systems are designed for analytical querying and aggregation."
      },
      {
        question: "Which data-quality dimension is most directly concerned with duplicate records?",
        options: ["Uniqueness", "Freshness", "Latency"],
        correct: "Uniqueness",
        explanation: "Uniqueness checks detect repeated business keys or duplicate events."
      }
    ],
    assignmentTitle: "Design Your First Data Pipeline",
    assignmentDescription: "Choose a small business scenario and submit a one-page source-to-dashboard design. Identify sources, ingestion method, storage, transformations, final consumers, three quality checks and one recovery action."
  },
  {
    title: "Module 2: Storage, Files and Data Architecture",
    description: "Understand file formats, data lakes, warehouses, lakehouses, partitions and layered data organization.",
    lessons: [
      {
        title: "CSV, JSON, Parquet and Delta Concepts",
        description: "Learn why file format choices affect cost, speed, schema and reliability.",
        objectives: [
          "Compare CSV, JSON and Parquet",
          "Explain why columnar storage helps analytics",
          "Describe what transactional table formats add to a data lake"
        ],
        concepts: [
          "CSV is simple and portable but has weak schema and type information.",
          "JSON is flexible for nested and semi-structured data but is verbose.",
          "Parquet is columnar, compressed and efficient for analytical scans.",
          "Delta-style tables add transaction reliability, schema controls and update/merge patterns over files."
        ],
        example: "A 200-column sales dataset queried for only date, region and revenue is usually far more efficient in Parquet than CSV because the engine can read only the needed columns.",
        practice: [
          "Create a small table with customers and orders.",
          "Represent the same records conceptually as CSV and JSON.",
          "Write when you would choose Parquet for the analytical copy."
        ]
      },
      {
        title: "Data Lake vs Warehouse vs Lakehouse",
        description: "Choose storage architecture based on workload rather than memorizing product names.",
        objectives: [
          "Explain data lake, warehouse and lakehouse",
          "Match each architecture to common workloads",
          "Understand separation of raw and curated data"
        ],
        concepts: [
          "A data lake stores large volumes of varied data, often as files in object storage.",
          "A data warehouse provides strongly structured relational data optimized for analytics.",
          "A lakehouse combines lake-style storage with managed table capabilities and analytical engines.",
          "The correct choice depends on data shape, users, latency, governance and processing tools."
        ],
        example: "Raw device telemetry may land cheaply in a lake while finance reporting uses curated warehouse tables. A lakehouse can support both file-based engineering and SQL-oriented analytics from a shared platform.",
        practice: [
          "Choose lake, warehouse or lakehouse for three different scenarios.",
          "Write one advantage and one trade-off for each choice.",
          "Explain where raw source data should be preserved."
        ]
      },
      {
        title: "Partitioning, Schema and the Medallion Pattern",
        description: "Organize large data so engines can read less, transformations remain understandable and quality improves by layer.",
        objectives: [
          "Explain partitioning and partition pruning",
          "Understand schema enforcement and evolution",
          "Use Bronze, Silver and Gold layers"
        ],
        concepts: [
          "Partitioning physically organizes data by useful filter keys such as date.",
          "Good partition design avoids both giant partitions and millions of tiny ones.",
          "Schema enforcement rejects or isolates data that does not match expectations.",
          "Bronze preserves raw data, Silver cleans and conforms it, and Gold serves business-ready outputs."
        ],
        example: "A sales lakehouse can partition records by transaction year and month. Bronze retains original rows, Silver standardizes types and removes duplicates, and Gold contains monthly revenue and customer metrics.",
        practice: [
          "Design partitions for five years of daily sales data.",
          "Write what belongs in Bronze, Silver and Gold.",
          "Describe how you would handle an unexpected new source column."
        ]
      }
    ],
    quiz: [
      {
        question: "Which file format is column-oriented and commonly preferred for analytical scans?",
        options: ["Parquet", "CSV", "Plain text"],
        correct: "Parquet",
        explanation: "Parquet stores data by column and supports efficient compression and selective reads."
      },
      {
        question: "Which layer normally preserves the source data with minimal transformation?",
        options: ["Bronze", "Gold", "Presentation only"],
        correct: "Bronze",
        explanation: "Bronze is typically the raw or near-raw landing layer."
      },
      {
        question: "What is the main goal of partition pruning?",
        options: ["Avoid reading unnecessary data", "Rename every column", "Increase duplicate records"],
        correct: "Avoid reading unnecessary data",
        explanation: "Pruning lets the engine skip partitions that cannot satisfy the query filter."
      }
    ],
    assignmentTitle: "Storage Architecture Decision",
    assignmentDescription: "Design storage for a company with relational sales data, JSON API data and high-volume logs. Choose formats, storage layers, partitions and a lake/warehouse/lakehouse approach, and explain your decisions."
  },
  {
    title: "Module 3: SQL for Data Engineers",
    description: "Build the SQL skills needed for transformation, quality checks, dimensional loading and DP-700 scenarios.",
    lessons: [
      {
        title: "SELECT, Filter, Aggregate and Group",
        description: "Build confident foundations for reading and summarizing tabular data.",
        objectives: [
          "Write SELECT and WHERE logic",
          "Use aggregate functions and GROUP BY",
          "Handle NULL values deliberately"
        ],
        concepts: [
          "SELECT controls the columns returned; WHERE filters rows before aggregation.",
          "COUNT, SUM, AVG, MIN and MAX summarize groups of rows.",
          "GROUP BY defines the grain of an aggregated result.",
          "NULL means unknown or missing and must be handled explicitly in comparisons and calculations."
        ],
        example: "To calculate monthly revenue, derive a month from order_date, group by that month, and SUM quantity × unit_price. Filter cancelled orders before the aggregation.",
        practice: [
          "Write a query that returns completed orders only.",
          "Calculate revenue by region.",
          "Count customers with missing email addresses."
        ]
      },
      {
        title: "JOINs, CTEs and Window Functions",
        description: "Combine datasets and solve analytical problems without losing row-level detail.",
        objectives: [
          "Use INNER and LEFT JOIN correctly",
          "Use CTEs to make transformations readable",
          "Apply ROW_NUMBER, RANK and running totals"
        ],
        concepts: [
          "INNER JOIN returns matching rows; LEFT JOIN keeps all rows from the left side.",
          "A Common Table Expression breaks complex transformations into named logical steps.",
          "Window functions calculate across related rows without collapsing them into one group.",
          "ROW_NUMBER is useful for deduplication when paired with a deterministic ordering rule."
        ],
        example: "To keep the latest customer record, partition ROW_NUMBER by customer_id and order by updated_at descending, then keep row_number = 1.",
        practice: [
          "Join orders to customers using customer_id.",
          "Create a CTE for valid sales then aggregate it.",
          "Use a window function to create running monthly revenue."
        ]
      },
      {
        title: "SQL Data Quality and Dimensional Preparation",
        description: "Use SQL as a production transformation and validation tool.",
        objectives: [
          "Detect duplicates and broken keys",
          "Prepare data for facts and dimensions",
          "Apply incremental upsert logic conceptually"
        ],
        concepts: [
          "Duplicate detection usually starts by grouping business keys and looking for counts greater than one.",
          "Referential-integrity checks find fact rows whose dimension keys are missing.",
          "Dimensional loads often separate new members from changed members.",
          "MERGE or equivalent patterns can apply inserts and updates, but the match condition must be carefully designed."
        ],
        example: "Before loading FactSales, verify each customer key and product key exists. Route unmatched records to an exception process rather than silently losing them.",
        practice: [
          "Write duplicate-detection logic for order_id.",
          "Write a query that finds sales with no matching customer.",
          "Describe a safe upsert rule for customer records."
        ]
      }
    ],
    quiz: [
      {
        question: "Which join keeps all rows from the left table even when there is no match?",
        options: ["LEFT JOIN", "INNER JOIN", "CROSS APPLY only"],
        correct: "LEFT JOIN",
        explanation: "LEFT JOIN preserves all rows from the left input and returns NULLs for missing matches."
      },
      {
        question: "Which SQL feature is especially useful for deduplicating by latest timestamp?",
        options: ["ROW_NUMBER window function", "DROP TABLE", "GRANT"],
        correct: "ROW_NUMBER window function",
        explanation: "ROW_NUMBER can rank rows within each business key so you can retain the preferred record."
      },
      {
        question: "What does GROUP BY define in an aggregated result?",
        options: ["The grouping grain", "The server password", "The file compression algorithm"],
        correct: "The grouping grain",
        explanation: "GROUP BY determines the dimensions at which aggregates are returned."
      }
    ],
    assignmentTitle: "Build a Sales Transformation in SQL",
    assignmentDescription: "Create customers, products and sales sample tables. Write queries for monthly revenue, top customers, duplicate detection, orphan-key detection and a window-function running total."
  },
  {
    title: "Module 4: Python for Data Engineering",
    description: "Use Python for ingestion, file handling, validation, APIs and automation without turning the course into a software-engineering detour.",
    lessons: [
      {
        title: "Python Essentials for Data Work",
        description: "Learn the small set of Python concepts used constantly in data pipelines.",
        objectives: [
          "Use variables, lists, dictionaries and functions",
          "Write loops and conditions",
          "Structure reusable transformation logic"
        ],
        concepts: [
          "Lists represent ordered collections; dictionaries represent key/value records.",
          "Functions make repeated transformation logic testable and reusable.",
          "Conditions implement business rules such as valid/invalid routing.",
          "Readable code and clear names matter more than clever one-line expressions in production pipelines."
        ],
        example: "A customer record can be represented as a dictionary with customer_id, name and email. A normalize_email function can trim whitespace and convert the address to lowercase.",
        practice: [
          "Create a list of three order dictionaries.",
          "Write a function that calculates line revenue.",
          "Loop over the records and flag negative quantities."
        ]
      },
      {
        title: "Files, APIs and Defensive Validation",
        description: "Ingest external data while handling missing fields, bad responses and malformed records safely.",
        objectives: [
          "Read structured file data conceptually",
          "Understand API request/response patterns",
          "Use validation and exception handling"
        ],
        concepts: [
          "External data should be treated as untrusted until validated.",
          "API ingestion must handle status codes, pagination, rate limits and timeouts.",
          "try/except should handle expected failure modes without hiding programming errors.",
          "Rejected records should be captured with a reason so they can be fixed or replayed."
        ],
        example: "If an API returns HTTP 429, a pipeline may need backoff and retry. If one record lacks customer_id, route it to a rejected-records output instead of crashing the whole batch.",
        practice: [
          "Define required fields for a customer record.",
          "Write pseudocode for API pagination.",
          "List three exceptions or bad-data cases your ingestion should handle."
        ]
      },
      {
        title: "Pandas, Automation and When to Use SQL Instead",
        description: "Choose the right tool and avoid moving large datasets into Python unnecessarily.",
        objectives: [
          "Understand DataFrame-style transformations",
          "Automate a repeatable cleaning flow",
          "Choose between Python and SQL"
        ],
        concepts: [
          "Pandas is useful for local or moderate-size tabular processing and exploration.",
          "SQL is often better when the data already lives in a scalable relational or warehouse engine.",
          "Python is strong for orchestration, APIs, file handling and custom logic.",
          "A good engineer minimizes unnecessary data movement."
        ],
        example: "If 500 million warehouse rows need aggregation, run the aggregation in the warehouse rather than downloading them into a Python process. Use Python to orchestrate the job and validate the result.",
        practice: [
          "Design a CSV cleaning script for names, emails and missing IDs.",
          "Write which steps belong in Python and which could be SQL.",
          "Add logging for accepted and rejected record counts."
        ]
      }
    ],
    quiz: [
      {
        question: "Which Python structure naturally represents a record with named fields?",
        options: ["Dictionary", "Comment", "Loop keyword"],
        correct: "Dictionary",
        explanation: "A dictionary maps field names to values and is a natural fit for JSON-like records."
      },
      {
        question: "What should a robust API pipeline do when rate-limited?",
        options: ["Use controlled retry/backoff", "Ignore every error", "Delete the destination"],
        correct: "Use controlled retry/backoff",
        explanation: "Rate limiting is an expected condition and should be handled with an appropriate retry strategy."
      },
      {
        question: "When is SQL often preferable to local Python processing?",
        options: ["When very large data already lives in a scalable database engine", "When drawing a logo", "When changing a password"],
        correct: "When very large data already lives in a scalable database engine",
        explanation: "Push set-based processing to the platform that already stores and can scale over the data."
      }
    ],
    assignmentTitle: "Python Data Cleaner",
    assignmentDescription: "Create a Python script or detailed pseudocode that reads customer records, normalizes names and emails, validates required fields, separates rejected rows, logs counts and writes clean output."
  },
  {
    title: "Module 5: Data Modelling and Warehousing",
    description: "Design analytical models that are understandable, fast and stable for reporting.",
    lessons: [
      {
        title: "Grain, Facts and Dimensions",
        description: "Learn the most important modelling habit: define exactly what one row represents before designing columns.",
        objectives: [
          "Define fact-table grain",
          "Separate measures from descriptive dimensions",
          "Choose keys for analytical models"
        ],
        concepts: [
          "Grain states what one row in a fact table represents.",
          "Facts contain measurable business events such as quantity, revenue or duration.",
          "Dimensions contain descriptive context such as customer, product, date and location.",
          "Surrogate keys can separate warehouse identity from changing source-system keys."
        ],
        example: "If FactSales grain is one row per order line, order-level totals must not be copied repeatedly without understanding double-counting risk.",
        practice: [
          "Write the grain for a sales fact table.",
          "Classify ten fields as facts or dimension attributes.",
          "Explain why grain must be written before measures are chosen."
        ]
      },
      {
        title: "Star Schemas and Slowly Changing Dimensions",
        description: "Build models that preserve business history where needed.",
        objectives: [
          "Design a star schema",
          "Explain SCD Type 1 and Type 2",
          "Recognize conformed dimensions"
        ],
        concepts: [
          "A star schema connects a central fact table to descriptive dimensions.",
          "SCD Type 1 overwrites an old dimension value when history is not required.",
          "SCD Type 2 creates a new version of the dimension member to preserve history.",
          "Conformed dimensions let multiple fact tables use the same business definition."
        ],
        example: "If a customer moves regions and historical reports must retain the old region for old purchases, a Type 2 customer dimension can preserve both versions.",
        practice: [
          "Draw a star schema for sales.",
          "Choose Type 1 or Type 2 for email, home region and spelling correction.",
          "Identify one dimension that could be shared by sales and support-ticket facts."
        ]
      },
      {
        title: "Loading Dimensions, Facts and Late-Arriving Data",
        description: "Turn a model into a repeatable load process.",
        objectives: [
          "Sequence dimension and fact loads",
          "Handle unknown and late-arriving dimension members",
          "Prepare data for a dimensional model"
        ],
        concepts: [
          "Dimensions commonly load before facts so fact foreign keys can be resolved.",
          "An unknown-member strategy prevents facts from being silently dropped.",
          "Late-arriving dimensions may require inferred members or later key correction.",
          "Business rules should be deterministic so reruns produce the same result."
        ],
        example: "A sale arrives for customer 123 before the customer feed. Load the sale against an unknown or inferred customer member, then update the relationship when the customer record arrives.",
        practice: [
          "Write a load sequence for Date, Customer, Product and Sales.",
          "Define an unknown-member rule.",
          "Describe how you would correct a late-arriving customer."
        ]
      }
    ],
    quiz: [
      {
        question: "What should be defined first when designing a fact table?",
        options: ["Grain", "Font size", "Dashboard colour"],
        correct: "Grain",
        explanation: "Grain defines exactly what one row represents and prevents ambiguous measures."
      },
      {
        question: "Which SCD type preserves historical versions of a dimension member?",
        options: ["Type 2", "Type 1", "Type 0 always"],
        correct: "Type 2",
        explanation: "Type 2 creates a new row/version so history can be retained."
      },
      {
        question: "Why are dimensions often loaded before facts?",
        options: ["So fact foreign keys can be resolved", "To avoid all indexes", "Because facts cannot contain numbers"],
        correct: "So fact foreign keys can be resolved",
        explanation: "Fact rows generally need valid keys to the relevant dimensions."
      }
    ],
    assignmentTitle: "Design a Star Schema",
    assignmentDescription: "Design a star schema for a business with sales and service tickets. Define the grain of each fact, dimensions, measures, keys, one Type 2 attribute and a late-arriving-data rule."
  },
  {
    title: "Module 6: ETL, ELT and Pipeline Orchestration",
    description: "Build reliable, incremental and restartable pipelines instead of one-time scripts.",
    lessons: [
      {
        title: "ETL vs ELT and Full vs Incremental Loads",
        description: "Choose where transformations run and how much data should move each time.",
        objectives: [
          "Differentiate ETL and ELT",
          "Choose full or incremental loading",
          "Understand watermarks and change tracking"
        ],
        concepts: [
          "ETL transforms before loading into the analytical target.",
          "ELT loads data first and transforms with the target platform's compute.",
          "Full loads reprocess all relevant data and are simple but can be expensive.",
          "Incremental loads process only new or changed data, commonly using timestamps, versions or change-data-capture information."
        ],
        example: "A daily orders pipeline can persist the largest successfully processed modified_at value and request only records newer than that watermark on the next run.",
        practice: [
          "Choose ETL or ELT for three scenarios.",
          "Define a watermark for an orders table.",
          "Describe how deletes would be captured."
        ]
      },
      {
        title: "Idempotency, Upserts, Retries and Dependencies",
        description: "Make pipelines safe to rerun after partial failure.",
        objectives: [
          "Explain idempotent processing",
          "Design upsert logic",
          "Use retries only for appropriate failure types"
        ],
        concepts: [
          "An idempotent pipeline can be rerun without creating unintended duplicates or corruption.",
          "Upsert logic inserts new records and updates existing records using a stable match key.",
          "Transient failures may be retried; deterministic data errors should usually be quarantined or fixed.",
          "Dependencies define which tasks must succeed before downstream work begins."
        ],
        example: "If a load fails after writing 80% of rows, restarting should not duplicate the first 80%. A staged load plus MERGE is one common approach.",
        practice: [
          "Design a rerunnable daily orders load.",
          "Classify three errors as retryable or non-retryable.",
          "Draw a dependency graph for ingest → validate → transform → publish."
        ]
      },
      {
        title: "Scheduling, Event Triggers and Pipeline Observability",
        description: "Operate pipelines based on business needs and know when something goes wrong.",
        objectives: [
          "Choose scheduled or event-driven execution",
          "Track operational pipeline metrics",
          "Define alerting and recovery actions"
        ],
        concepts: [
          "Schedules are useful when data arrives predictably or consumers have fixed reporting times.",
          "Event-based triggers can start processing when a file, event or upstream condition appears.",
          "Useful metrics include duration, rows processed, freshness, failure count and retry count.",
          "Alerts should lead to an action, not just create noise."
        ],
        example: "A file-arrival event can trigger ingestion immediately, while a 6:00 AM reconciliation job verifies that all expected files arrived and the daily totals are complete.",
        practice: [
          "Choose schedule or event trigger for four scenarios.",
          "Define five pipeline metrics.",
          "Write an alert rule for a stale daily dataset."
        ]
      }
    ],
    quiz: [
      {
        question: "What is the purpose of an incremental load?",
        options: ["Process only new or changed data", "Always reload every historical row", "Remove all monitoring"],
        correct: "Process only new or changed data",
        explanation: "Incremental loads reduce unnecessary movement and processing."
      },
      {
        question: "What does idempotent mean in a data pipeline?",
        options: ["Safe to rerun without unintended duplicate effects", "Runs only once forever", "Has no dependencies"],
        correct: "Safe to rerun without unintended duplicate effects",
        explanation: "Idempotency is critical for recovery and reliable retries."
      },
      {
        question: "Which failure is most appropriate for automatic retry?",
        options: ["Temporary network timeout", "A permanently invalid required field in every source row", "An incorrect business requirement"],
        correct: "Temporary network timeout",
        explanation: "Retries are best for transient failures likely to succeed later."
      }
    ],
    assignmentTitle: "Incremental Pipeline Design",
    assignmentDescription: "Design an incremental orders pipeline using a watermark or CDC concept. Include staging, validation, upsert logic, retry rules, dependencies, monitoring metrics and a recovery process."
  },
  {
    title: "Module 7: Azure Data Engineering Foundations",
    description: "Map general data-engineering skills onto core Azure storage, identity, networking and orchestration concepts.",
    lessons: [
      {
        title: "Azure Resources, Regions and Managed Identity",
        description: "Understand the Azure building blocks that surround a data platform.",
        objectives: [
          "Explain subscriptions, resource groups and regions",
          "Understand managed identity",
          "Apply least-privilege thinking"
        ],
        concepts: [
          "Azure resources live inside subscriptions and are commonly organized into resource groups.",
          "Region choice affects residency, latency, availability and service support.",
          "Managed identities allow Azure services to authenticate without embedding passwords or keys in code.",
          "RBAC grants permissions to identities at appropriate scopes."
        ],
        example: "A pipeline service can use its managed identity to read a storage account through RBAC, avoiding a storage key inside configuration files.",
        practice: [
          "Sketch subscription → resource group → resources.",
          "List which identity should access a data lake.",
          "Write a least-privilege permission rule."
        ]
      },
      {
        title: "Azure Data Lake Storage, Security and Networking",
        description: "Learn cloud object-storage patterns and how to protect them.",
        objectives: [
          "Explain ADLS-style hierarchical storage",
          "Use RBAC and access controls conceptually",
          "Understand private connectivity and secret management"
        ],
        concepts: [
          "Cloud object storage is designed for durable, scalable storage of files and analytical data.",
          "Folder/container organization should reflect lifecycle and access needs rather than imitate a desktop file system.",
          "Key Vault is designed for secret and key management when secrets are unavoidable.",
          "Private endpoints and network controls can reduce exposure to public networks."
        ],
        example: "Raw ingestion can land in a restricted container while curated outputs have broader read access for analysts. The pipeline identity gets write access only where required.",
        practice: [
          "Design raw, curated and archive paths.",
          "Define reader and writer roles.",
          "Explain where secrets belong if a source cannot use managed identity."
        ]
      },
      {
        title: "Azure Data Factory Concepts and Hybrid Ingestion",
        description: "Understand pipelines, activities, connections and integration runtimes before moving into Fabric orchestration.",
        objectives: [
          "Describe pipelines and activities",
          "Understand connection and dataset concepts",
          "Explain hybrid/on-premises ingestion"
        ],
        concepts: [
          "A pipeline coordinates activities such as copy, notebook execution or stored procedures.",
          "Connections describe how to reach systems; datasets describe the data being used.",
          "Parameters make pipelines reusable across dates, tables and environments.",
          "Hybrid ingestion may require a secure runtime or gateway close to the on-premises source."
        ],
        example: "One parameterized copy pipeline can ingest many tables by receiving source table, destination path and watermark values instead of cloning the pipeline for every table.",
        practice: [
          "Design a parameterized copy pipeline.",
          "List what changes between dev and prod.",
          "Describe how an on-premises SQL source could be reached securely."
        ]
      }
    ],
    quiz: [
      {
        question: "What is a major benefit of managed identity?",
        options: ["Services can authenticate without embedded credentials", "It automatically designs schemas", "It replaces all monitoring"],
        correct: "Services can authenticate without embedded credentials",
        explanation: "Managed identities reduce secret-management risk for supported Azure-to-Azure authentication."
      },
      {
        question: "What does RBAC control?",
        options: ["Which identities can perform which actions at a scope", "CSV delimiter choice only", "Screen resolution"],
        correct: "Which identities can perform which actions at a scope",
        explanation: "Role-based access control assigns permissions to identities."
      },
      {
        question: "Why parameterize a pipeline?",
        options: ["Reuse one design across inputs and environments", "Force all data into one table", "Disable error handling"],
        correct: "Reuse one design across inputs and environments",
        explanation: "Parameters reduce duplication and make orchestration easier to manage."
      }
    ],
    assignmentTitle: "Secure Azure Ingestion Architecture",
    assignmentDescription: "Design a secure path from an on-premises database to cloud analytical storage. Include identity, secrets, networking, ingestion, environment parameters, monitoring and least-privilege access."
  },
  {
    title: "Module 8: Apache Spark and PySpark",
    description: "Learn distributed transformations, DataFrames, partitions, shuffles and performance patterns used heavily in Fabric notebooks.",
    lessons: [
      {
        title: "Distributed Processing and Spark DataFrames",
        description: "Understand why Spark exists before learning syntax.",
        objectives: [
          "Explain distributed processing",
          "Understand Spark DataFrames",
          "Describe lazy evaluation"
        ],
        concepts: [
          "Spark divides large workloads across partitions processed by multiple workers.",
          "A DataFrame represents structured distributed data with a schema.",
          "Transformations such as filter and select build a logical plan.",
          "Lazy evaluation delays execution until an action needs a result."
        ],
        example: "Filtering a large DataFrame and selecting three columns does not necessarily execute immediately. Spark builds a plan and can optimize the work before an action such as write or count.",
        practice: [
          "Write a conceptual DataFrame pipeline: read → filter → select → aggregate → write.",
          "Identify transformations and actions.",
          "Explain why lazy evaluation can help optimization."
        ]
      },
      {
        title: "PySpark Transformations, Joins and Aggregations",
        description: "Apply the Spark operations most commonly used in engineering pipelines.",
        objectives: [
          "Filter and project columns",
          "Join DataFrames safely",
          "Group and aggregate large datasets"
        ],
        concepts: [
          "Select only required columns and filter unnecessary rows early when practical.",
          "Join strategy and key distribution strongly affect performance.",
          "Aggregations may require data movement between workers.",
          "Built-in Spark functions are generally preferable to slow row-by-row custom Python logic."
        ],
        example: "Join sales to a relatively small product dimension, then group by product category and month to calculate revenue. Avoid carrying unused description columns through the full pipeline.",
        practice: [
          "Design a PySpark transformation for sales and products.",
          "List columns needed before the join.",
          "Write the desired output grain."
        ]
      },
      {
        title: "Partitions, Shuffle, Skew and Structured Streaming",
        description: "Recognize the performance and streaming concepts most likely to matter in real pipelines.",
        objectives: [
          "Explain shuffle and data skew",
          "Choose sensible partition strategies",
          "Understand Spark Structured Streaming"
        ],
        concepts: [
          "Shuffle moves data across workers and is often one of the most expensive parts of a Spark job.",
          "Data skew occurs when a small number of keys hold a disproportionate amount of data.",
          "Too few partitions underuse compute; too many tiny partitions create overhead.",
          "Structured Streaming applies DataFrame-style operations to continuously arriving data."
        ],
        example: "If 60% of transactions share one placeholder customer key, a group-by on customer may create a very hot partition. Fixing the bad key or redesigning the transformation may reduce skew.",
        practice: [
          "Identify where a join or group-by causes shuffle.",
          "Describe one skew-detection symptom.",
          "Design a small streaming flow for website events."
        ]
      }
    ],
    quiz: [
      {
        question: "What does Spark lazy evaluation mean?",
        options: ["Transformations build a plan before execution is triggered", "Spark never executes work", "Every line immediately writes to disk"],
        correct: "Transformations build a plan before execution is triggered",
        explanation: "Spark can optimize a set of transformations before an action causes execution."
      },
      {
        question: "What is a shuffle?",
        options: ["Data movement across Spark workers/partitions", "A password rotation method", "A dashboard colour theme"],
        correct: "Data movement across Spark workers/partitions",
        explanation: "Shuffles commonly occur for joins and aggregations and can be expensive."
      },
      {
        question: "What does data skew describe?",
        options: ["Uneven distribution of data across keys/partitions", "Perfectly balanced partitions", "A missing CSS file"],
        correct: "Uneven distribution of data across keys/partitions",
        explanation: "Skew can make a small number of tasks much slower than the rest."
      }
    ],
    assignmentTitle: "PySpark Sales Transformation",
    assignmentDescription: "Create a notebook or pseudocode flow that reads sales and products, validates rows, joins the data, calculates revenue by category and month, and writes a partitioned result. Identify likely shuffles and one optimization."
  },
  {
    title: "Module 9: Microsoft Fabric, OneLake and Lakehouse",
    description: "Move from general concepts into the core Microsoft Fabric data-engineering platform.",
    lessons: [
      {
        title: "Fabric Workspaces, OneLake and Shortcuts",
        description: "Understand the platform boundary, shared storage model and virtualized access patterns.",
        objectives: [
          "Explain Fabric workspaces and OneLake",
          "Describe OneLake shortcuts",
          "Understand when mirroring can reduce custom ingestion"
        ],
        concepts: [
          "A Fabric workspace is a collaboration and governance boundary for Fabric items.",
          "OneLake provides a unified logical data lake across Fabric.",
          "Shortcuts can expose data stored elsewhere without copying it into every workload.",
          "Mirroring can continuously replicate supported operational data into Fabric with less custom pipeline code."
        ],
        example: "Instead of copying the same lake data into multiple projects, a workspace can use a OneLake shortcut so engineering and analytics workloads reference the same governed source.",
        practice: [
          "Draw workspace → OneLake → Lakehouse relationships.",
          "Choose copy, shortcut or mirroring for three scenarios.",
          "List one governance concern when reusing shared data."
        ]
      },
      {
        title: "Lakehouse Tables, Delta and Medallion Design",
        description: "Implement reliable engineering layers on Fabric lake storage.",
        objectives: [
          "Explain Fabric Lakehouse tables",
          "Use Bronze, Silver and Gold patterns",
          "Understand Delta-style transaction capabilities"
        ],
        concepts: [
          "A Fabric Lakehouse combines files and managed analytical tables over OneLake.",
          "Delta-style tables support reliable reads/writes, schema controls and MERGE-style updates.",
          "Bronze/Silver/Gold creates clear contracts between raw, cleaned and business-ready data.",
          "Table design should consider file sizes, partitions and downstream query patterns."
        ],
        example: "Orders land in Bronze unchanged, Silver standardizes timestamps and customer IDs, and Gold creates a sales fact table plus monthly revenue summaries.",
        practice: [
          "Design Bronze, Silver and Gold for customer orders.",
          "Choose a partition key for the large Silver table.",
          "Define a MERGE match key."
        ]
      },
      {
        title: "SQL and PySpark in a Fabric Lakehouse",
        description: "Choose the right transformation language based on the task and workload.",
        objectives: [
          "Use SQL for relational transformations",
          "Use PySpark for scalable engineering logic",
          "Design repeatable notebook transformations"
        ],
        concepts: [
          "SQL is excellent for set-based relational logic and warehouse-style transformations.",
          "PySpark is strong for large-scale file/table processing and flexible programmatic transformations.",
          "Notebooks should be parameterized and operationalized rather than treated as one-off experiments.",
          "Persist business-ready outputs at a clear and documented grain."
        ],
        example: "Use PySpark to standardize many raw files, then SQL to create dimensional Gold tables and quality checks that are easy for analytics engineers to review.",
        practice: [
          "Choose SQL or PySpark for six transformation tasks.",
          "Define notebook parameters for date and environment.",
          "Write the output contract for a Gold sales table."
        ]
      }
    ],
    quiz: [
      {
        question: "What is OneLake?",
        options: ["Fabric's unified logical data lake", "A Python package manager", "A firewall rule"],
        correct: "Fabric's unified logical data lake",
        explanation: "OneLake is the shared storage foundation for Microsoft Fabric."
      },
      {
        question: "What is a major purpose of a OneLake shortcut?",
        options: ["Reference data without unnecessary copying", "Delete all source data", "Replace every security control"],
        correct: "Reference data without unnecessary copying",
        explanation: "Shortcuts provide virtualized access to supported data locations."
      },
      {
        question: "Which language is particularly strong for scalable file/table engineering in Fabric notebooks?",
        options: ["PySpark", "CSS", "SMTP"],
        correct: "PySpark",
        explanation: "PySpark is a central language for distributed transformations in Fabric."
      }
    ],
    assignmentTitle: "Fabric Lakehouse Architecture",
    assignmentDescription: "Design a Fabric workspace and OneLake solution for customer, product and sales data. Include shortcuts or mirroring where appropriate, Bronze/Silver/Gold layers, SQL/PySpark responsibilities and table-partition choices."
  },
  {
    title: "Module 10: Fabric Ingestion, Data Factory and Real-Time Intelligence",
    description: "Cover the DP-700 ingestion and transformation patterns for batch and streaming data.",
    lessons: [
      {
        title: "Choosing Pipelines, Dataflows Gen2 and Notebooks",
        description: "Select the right Fabric transformation/orchestration tool for the job.",
        objectives: [
          "Compare Fabric pipelines, Dataflows Gen2 and notebooks",
          "Design parameterized orchestration",
          "Use schedules and event-based triggers"
        ],
        concepts: [
          "Pipelines coordinate activities, dependencies, parameters and triggers.",
          "Dataflows Gen2 provide a low-code Power Query experience for ingestion and transformation.",
          "Notebooks provide code-first SQL/PySpark flexibility.",
          "The best design often combines orchestration with the transformation engine most appropriate to each step."
        ],
        example: "A pipeline can copy files, invoke a notebook for PySpark cleansing, call a SQL procedure for dimensional loads and publish success/failure metrics.",
        practice: [
          "Choose pipeline, Dataflow Gen2 or notebook for six scenarios.",
          "Design three reusable parameters.",
          "Add a schedule and an event-triggered path."
        ]
      },
      {
        title: "Eventstream, Eventhouse and KQL",
        description: "Learn the Fabric real-time stack and KQL's role in event analytics.",
        objectives: [
          "Understand Eventstream and Eventhouse roles",
          "Use KQL concepts for filtering and aggregation",
          "Apply windowing to streaming scenarios"
        ],
        concepts: [
          "Eventstream ingests and routes continuously arriving events.",
          "Eventhouse is designed for high-volume event and time-series analytical workloads.",
          "KQL is optimized for fast exploration and transformation of telemetry and event data.",
          "Windowing groups streaming events into time-based intervals for aggregation."
        ],
        example: "Website click events flow through Eventstream into Eventhouse. KQL groups events into five-minute windows to calculate active users and error rates.",
        practice: [
          "Design an event path from source to Eventhouse.",
          "Write conceptual KQL steps: filter → extend → summarize.",
          "Choose tumbling or sliding window behavior for a monitoring metric."
        ]
      },
      {
        title: "Full, Incremental and Streaming Loading Patterns",
        description: "Combine batch and streaming principles with real-world bad-data handling.",
        objectives: [
          "Design full and incremental loads in Fabric",
          "Handle duplicates, missing values and late-arriving events",
          "Choose an appropriate transformation engine"
        ],
        concepts: [
          "Full loads can be appropriate for small reference datasets or periodic rebuilds.",
          "Incremental loads reduce processing by using change keys, timestamps or source capabilities.",
          "Streaming pipelines need event-time and late-arrival strategies.",
          "Duplicate and missing records should follow explicit rules rather than accidental engine behaviour."
        ],
        example: "A customer reference table may reload fully each night, while a 2-billion-row events table uses incremental ingestion and event-time windows with a defined late-arrival tolerance.",
        practice: [
          "Choose full, incremental or streaming for six datasets.",
          "Define duplicate handling for event_id.",
          "Define a policy for events arriving 20 minutes late."
        ]
      }
    ],
    quiz: [
      {
        question: "Which Fabric tool is primarily designed to coordinate activities and dependencies?",
        options: ["Pipeline", "Sensitivity label", "Column name"],
        correct: "Pipeline",
        explanation: "Pipelines orchestrate activities and support parameters, scheduling and event-driven execution."
      },
      {
        question: "Which language is central to Fabric Real-Time Intelligence and Eventhouse queries?",
        options: ["KQL", "HTML", "SMTP"],
        correct: "KQL",
        explanation: "KQL is the core query language for high-volume event and telemetry analysis."
      },
      {
        question: "Why do streaming designs need a late-arrival strategy?",
        options: ["Events can arrive after their expected event-time window", "All events always arrive in perfect order", "It changes the UI theme"],
        correct: "Events can arrive after their expected event-time window",
        explanation: "Distributed systems can deliver events out of order or late, so event-time logic needs an explicit policy."
      }
    ],
    assignmentTitle: "Batch + Streaming Fabric Pipeline",
    assignmentDescription: "Design one solution that ingests nightly sales plus real-time website events. Use appropriate Fabric pipelines/Dataflows/notebooks, Eventstream/Eventhouse/KQL, incremental logic, duplicate handling and late-arrival rules."
  },
  {
    title: "Module 11: Fabric Security, Governance and Lifecycle Management",
    description: "Secure data and manage Fabric changes from development through production.",
    lessons: [
      {
        title: "Workspace, Item and Data-Level Security",
        description: "Apply least privilege across Fabric workspaces and analytical data.",
        objectives: [
          "Differentiate workspace and item access",
          "Understand row, column, object and file/folder security",
          "Use masking and OneLake security concepts"
        ],
        concepts: [
          "Workspace roles control broad collaboration capabilities and should not be used as a substitute for fine-grained data security.",
          "Item-level controls restrict access to specific Fabric items.",
          "Row-level, column-level and object-level rules protect sensitive analytical data.",
          "OneLake file/folder controls and dynamic data masking can add additional layers where appropriate."
        ],
        example: "A finance analyst may access the warehouse but see only their region's rows and not the payroll column, while the engineering service identity can load all rows.",
        practice: [
          "Design Admin, Engineer, Analyst and Viewer access.",
          "Choose row or column controls for two sensitive-data cases.",
          "Write a least-privilege rule for a pipeline identity."
        ]
      },
      {
        title: "Governance, Sensitivity, Endorsement and Audit",
        description: "Make data discoverable, trustworthy and traceable.",
        objectives: [
          "Apply sensitivity-label concepts",
          "Understand endorsement and ownership",
          "Use audit and lineage information"
        ],
        concepts: [
          "Sensitivity labels communicate and help enforce handling expectations for sensitive content.",
          "Endorsement signals that an item is promoted or certified for trusted use.",
          "Lineage shows how data moves and transforms across items.",
          "Audit logs help answer who performed an action and when."
        ],
        example: "A certified Gold sales dataset has a named owner, documented definition, sensitivity classification and traceable lineage from source to report.",
        practice: [
          "Classify three datasets by sensitivity.",
          "Define what must be true before a Gold table is certified.",
          "List audit events you would investigate after an unexpected change."
        ]
      },
      {
        title: "Git, Deployment Pipelines and Workspace Configuration",
        description: "Manage Fabric as an engineered product rather than a collection of manually changed items.",
        objectives: [
          "Understand version control and database projects",
          "Use deployment-pipeline concepts",
          "Recognize important workspace settings and orchestration choices"
        ],
        concepts: [
          "Version control provides history, collaboration and review for supported Fabric artifacts.",
          "Database projects can manage warehouse/database schema changes as code.",
          "Deployment pipelines promote tested changes across environments with controlled configuration.",
          "Workspace settings for Spark, domains, OneLake and orchestration services such as Airflow can affect how engineering workloads run."
        ],
        example: "A warehouse schema change is developed in source control, validated in test, then promoted through a deployment pipeline with environment-specific connection settings.",
        practice: [
          "Draw dev → test → prod promotion.",
          "List configuration that should differ by environment.",
          "Define one rollback strategy for a failed release."
        ]
      }
    ],
    quiz: [
      {
        question: "Which principle should guide permission design?",
        options: ["Least privilege", "Give everyone admin", "Anonymous write access"],
        correct: "Least privilege",
        explanation: "Users and services should receive only the permissions required for their responsibilities."
      },
      {
        question: "What is the purpose of lineage?",
        options: ["Show how data moves and transforms between items", "Compress every file", "Create passwords"],
        correct: "Show how data moves and transforms between items",
        explanation: "Lineage supports impact analysis, governance and troubleshooting."
      },
      {
        question: "What is a deployment pipeline used for?",
        options: ["Controlled promotion of changes across environments", "Streaming audio", "Replacing source control"],
        correct: "Controlled promotion of changes across environments",
        explanation: "Deployment pipelines support structured movement from development toward production."
      }
    ],
    assignmentTitle: "Production Security and Deployment Plan",
    assignmentDescription: "Create a security matrix for Admin, Engineer, Analyst and Viewer roles, then design a dev/test/prod release process using version control, deployment pipelines, audit, lineage and a rollback plan."
  },
  {
    title: "Module 12: Monitoring, Optimization, Capstone and DP-700 Readiness",
    description: "Operate a Fabric solution, troubleshoot failures, improve performance and combine everything into an end-to-end capstone.",
    lessons: [
      {
        title: "Monitor Fabric Items and Configure Alerts",
        description: "Know whether ingestion, transformation and downstream refreshes are healthy.",
        objectives: [
          "Monitor ingestion and transformation",
          "Track semantic-model refreshes where relevant",
          "Create actionable alerts"
        ],
        concepts: [
          "Monitoring should cover success/failure, duration, volume, freshness and resource pressure.",
          "A technically successful job can still deliver incomplete or stale data.",
          "Downstream semantic-model refresh status matters when business users depend on the resulting reports.",
          "Alerts should include enough context to identify the failing item, run and next action."
        ],
        example: "A pipeline finishes successfully but writes zero rows. A row-count anomaly alert catches the issue even though the orchestration status is green.",
        practice: [
          "Define six operational metrics.",
          "Create a stale-data alert rule.",
          "Write the minimum context an incident notification should contain."
        ]
      },
      {
        title: "Troubleshoot Pipeline, Notebook, SQL and Real-Time Errors",
        description: "Use evidence and isolation instead of guessing.",
        objectives: [
          "Apply a repeatable troubleshooting sequence",
          "Diagnose common Fabric item failures",
          "Separate source, authentication, schema, capacity and code problems"
        ],
        concepts: [
          "Start with the failing item, timestamp, run ID and exact error.",
          "Check dependencies: source availability, permissions, schema, parameters, capacity and destination state.",
          "Pipeline, Dataflow Gen2, notebook, Eventstream, Eventhouse, T-SQL and OneLake shortcut failures each expose different evidence but can be approached systematically.",
          "Fix root causes and preserve diagnostics rather than blindly rerunning until a job turns green."
        ],
        example: "A shortcut query fails after a source path change. The correct fix is to validate the shortcut target and permissions, not to increase Spark compute.",
        practice: [
          "Build a troubleshooting checklist.",
          "Diagnose three supplied hypothetical failures.",
          "Write which logs or metrics you would inspect first."
        ]
      },
      {
        title: "Optimize Performance and Complete the Capstone",
        description: "Tune the whole solution and prepare for DP-700 scenario questions.",
        objectives: [
          "Optimize Lakehouse, Warehouse, Spark and pipeline performance",
          "Explain engineering trade-offs",
          "Complete an end-to-end capstone and exam-readiness review"
        ],
        concepts: [
          "Lakehouse performance depends on table/file organization, partitions and avoiding excessive small files.",
          "Warehouse/query performance depends on sound modelling, statistics/indexing capabilities, pruning and efficient SQL patterns.",
          "Spark performance depends on partitions, shuffle, skew, caching choices and avoiding unnecessary work.",
          "Pipeline optimization includes concurrency, incremental loading, avoiding repeated copies and choosing the right transformation engine.",
          "DP-700 questions reward scenario judgment: requirements first, product feature second."
        ],
        example: "If a job scans five years of data every hour, the first optimization may be incremental loading and partition pruning—not simply increasing compute.",
        practice: [
          "Identify one optimization at storage, Spark, SQL and orchestration layers.",
          "Explain a trade-off between lower latency and lower cost.",
          "Write a 60-second explanation of your capstone architecture."
        ]
      }
    ],
    quiz: [
      {
        question: "Which monitoring approach is strongest?",
        options: ["Combine run status with freshness, volume and performance metrics", "Track only whether the UI is open", "Ignore downstream refreshes"],
        correct: "Combine run status with freshness, volume and performance metrics",
        explanation: "Production health requires both technical execution signals and data-quality/freshness signals."
      },
      {
        question: "What should troubleshooting start with?",
        options: ["Evidence from the exact failing run and dependencies", "Random configuration changes", "Deleting the destination"],
        correct: "Evidence from the exact failing run and dependencies",
        explanation: "A systematic evidence-first approach isolates root causes faster and avoids creating new problems."
      },
      {
        question: "Which is often the best first optimization for a pipeline that reprocesses years of unchanged data every hour?",
        options: ["Introduce incremental loading and pruning", "Increase every cluster size immediately", "Add more duplicate copies"],
        correct: "Introduce incremental loading and pruning",
        explanation: "Avoiding unnecessary work usually produces better cost/performance than simply adding compute."
      }
    ],
    assignmentTitle: "Capstone: Build and Defend a Fabric Data Platform",
    assignmentDescription: "Design an end-to-end solution for a fictional Saint Lucia retail and services company. Include batch and streaming ingestion, OneLake/Lakehouse/Warehouse choices, SQL and PySpark transformations, KQL real-time analytics, dimensional modelling, incremental loading, security, deployment, monitoring, troubleshooting and performance optimization. Submit an architecture diagram plus a two-page technical explanation."
  }
];

function buildLessonContent(moduleTitle: string, lesson: LessonSeed): string {
  const lines: string[] = [
    "# " + lesson.title,
    "",
    lesson.description,
    "",
    "## Why this matters",
    "This lesson connects directly to real data-engineering work. Focus on understanding the decision being made, not memorizing product names.",
    "",
    "## Learning objectives"
  ];

  lesson.objectives.forEach((item) => lines.push("- " + item));

  lines.push("", "## Explain it simply");
  lesson.concepts.forEach((item) => lines.push("- " + item));

  lines.push(
    "",
    "## Worked example",
    lesson.example,
    "",
    "## Hands-on practice"
  );
  lesson.practice.forEach((item, index) => lines.push((index + 1) + ". " + item));

  lines.push(
    "",
    "## Check yourself",
    "> Can you explain the main idea in your own words without looking back? If not, repeat the worked example before moving on.",
    "",
    "## Key takeaways"
  );
  lesson.objectives.forEach((item) => lines.push("- " + item));

  lines.push(
    "",
    "## Course connection",
    "You are building toward the capstone in Module 12. Keep your notes, diagrams, SQL and pseudocode because later modules reuse these ideas.",
    "",
    "Module context: " + moduleTitle
  );

  return lines.join("\n");
}

function makeQuestion(moduleIndex: number, questionIndex: number, quizId: string, seed: QuizQuestionSeed) {
  return {
    id: "de-q-" + (moduleIndex + 1) + "-" + (questionIndex + 1),
    quizId,
    questionText: seed.question,
    questionType: "multiple_choice",
    options: seed.options,
    correctAnswer: seed.correct,
    explanation: seed.explanation,
    orderNumber: questionIndex + 1
  };
}

export function ensureDataEngineeringCourse(db: any): boolean {
  if (!db || !Array.isArray(db.courses) || !Array.isArray(db.publishingLogs)) return false;

  // The log entry doubles as a one-time migration marker. If an administrator
  // deliberately deletes this course later, a restart must respect that choice
  // rather than silently recreating it.
  const alreadySeeded = db.publishingLogs.some((log: any) => log.id === "de-course-seed-log-v1");
  if (alreadySeeded) return false;
  if (db.courses.some((course: any) => course.id === DATA_ENGINEERING_COURSE_ID)) return false;

  const createdAt = "2026-09-23T13:30:00.000Z";

  const course = {
    id: DATA_ENGINEERING_COURSE_ID,
    slug: "data-engineering-foundations-to-microsoft-fabric-dp-700",
    title: "Data Engineering Foundations to Microsoft Fabric (DP-700 Prep)",
    shortDescription: "A beginner-friendly, hands-on path from data-engineering fundamentals to Microsoft Fabric and DP-700 readiness.",
    fullDescription: "Learn data engineering from the ground up using simple explanations, practical exercises and a complete capstone. The course starts with pipelines, storage, SQL, Python and dimensional modelling, then moves into Azure foundations, Apache Spark, Microsoft Fabric, OneLake, Lakehouse, Data Factory, real-time intelligence with KQL, security, lifecycle management, monitoring and optimization. It is designed to make Microsoft data-engineering training easier to understand and to prepare learners for the Microsoft Fabric Data Engineer Associate DP-700 skill areas.",
    category: "General",
    difficultyLevel: "Beginner",
    instructor: "V79 Academy",
    courseVersion: "1.0.0",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    estimatedDuration: "48 hours",
    prerequisites: [
      "Basic computer literacy",
      "No previous data-engineering experience required",
      "Helpful but optional: basic Excel or database familiarity"
    ],
    learningObjectives: [
      "Explain modern data architectures and pipeline patterns",
      "Write practical SQL transformations and data-quality checks",
      "Use Python and PySpark concepts for data processing",
      "Design dimensional models, incremental loads and reliable orchestration",
      "Build with Microsoft Fabric, OneLake, Lakehouse, Warehouse and Data Factory",
      "Use KQL and real-time processing concepts",
      "Secure, govern, monitor and optimize an analytics solution",
      "Complete an end-to-end capstone aligned to DP-700 scenarios"
    ],
    learning_objectives: [
      "Explain modern data architectures and pipeline patterns",
      "Write practical SQL transformations and data-quality checks",
      "Use Python and PySpark concepts for data processing",
      "Design dimensional models, incremental loads and reliable orchestration",
      "Build with Microsoft Fabric, OneLake, Lakehouse, Warehouse and Data Factory",
      "Use KQL and real-time processing concepts",
      "Secure, govern, monitor and optimize an analytics solution",
      "Complete an end-to-end capstone aligned to DP-700 scenarios"
    ],
    status: "Published",
    pricingType: "free",
    price: 0,
    createdAt,
    updatedAt: createdAt
  };

  db.courses.push(course);

  modules.forEach((moduleSeed, moduleIndex) => {
    const moduleNumber = moduleIndex + 1;
    const moduleId = "de-mod-" + moduleNumber;

    db.modules.push({
      id: moduleId,
      courseId: DATA_ENGINEERING_COURSE_ID,
      title: moduleSeed.title,
      description: moduleSeed.description,
      orderNumber: moduleNumber
    });

    moduleSeed.lessons.forEach((lessonSeed, lessonIndex) => {
      const lessonNumber = lessonIndex + 1;
      const lessonId = "de-les-" + moduleNumber + "-" + lessonNumber;

      db.lessons.push({
        id: lessonId,
        moduleId,
        courseId: DATA_ENGINEERING_COURSE_ID,
        title: lessonSeed.title,
        description: lessonSeed.description,
        learningObjectives: lessonSeed.objectives,
        learning_objectives: lessonSeed.objectives,
        estimatedTime: lessonIndex === 2 ? "50 mins" : "40 mins",
        lessonContent: buildLessonContent(moduleSeed.title, lessonSeed),
        videoUrl: "",
        audioUrl: "",
        imageUrls: [],
        downloads: [],
        exercisePrompt: lessonSeed.practice.join(" "),
        orderNumber: lessonNumber
      });
    });

    const assessmentLessonId = "de-les-" + moduleNumber + "-3";
    const quizId = "de-quiz-" + moduleNumber;

    db.quizzes.push({
      id: quizId,
      lessonId: assessmentLessonId,
      title: moduleSeed.title.replace(/^Module \d+:\s*/, "") + " Knowledge Check",
      passingScore: 67,
      questions: moduleSeed.quiz.map((question, index) =>
        makeQuestion(moduleIndex, index, quizId, question)
      )
    });

    db.assignments.push({
      id: "de-assign-" + moduleNumber,
      courseId: DATA_ENGINEERING_COURSE_ID,
      moduleId,
      lessonId: assessmentLessonId,
      title: moduleSeed.assignmentTitle,
      description: moduleSeed.assignmentDescription,
      maxPoints: 100,
      submissionType: "text",
      createdAt,
      updatedAt: createdAt
    });
  });

  db.publishingLogs.push({
    id: "de-course-seed-log-v1",
    courseId: DATA_ENGINEERING_COURSE_ID,
    courseTitle: course.title,
    event: "Course Seeded",
    fromStatus: "None",
    toStatus: "Published",
    performedBy: "Admin",
    timestamp: createdAt,
    details: "Added the beginner-to-DP-700 Data Engineering curriculum as an editable V79 Academy course."
  });

  return true;
}
