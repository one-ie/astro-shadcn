// ============================================================================
// src/commands/create-feature.ts
// Command: one create-feature <file>
// ============================================================================

import { Command } from "commander";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { PlainEnglishParser } from "../compiler/parser";
import { ONEValidator } from "../compiler/validator";
import { ONECompiler } from "../compiler/compiler";
import { TestGenerator } from "../compiler/test-generator";
import { loadOntology } from "../utils/ontology-loader";

export const createFeatureCommand = new Command("create-feature")
  .description("Create a new feature from Plain English DSL")
  .argument("<file>", "Path to .english or .one file")
  .option("-v, --validate-only", "Only validate, don't generate code")
  .option("-o, --output <dir>", "Output directory", "./generated")
  .option("--no-tests", "Skip test generation")
  .option("--dry-run", "Show what would be generated without writing files")
  .action(async (file: string, options) => {
    const spinner = ora("Loading feature spec...").start();

    try {
      // Step 1: Read Plain English file
      const englishSpec = fs.readFileSync(file, "utf-8");
      spinner.succeed(`Loaded ${chalk.cyan(file)}`);

      // Step 2: Parse Plain English → Technical DSL
      spinner.start("Parsing Plain English...");
      const parser = new PlainEnglishParser();
      const technicalDSL = parser.parse(englishSpec);
      spinner.succeed(
        `Parsed into Technical DSL (${technicalDSL.flow.length} steps)`
      );

      // Step 3: Load ontology
      spinner.start("Loading ontology...");
      const ontology = await loadOntology();
      spinner.succeed("Ontology loaded");

      // Step 4: Validate against ontology
      spinner.start("Validating against ontology...");
      const validator = new ONEValidator(ontology);
      const validation = validator.validate(technicalDSL);

      if (!validation.valid) {
        spinner.fail("Validation failed");
        console.log(chalk.red("\nValidation Errors:"));
        validation.errors.forEach((error, i) => {
          console.log(chalk.red(`  ${i + 1}. ${error}`));
        });
        process.exit(1);
      }

      spinner.succeed("Validation passed");

      if (options.validateOnly) {
        console.log(chalk.green("\n✓ Feature is valid!"));
        return;
      }

      // Step 5: Compile to TypeScript
      spinner.start("Compiling to TypeScript...");
      const compiler = new ONECompiler();
      const generatedCode = compiler.compile(technicalDSL);
      spinner.succeed("TypeScript generated");

      // Step 6: Generate tests
      let testCode = "";
      if (options.tests) {
        spinner.start("Generating tests...");
        const testGen = new TestGenerator();
        testCode = testGen.generate(technicalDSL);
        spinner.succeed("Tests generated");
      }

      // Step 7: Write files
      if (options.dryRun) {
        console.log(chalk.yellow("\n=== DRY RUN - Files that would be created ===\n"));
        console.log(chalk.cyan("Service:"));
        console.log(`  ${getServicePath(technicalDSL.feature, options.output)}`);
        
        if (options.tests) {
          console.log(chalk.cyan("\nTests:"));
          console.log(`  ${getTestPath(technicalDSL.feature, options.output)}`);
        }
        
        console.log(chalk.cyan("\nMutation:"));
        console.log(`  ${getMutationPath(technicalDSL.feature, options.output)}`);
        
        console.log(chalk.cyan("\nComponent:"));
        console.log(`  ${getComponentPath(technicalDSL.feature, options.output)}`);
        
        return;
      }

      spinner.start("Writing files...");

      // Write service
      const servicePath = getServicePath(technicalDSL.feature, options.output);
      writeFile(servicePath, generatedCode.service);

      // Write mutation
      const mutationPath = getMutationPath(technicalDSL.feature, options.output);
      writeFile(mutationPath, generatedCode.mutation);

      // Write component
      const componentPath = getComponentPath(technicalDSL.feature, options.output);
      writeFile(componentPath, generatedCode.component);

      // Write tests
      if (options.tests) {
        const testPath = getTestPath(technicalDSL.feature, options.output);
        writeFile(testPath, testCode);
      }

      spinner.succeed("Files written");

      // Success summary
      console.log(chalk.green("\n✓ Feature created successfully!\n"));
      console.log(chalk.bold("Generated files:"));
      console.log(`  ${chalk.cyan(servicePath)}`);
      console.log(`  ${chalk.cyan(mutationPath)}`);
      console.log(`  ${chalk.cyan(componentPath)}`);
      if (options.tests) {
        console.log(`  ${chalk.cyan(testPath)}`);
      }

      console.log(chalk.bold("\nNext steps:"));
      console.log(`  1. Review generated code`);
      console.log(`  2. Run tests: ${chalk.cyan("npm test")}`);
      console.log(`  3. Deploy: ${chalk.cyan("convex deploy")}`);
    } catch (error: any) {
      spinner.fail("Failed to create feature");
      console.error(chalk.red(`\n${error.message}`));
      if (error.stack) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// ============================================================================
// src/compiler/parser.ts
// Parses Plain English → Technical DSL
// ============================================================================

export class PlainEnglishParser {
  parse(englishSpec: string): any {
    const lines = englishSpec.split("\n").map((l) => l.trim());

    let feature = "";
    let input: any = {};
    let output: any = {};
    let flow: any[] = [];

    let currentSection = "";
    let currentStep: any = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines and comments
      if (!line || line.startsWith("//")) continue;

      // Parse FEATURE
      if (line.startsWith("FEATURE:")) {
        feature = line.replace("FEATURE:", "").trim();
        continue;
      }

      // Parse INPUT section
      if (line === "INPUT:") {
        currentSection = "input";
        continue;
      }

      // Parse OUTPUT section
      if (line === "OUTPUT:") {
        currentSection = "output";
        continue;
      }

      // Parse FLOW section
      if (line === "FLOW:") {
        currentSection = "flow";
        continue;
      }

      // Parse input/output items
      if (currentSection === "input" && line.startsWith("-")) {
        const [name, description] = this.parseListItem(line);
        input[name] = description;
        continue;
      }

      if (currentSection === "output" && line.startsWith("-")) {
        const [name, description] = this.parseListItem(line);
        output[name] = description;
        continue;
      }

      // Parse flow commands
      if (currentSection === "flow") {
        const step = this.parseFlowCommand(line, lines, i);
        if (step) {
          flow.push(step);
        }
      }
    }

    return {
      feature,
      input,
      output,
      flow,
    };
  }

  private parseListItem(line: string): [string, string] {
    // "- name: description"
    const match = line.match(/^-\s*([^:]+):\s*(.+)$/);
    if (match) {
      return [match[1].trim(), match[2].trim()];
    }
    return ["", ""];
  }

  private parseFlowCommand(line: string, lines: string[], index: number): any {
    // CHECK
    if (line.startsWith("CHECK ")) {
      const condition = line.replace("CHECK ", "").trim();
      const otherwiseLine = lines[index + 1];
      let otherwise = null;

      if (otherwiseLine && otherwiseLine.trim().startsWith("OTHERWISE")) {
        otherwise = otherwiseLine.replace("OTHERWISE", "").trim();
      }

      return {
        validate: this.parseCondition(condition),
        onError: otherwise ? { return: { error: otherwise } } : undefined,
      };
    }

    // CREATE
    if (line.startsWith("CREATE ")) {
      const match = line.match(/CREATE\s+(\w+)\s+called\s+"([^"]+)"/);
      if (match) {
        return {
          entity: {
            type: this.normalizeEntityType(match[1]),
            name: match[2],
            properties: {},
            status: "active",
          },
        };
      }
    }

    // CONNECT
    if (line.startsWith("CONNECT ")) {
      const match = line.match(/CONNECT\s+(.+)\s+to\s+(.+)\s+as\s+(\w+)/);
      if (match) {
        return {
          connect: {
            from: this.parseReference(match[1]),
            to: this.parseReference(match[2]),
            type: this.normalizeConnectionType(match[3]),
          },
        };
      }
    }

    // RECORD
    if (line.startsWith("RECORD ")) {
      const match = line.match(/RECORD\s+(.+?)(\s+BY\s+(.+))?$/);
      if (match) {
        return {
          event: {
            type: this.normalizeEventType(match[1]),
            actor: match[3] ? this.parseReference(match[3]) : undefined,
            metadata: {},
          },
        };
      }
    }

    // CALL
    if (line.startsWith("CALL ")) {
      const match = line.match(/CALL\s+(\w+)\s+to\s+(.+?)(\s+WITH\s+(.+?))?(\s+SAVE AS\s+(.+))?$/);
      if (match) {
        return {
          service: {
            provider: match[1].toLowerCase(),
            method: this.toMethodName(match[2]),
            params: match[4] ? this.parseParams(match[4]) : {},
            output: match[6] ? match[6].trim() : undefined,
          },
        };
      }
    }

    // GET
    if (line.startsWith("GET ")) {
      const match = line.match(/GET\s+(.+?)\s+WHERE\s+(.+?)(\s+SAVE AS\s+(.+))?$/);
      if (match) {
        return {
          query: {
            from: this.inferTableFromQuery(match[1]),
            where: this.parseWhereConditions(match[2]),
            output: match[4] ? match[4].trim() : undefined,
          },
        };
      }
    }

    // IF
    if (line.startsWith("IF ")) {
      const condition = line.replace("IF ", "").trim();
      return {
        if: {
          condition: this.parseCondition(condition),
          then: [],
          else: [],
        },
      };
    }

    // GIVE (return)
    if (line.startsWith("GIVE ")) {
      const results = line.replace("GIVE ", "").trim();
      return {
        return: this.parseReturnValue(results),
      };
    }

    // WAIT
    if (line.startsWith("WAIT ")) {
      const duration = line.replace("WAIT ", "").trim();
      return {
        wait: this.parseDuration(duration),
      };
    }

    return null;
  }

  private normalizeEntityType(type: string): string {
    const map: Record<string, string> = {
      "ai clone": "ai_clone",
      "audience member": "audience_member",
      token: "token",
      creator: "creator",
      course: "course",
      content: "blog_post",
    };
    return map[type.toLowerCase()] || type.toLowerCase();
  }

  private normalizeConnectionType(type: string): string {
    const map: Record<string, string> = {
      owner: "owns",
      holder: "holds_tokens",
      enrolled: "enrolled_in",
      author: "authored",
    };
    return map[type.toLowerCase()] || type.toLowerCase();
  }

  private normalizeEventType(type: string): string {
    const map: Record<string, string> = {
      "clone created": "clone_created",
      "tokens purchased": "tokens_purchased",
      "course enrolled": "course_enrolled",
      "content published": "content_published",
    };
    return map[type.toLowerCase()] || type.toLowerCase().replace(/\s+/g, "_");
  }

  private parseReference(ref: string): string {
    // "creator" → "$input.creatorId"
    // "clone ID" → "$cloneId"
    return `$${ref.replace(/\s+/g, "")}`;
  }

  private parseCondition(condition: string): any {
    // "creator exists" → { creatorId: { exists: true } }
    // "balance > 0" → { balance: { gt: 0 } }
    return { parsed: condition };
  }

  private parseParams(params: string): any {
    // "amount $100" → { amount: 100 }
    return { raw: params };
  }

  private parseWhereConditions(conditions: string): any[] {
    return [{ field: "parsed", operator: "eq", value: conditions }];
  }

  private inferTableFromQuery(query: string): string {
    if (query.includes("balance")) return "connections";
    if (query.includes("content")) return "entities";
    return "entities";
  }

  private parseReturnValue(results: string): any {
    return { value: results };
  }

  private parseDuration(duration: string): string {
    const map: Record<string, string> = {
      "24 hours": "24h",
      "5 minutes": "5m",
      "1 hour": "1h",
    };
    return map[duration.toLowerCase()] || duration;
  }

  private toMethodName(method: string): string {
    return method.replace(/\s+/g, "");
  }
}

// ============================================================================
// src/compiler/compiler.ts
// Compiles Technical DSL → TypeScript
// ============================================================================

export class ONECompiler {
  compile(dsl: any): { service: string; mutation: string; component: string } {
    const featureName = this.toCamelCase(dsl.feature);
    const FeatureName = this.toPascalCase(dsl.feature);

    // Generate service
    const service = this.generateService(featureName, FeatureName, dsl);

    // Generate mutation
    const mutation = this.generateMutation(featureName, FeatureName, dsl);

    // Generate component
    const component = this.generateComponent(featureName, FeatureName, dsl);

    return { service, mutation, component };
  }

  private generateService(
    featureName: string,
    FeatureName: string,
    dsl: any
  ): string {
    const inputParams = Object.entries(dsl.input)
      .map(([name, _]) => `${this.toCamelCase(name)}: Id<"entities">`)
      .join(", ");

    return `// convex/services/${featureName}.ts
// Generated from ONE DSL
import { Effect } from "effect";
import { ConvexDatabase } from "./core/database";
import { OpenAIProvider, ElevenLabsProvider, StripeProvider } from "./providers";

export class ${FeatureName}Service extends Effect.Service<${FeatureName}Service>()(
  "${FeatureName}Service",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        execute: (${inputParams}) =>
          Effect.gen(function* () {
            // TODO: Implement flow steps
            ${dsl.flow.map((step: any) => this.generateStep(step)).join("\n            ")}

            return { success: true };
          })
      };
    }),
    dependencies: [ConvexDatabase.Default]
  }
) {}
`;
  }

  private generateMutation(
    featureName: string,
    FeatureName: string,
    dsl: any
  ): string {
    const inputArgs = Object.entries(dsl.input)
      .map(([name, _]) => `${this.toCamelCase(name)}: v.id("entities")`)
      .join(",\n    ");

    return `// convex/mutations/${featureName}.ts
import { mutation } from "./_generated/server";
import { confect } from "confect";
import { v } from "convex/values";
import { ${FeatureName}Service } from "../services/${featureName}";
import { MainLayer } from "../services";

export const execute = confect.mutation({
  args: {
    ${inputArgs}
  },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const service = yield* ${FeatureName}Service;
      return yield* service.execute(${Object.keys(dsl.input).map((k) => `args.${this.toCamelCase(k)}`).join(", ")});
    }).pipe(Effect.provide(MainLayer))
});
`;
  }

  private generateComponent(
    featureName: string,
    FeatureName: string,
    dsl: any
  ): string {
    return `// src/components/features/${featureName}/${FeatureName}.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ${FeatureName}() {
  const execute = useMutation(api.${featureName}.execute);

  const handleExecute = async () => {
    try {
      const result = await execute({
        // TODO: Add input parameters
      });
      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>${dsl.feature}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExecute}>Execute</Button>
      </CardContent>
    </Card>
  );
}
`;
  }

  private generateStep(step: any): string {
    if (step.entity) {
      return `// Create entity: ${step.entity.type}`;
    }
    if (step.connect) {
      return `// Create connection: ${step.connect.type}`;
    }
    if (step.event) {
      return `// Log event: ${step.event.type}`;
    }
    return "// Step";
  }

  private toCamelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  }

  private toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }
}

