#!/bin/bash
# validate-agent.sh
# Validates Claude Code agent structure and YAML frontmatter
# Usage: ./validate-agent.sh path/to/agent.md

set -e

AGENT_FILE="$1"

if [ -z "$AGENT_FILE" ]; then
  echo "❌ Error: No agent file specified"
  echo "Usage: ./validate-agent.sh path/to/agent.md"
  exit 1
fi

if [ ! -f "$AGENT_FILE" ]; then
  echo "❌ Error: File not found: $AGENT_FILE"
  exit 1
fi

echo "🔍 Validating agent: $AGENT_FILE"
echo ""

# Validation counters
ERRORS=0
WARNINGS=0

# Extract YAML frontmatter (between first --- and second ---)
YAML_CONTENT=$(awk '/^---$/{flag=!flag; next} flag' "$AGENT_FILE" | head -n 20)

if [ -z "$YAML_CONTENT" ]; then
  echo "❌ CRITICAL: No YAML frontmatter found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ YAML frontmatter detected"
fi

# Validate required YAML fields
echo ""
echo "📋 Checking required YAML fields..."

# Check 'name' field
if echo "$YAML_CONTENT" | grep -q "^name:"; then
  AGENT_NAME=$(echo "$YAML_CONTENT" | grep "^name:" | cut -d':' -f2- | xargs)

  # Check kebab-case format
  if [[ "$AGENT_NAME" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
    echo "  ✅ name: $AGENT_NAME (valid kebab-case)"
  else
    echo "  ❌ name: $AGENT_NAME (INVALID - must be kebab-case)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ❌ 'name' field is MISSING"
  ERRORS=$((ERRORS + 1))
fi

# Check 'description' field
if echo "$YAML_CONTENT" | grep -q "^description:"; then
  DESCRIPTION=$(echo "$YAML_CONTENT" | grep "^description:" | cut -d':' -f2- | xargs)

  # Check if starts with "Use this agent when"
  if [[ "$DESCRIPTION" == "Use this agent when"* ]]; then
    echo "  ✅ description starts with 'Use this agent when...'"
  else
    echo "  ⚠️  description does NOT start with 'Use this agent when...' (recommended)"
    WARNINGS=$((WARNINGS + 1))
  fi

  # Check for examples
  if echo "$DESCRIPTION" | grep -q "<example>"; then
    EXAMPLE_COUNT=$(echo "$DESCRIPTION" | grep -o "<example>" | wc -l)
    if [ "$EXAMPLE_COUNT" -ge 2 ]; then
      echo "  ✅ description contains $EXAMPLE_COUNT examples"
    else
      echo "  ⚠️  description contains only $EXAMPLE_COUNT example(s) (2-3 recommended)"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo "  ❌ description has NO examples (REQUIRED)"
    ERRORS=$((ERRORS + 1))
  fi

  # Check for commentary tags
  if echo "$DESCRIPTION" | grep -q "<commentary>"; then
    echo "  ✅ description includes <commentary> tags"
  else
    echo "  ❌ description missing <commentary> tags (REQUIRED)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ❌ 'description' field is MISSING"
  ERRORS=$((ERRORS + 1))
fi

# Check 'model' field
if echo "$YAML_CONTENT" | grep -q "^model:"; then
  MODEL=$(echo "$YAML_CONTENT" | grep "^model:" | cut -d':' -f2 | xargs)
  if [ "$MODEL" == "sonnet" ]; then
    echo "  ✅ model: sonnet (recommended)"
  else
    echo "  ⚠️  model: $MODEL (sonnet is recommended)"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "  ❌ 'model' field is MISSING"
  ERRORS=$((ERRORS + 1))
fi

# Check 'color' field
if echo "$YAML_CONTENT" | grep -q "^color:"; then
  COLOR=$(echo "$YAML_CONTENT" | grep "^color:" | cut -d':' -f2 | xargs)

  VALID_COLORS=("red" "blue" "yellow" "green" "pink" "purple" "orange" "gray" "brown" "cyan" "magenta")
  if [[ " ${VALID_COLORS[@]} " =~ " ${COLOR} " ]]; then
    echo "  ✅ color: $COLOR (valid)"
  else
    echo "  ❌ color: $COLOR (INVALID - see color-conventions.md)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ❌ 'color' field is MISSING"
  ERRORS=$((ERRORS + 1))
fi

# Validate agent structure sections
echo ""
echo "📐 Checking agent structure sections..."

REQUIRED_SECTIONS=(
  "# IDENTITY & ROLE"
  "## Core Mission"
  "## Authority & Boundaries"
  "# ITERATIVE WORKFLOW v2.0"
  "## Your Workspace"
  "# 🎯 MANDATORY SKILL INVOCATION"
  "# QUICK REFERENCE"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
  if grep -q "^$section" "$AGENT_FILE"; then
    echo "  ✅ Found: $section"
  else
    echo "  ❌ MISSING: $section"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check for skill invocation
if grep -q "Skill: " "$AGENT_FILE"; then
  echo "  ✅ Contains skill invocation pattern"
else
  echo "  ⚠️  No skill invocation found (recommended: 'Skill: {agent-name}-skill')"
  WARNINGS=$((WARNINGS + 1))
fi

# Check file size (should be ~150 lines)
LINE_COUNT=$(wc -l < "$AGENT_FILE")
echo ""
echo "📏 Agent file metrics:"
echo "  Lines: $LINE_COUNT"

if [ "$LINE_COUNT" -gt 250 ]; then
  echo "  ⚠️  Agent is quite long (>250 lines). Consider moving content to skill."
  WARNINGS=$((WARNINGS + 1))
elif [ "$LINE_COUNT" -lt 80 ]; then
  echo "  ⚠️  Agent is quite short (<80 lines). May be missing required sections."
  WARNINGS=$((WARNINGS + 1))
else
  echo "  ✅ Length is reasonable (80-250 lines)"
fi

# Final summary
echo ""
echo "═══════════════════════════════════════"
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo "✅ VALIDATION PASSED - Agent is valid!"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo "⚠️  VALIDATION PASSED WITH WARNINGS"
  echo "Warnings: $WARNINGS"
  exit 0
else
  echo "❌ VALIDATION FAILED"
  echo "Errors: $ERRORS"
  echo "Warnings: $WARNINGS"
  exit 1
fi
