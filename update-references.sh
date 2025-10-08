#!/bin/bash

# Script to update all file references from old capitalized names to new lowercase kebab-case
# Also updates paths to include new subfolder structure

# Map of old filenames to new paths (relative to one/)
declare -A file_map=(
  # Documentation and main files
  ["Documentation-Map.md"]="connections/documentation.md"
  ["Modes.md"]="connections/modes.md"
  ["Development.md"]="connections/development.md"
  ["Rules.md"]="things/rules.md"
  ["Workflow.md"]="connections/workflow.md"
  ["Patterns.md"]="connections/patterns.md"
  ["Architecture.md"]="things/architecture.md"
  ["Frontend.md"]="things/frontend.md"
  ["Middleware.md"]="connections/middleware.md"
  ["Hono.md"]="things/hono.md"
  ["Files.md"]="things/files.md"
  ["Strategy.md"]="things/strategy.md"
  ["Ontology.md"]="connections/ontology.md"
  ["Dashboard.md"]="connections/dashboard.md"
  ["Specifications.md"]="things/specifications.md"
  ["Implementation.md"]="connections/implementation.md"

  # Protocol files
  ["README-Protocols.md"]="connections/protocols.md"
  ["A2A.md"]="connections/a2a.md"
  ["ACP.md"]="connections/acp.md"
  ["AP2.md"]="connections/ap2.md"
  ["X402.md"]="connections/x402.md"
  ["ACPayments.md"]="connections/acpayments.md"
  ["AGUI.md"]="connections/agui.md"

  # Integration files
  ["Agent-Communications.md"]="connections/communications.md"
  ["ElizaOS.md"]="things/elizaos.md"
  ["CopilotKit.md"]="things/copilotkit.md"
  ["PromptKit.md"]="things/promptkit.md"
  ["MCP.md"]="connections/mcp.md"
  ["N8N.md"]="connections/n8n.md"

  # Architecture and design
  ["Architecture Diagram.md"]="things/architecture-diagram.md"
  ["Service Layer.md"]="connections/service-layer.md"
  ["Service Providers.md"]="things/service-providers.md"
  ["Service Providers - New.md"]="things/service-providers---new.md"

  # Content and features
  ["Components.md"]="things/components.md"
  ["Componets.md"]="things/componets.md"
  ["CLI.md"]="things/cli.md"
  ["CLI Code.md"]="things/cli-code.md"
  ["CLI Compiler Code.md"]="things/cli-compiler-code.md"
  ["DSL.md"]="things/dsl.md"
  ["ONE DSL.md"]="things/one-dsl.md"
  ["ONE DSL English.md"]="things/one-dsl-english.md"

  # Schema and data
  ["Schema.md"]="connections/schema.md"
  ["Connections.md"]="connections/connections.md"
  ["Relationships.md"]="connections/relationships.md"
  ["Ontology-Documentation.md"]="connections/ontology-documentation.md"

  # Business and features
  ["Multitenant.md"]="connections/multitenant.md"
  ["Workflow Examples.md"]="connections/workflow-examples.md"
  ["Implementation Examples.md"]="things/implementation-examples.md"
  ["Creator Diagram.md"]="things/creator-diagram.md"

  # Blockchain and crypto
  ["CryptoNetworks.md"]="connections/cryptonetworks.md"
  ["SUI.md"]="things/sui.md"

  # People and orgs
  ["Owner.md"]="people/owner.md"
  ["Organisation.md"]="people/organisation.md"

  # Things
  ["Things.md"]="things/things.md"
  ["AgentClone.md"]="things/agentclone.md"
  ["AgentKit.md"]="things/agentkit.md"
  ["AgentSales.md"]="things/agentsales.md"
  ["Designer.md"]="things/designer.md"

  # Knowledge and scoring
  ["INFERENCE_SCORE.md"]="things/inference_score.md"
  ["Score.md"]="knowledge/score.md"
  ["Tags.md"]="knowledge/tags.md"

  # Other
  ["API.md"]="connections/api.md"
  ["API-docs.md"]="connections/api-docs.md"
  ["Effect.md"]="connections/effect.md"
  ["Inference.md"]="connections/inference.md"
  ["KYC.md"]="connections/kyc.md"
  ["Membership.md"]="connections/membership.md"
  ["Revenue.md"]="things/revenue.md"
  ["TODO.md"]="things/todo.md"
  ["Vectors.md"]="connections/vectors.md"
  ["ACPS.md"]="connections/acps.md"

  # Special cases
  ["STRUCTURE.md"]="things/files.md"
  ["Migration-Guide.md"]="connections/migration-guide.md"
)

# Files to update
files_to_update=(
  "CLAUDE.md"
  "AGENTS.md"
  ".claude/hooks/pre.sh"
  ".claude/hooks/post.sh"
)

# Add all markdown files in one/ directory
while IFS= read -r -d '' file; do
  files_to_update+=("$file")
done < <(find one/ -name "*.md" -type f -print0)

echo "Updating file references..."

for file in "${files_to_update[@]}"; do
  if [ ! -f "$file" ]; then
    continue
  fi

  echo "Processing: $file"

  # Create backup
  cp "$file" "$file.bak"

  # Update each mapping
  for old_name in "${!file_map[@]}"; do
    new_path="${file_map[$old_name]}"

    # Replace various reference patterns
    # Pattern 1: one/OldName.md -> one/new-path.md
    sed -i '' "s|one/$old_name|one/$new_path|g" "$file"

    # Pattern 2: ./OldName.md -> ./new-path.md (for relative references within one/)
    sed -i '' "s|\\./$old_name|./${new_path##*/}|g" "$file"

    # Pattern 3: OldName without path -> just filename (for links in same directory)
    # This is trickier and needs context awareness
  done
done

echo "Done! Backups created with .bak extension"
echo "Review changes and remove .bak files when satisfied"