// ============================================================================
// src/utils/file-helpers.ts
// ============================================================================

function getServicePath(feature: string, outputDir: string): string {
  const name = feature.toLowerCase().replace(/\s+/g, "-");
  return path.join(outputDir, "convex", "services", `${name}.ts`);
}

function getMutationPath(feature: string, outputDir: string): string {
  const name = feature.toLowerCase().replace(/\s+/g, "-");
  return path.join(outputDir, "convex", "mutations", `${name}.ts`);
}

function getComponentPath(feature: string, outputDir: string): string {
  const name = feature
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return path.join(outputDir, "src", "components", "features", name, `${name}.tsx`);
}

function getTestPath(feature: string, outputDir: string): string {
  const name = feature.toLowerCase().replace(/\s+/g, "-");
  return path.join(outputDir, "tests", "unit", "services", `${name}.test.ts`);
}

function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

// ============================================================================
// src/cli.ts
// Main CLI entry point
// ============================================================================

import { Command } from "commander";
import { createFeatureCommand } from "./commands/create-feature";

const program = new Command();

program
  .name("one")
  .description("ONE Platform CLI - Build features in Plain English")
  .version("2.0.0");

// Add commands
program.addCommand(createFeatureCommand);

// Other commands can be added here
program
  .command("validate <file>")
  .description("Validate a feature spec without generating code")
  .action((file) => {
    // Delegate to create-feature with --validate-only
    createFeatureCommand.parse(["node", "one", file, "--validate-only"]);
  });

program
  .command("list-features")
  .description("List all available features")
  .action(() => {
    console.log("Available features:");
    // TODO: List features from generated directory
  });

program.parse();