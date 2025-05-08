#!/bin/bash
# install-hooks.sh
# Install Git hooks for LawnSync

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== LawnSync Git Hooks Installer ===${NC}"

# Make sure we're in the project root
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: .git directory not found.${NC}"
    echo -e "${YELLOW}This script must be run from the project root directory.${NC}"
    exit 1
fi

# Make hooks executable
echo -e "${YELLOW}Making hooks executable...${NC}"
chmod +x scripts/git/hooks/*

# Backup existing hooks
if [ -d ".git/hooks" ]; then
    echo -e "${YELLOW}Backing up existing hooks...${NC}"
    # Create backup directory if it doesn't exist
    mkdir -p .git/hooks.backup
    
    # Move any existing hooks to backup
    for hook in pre-push post-merge; do
        if [ -f ".git/hooks/$hook" ]; then
            echo -e "${YELLOW}Backing up existing $hook hook...${NC}"
            mv .git/hooks/$hook .git/hooks.backup/$hook.bak
        fi
    done
fi

# Create symlinks to our hooks
echo -e "${YELLOW}Installing hooks...${NC}"

# Get absolute path to hooks directory
HOOKS_DIR=$(pwd)/scripts/git/hooks

# Create symlinks
for hook in pre-push post-merge; do
    echo -e "${YELLOW}Installing $hook hook...${NC}"
    ln -sf "$HOOKS_DIR/$hook" .git/hooks/$hook
done

echo -e "${GREEN}Git hooks installed successfully!${NC}"
echo -e "${BLUE}=== Installation Complete ===${NC}"
echo ""
echo -e "The following hooks are now active:"
echo -e "  - ${GREEN}pre-push${NC}: Prevents direct pushes to master and checks branch sync"
echo -e "  - ${GREEN}post-merge${NC}: Notifies when branches need updating after a merge"
echo ""
echo -e "To update or modify these hooks, edit the files in ${YELLOW}scripts/git/hooks/${NC}"
echo -e "If you need to bypass them temporarily, use ${YELLOW}git push --no-verify${NC}"