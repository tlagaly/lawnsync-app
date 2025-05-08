#!/bin/bash
# git-sync.sh
# Daily branch synchronization script for LawnSync
# This script ensures that your local branches are synchronized with remote branches
# and that development branch is not behind master.

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== LawnSync Git Sync Tool ===${NC}"
echo "Starting branch synchronization..."

# Fetch the latest changes from remote, including pruning deleted branches
echo -e "${YELLOW}Fetching latest changes and pruning remote references...${NC}"
git fetch --all --prune

# Sync master branch
echo -e "${YELLOW}Synchronizing master branch...${NC}"
git checkout master
git pull origin master
MASTER_HASH=$(git rev-parse HEAD)
echo -e "${GREEN}Master branch updated to commit ${MASTER_HASH}${NC}"

# Sync development branch
echo -e "${YELLOW}Synchronizing development branch...${NC}"
git checkout development
git pull origin development
DEV_HASH=$(git rev-parse HEAD)
echo -e "${GREEN}Development branch updated to commit ${DEV_HASH}${NC}"

# Check if development is behind master
if git merge-base --is-ancestor $DEV_HASH $MASTER_HASH && [ "$DEV_HASH" != "$MASTER_HASH" ]; then
    echo -e "${YELLOW}Development branch is behind master. Merging master into development...${NC}"
    git merge master
    echo -e "${GREEN}Master merged into development.${NC}"
    
    # Push the updated development branch
    echo -e "${YELLOW}Pushing updated development branch to remote...${NC}"
    git push origin development
    echo -e "${GREEN}Development branch pushed.${NC}"
else
    echo -e "${GREEN}Development branch is up-to-date with master.${NC}"
fi

# Check for other branches that might be out of sync
echo -e "${YELLOW}Checking status of all branches...${NC}"
git branch -vv | grep -v "master\|development" | grep "behind\|ahead"

echo -e "${BLUE}=== Branch synchronization completed ===${NC}"
echo "You can now safely work on your branches."