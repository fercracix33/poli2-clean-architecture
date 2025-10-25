#!/bin/bash
# init-agent.sh
# Initializes a new Claude Code agent from template
# Usage: ./init-agent.sh <agent-name> <color> <role-description>

set -e

AGENT_NAME="$1"
COLOR="$2"
ROLE_DESC="$3"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_FILE="$SKILL_DIR/assets/agent-minimal-template.md"
AGENTS_DIR=".claude/agents"

# Validation
if [ -z "$AGENT_NAME" ]; then
  echo "❌ Error: Agent name is required"
  echo ""
  echo "Usage: ./init-agent.sh <agent-name> <color> <role-description>"
  echo ""
  echo "Example:"
  echo "  ./init-agent.sh security-auditor purple 'Security review and vulnerability scanning'"
  echo ""
  echo "Available colors: red, blue, yellow, green, pink, purple, orange, gray"
  exit 1
fi

if [ -z "$COLOR" ]; then
  echo "❌ Error: Color is required"
  echo ""
  echo "Available colors:"
  echo "  red    - Architect/Chief roles"
  echo "  blue   - Testing/QA roles"
  echo "  yellow - Implementation roles"
  echo "  green  - Data/Database roles"
  echo "  pink   - UI/UX roles"
  echo "  purple - Security/Review roles"
  echo "  orange - DevOps/Infrastructure roles"
  echo "  gray   - Utility/Helper roles"
  exit 1
fi

if [ -z "$ROLE_DESC" ]; then
  echo "❌ Error: Role description is required"
  echo ""
  echo "Example: 'Security review and vulnerability scanning'"
  exit 1
fi

# Validate kebab-case
if ! [[ "$AGENT_NAME" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
  echo "❌ Error: Agent name must be kebab-case (lowercase-with-hyphens)"
  echo "Example: security-auditor, test-architect, ui-ux-expert"
  exit 1
fi

# Validate color
VALID_COLORS=("red" "blue" "yellow" "green" "pink" "purple" "orange" "gray")
if [[ ! " ${VALID_COLORS[@]} " =~ " ${COLOR} " ]]; then
  echo "❌ Error: Invalid color '$COLOR'"
  echo "Valid colors: ${VALID_COLORS[*]}"
  exit 1
fi

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "❌ Error: Template file not found: $TEMPLATE_FILE"
  exit 1
fi

# Create agents directory if it doesn't exist
mkdir -p "$AGENTS_DIR"

# Output file
OUTPUT_FILE="$AGENTS_DIR/$AGENT_NAME.md"

# Check if agent already exists
if [ -f "$OUTPUT_FILE" ]; then
  echo "⚠️  Warning: Agent file already exists: $OUTPUT_FILE"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

echo "🚀 Creating new agent: $AGENT_NAME"
echo "   Color: $COLOR"
echo "   Role: $ROLE_DESC"
echo ""

# Create agent title (capitalize each word)
AGENT_TITLE=$(echo "$AGENT_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

# Copy template and replace placeholders
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

# Replace placeholders
# Note: Using different delimiter (|) because description may contain /
sed -i "s|{agent-name}|$AGENT_NAME|g" "$OUTPUT_FILE"
sed -i "s|{color}|$COLOR|g" "$OUTPUT_FILE"
sed -i "s|{Agent Title}|$AGENT_TITLE|g" "$OUTPUT_FILE"
sed -i "s|{one-sentence mission statement}|$ROLE_DESC|g" "$OUTPUT_FILE"

# Provide placeholders for user to fill
sed -i "s|{trigger scenario}|FILL_THIS: When should this agent be used?|g" "$OUTPUT_FILE"
sed -i "s|{key expertise areas}|FILL_THIS: What are this agent's specialties?|g" "$OUTPUT_FILE"
sed -i "s|{domain}|FILL_THIS: Feature domain (tasks, projects, auth, etc.)|g" "$OUTPUT_FILE"
sed -i "s|{feature}|FILL_THIS: Feature name|g" "$OUTPUT_FILE"

echo "✅ Agent created: $OUTPUT_FILE"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Edit the agent file and replace all FILL_THIS placeholders:"
echo "   - Trigger scenario (when to use this agent)"
echo "   - Key expertise areas"
echo "   - Core mission (2-3 paragraphs)"
echo "   - Authority & boundaries"
echo "   - Add 2-3 examples to description"
echo ""
echo "2. Create the agent's skill:"
echo "   mkdir -p .claude/skills/$AGENT_NAME-skill"
echo "   # Then create SKILL.md, references/, scripts/, assets/"
echo ""
echo "3. Validate the agent:"
echo "   $SCRIPT_DIR/validate-agent.sh $OUTPUT_FILE"
echo ""
echo "4. Test the agent:"
echo "   - Restart Claude Code"
echo "   - Try triggering the agent with a relevant request"
echo ""

# Open file in default editor if available
if command -v code &> /dev/null; then
  echo "Opening in VS Code..."
  code "$OUTPUT_FILE"
elif command -v nano &> /dev/null; then
  read -p "Open in nano? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    nano "$OUTPUT_FILE"
  fi
fi

echo "Done! 🎉"
