#!/bin/bash
# git-cleanup.sh
# Branch cleanup utility for LawnSync
# This script helps clean up feature branches after they have been merged

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== LawnSync Branch Cleanup Tool ===${NC}"

# Function to delete branches both locally and remotely
cleanup_branch() {
    local branch_name=$1
    
    # Make sure we're not on the branch we're trying to delete
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" == "$branch_name" ]; then
        echo -e "${YELLOW}You are currently on the branch you're trying to delete.${NC}"
        echo -e "${YELLOW}Switching to development branch...${NC}"
        git checkout development
    fi
    
    # Delete local branch
    if git branch -D "$branch_name" 2>/dev/null; then
        echo -e "${GREEN}Local branch '$branch_name' deleted.${NC}"
    else
        echo -e "${RED}Failed to delete local branch '$branch_name'. It may not exist locally.${NC}"
    fi
    
    # Check if branch exists remotely before attempting to delete
    if git ls-remote --heads origin "$branch_name" | grep -q "$branch_name"; then
        # Delete remote branch
        if git push origin --delete "$branch_name" 2>/dev/null; then
            echo -e "${GREEN}Remote branch 'origin/$branch_name' deleted.${NC}"
        else
            echo -e "${RED}Failed to delete remote branch 'origin/$branch_name'.${NC}"
            echo -e "${YELLOW}You may not have permission to delete remote branches.${NC}"
        fi
    else
        echo -e "${YELLOW}Remote branch 'origin/$branch_name' does not exist.${NC}"
    fi
}

# Interactive mode - prompts for branch to delete
interactive_cleanup() {
    echo -e "${YELLOW}Available local branches:${NC}"
    git branch | grep -v "master\|development" | sed 's/^..//'
    
    echo ""
    echo -e "${YELLOW}Enter the name of the branch to clean up (or 'q' to quit):${NC}"
    read branch_name
    
    if [ "$branch_name" == "q" ]; then
        echo "Exiting without cleanup."
        exit 0
    fi
    
    # Prevent accidental deletion of important branches
    if [ "$branch_name" == "master" ] || [ "$branch_name" == "development" ]; then
        echo -e "${RED}Cannot delete protected branch '$branch_name'.${NC}"
        exit 1
    fi
    
    # Confirm before deleting
    echo -e "${YELLOW}Are you sure you want to delete '$branch_name' locally and remotely? (y/n)${NC}"
    read confirm
    
    if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
        cleanup_branch "$branch_name"
    else
        echo "Branch cleanup canceled."
    fi
}

# Automatic cleanup of merged branches
auto_cleanup() {
    echo -e "${YELLOW}Checking for merged branches...${NC}"
    
    # Update from remote to ensure accuracy
    git fetch --all --prune
    
    # Get list of merged branches, excluding master and development
    merged_branches=$(git branch --merged | grep -v "master\|development" | sed 's/^..//')
    
    if [ -z "$merged_branches" ]; then
        echo -e "${GREEN}No merged branches found to clean up.${NC}"
        return
    fi
    
    echo -e "${YELLOW}The following branches have been merged and can be cleaned up:${NC}"
    echo "$merged_branches"
    
    echo -e "${YELLOW}Do you want to clean up all these branches? (y/n)${NC}"
    read confirm
    
    if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
        echo -e "${YELLOW}Cleaning up merged branches...${NC}"
        
        for branch in $merged_branches; do
            cleanup_branch "$branch"
        done
        
        echo -e "${GREEN}Branch cleanup completed.${NC}"
    else
        echo "Automatic branch cleanup canceled."
    fi
}

# Check for command-line arguments
if [ $# -eq 0 ]; then
    # No arguments provided, use interactive mode
    interactive_cleanup
elif [ "$1" == "--auto" ]; then
    # Automatic mode for cleaning up merged branches
    auto_cleanup
elif [ "$1" == "--branch" ] && [ ! -z "$2" ]; then
    # Clean up a specific branch
    cleanup_branch "$2"
else
    # Show usage help
    echo "Usage:"
    echo "  git-cleanup.sh                 - Interactive mode"
    echo "  git-cleanup.sh --auto          - Automatically clean up merged branches"
    echo "  git-cleanup.sh --branch NAME   - Clean up a specific branch"
fi

echo -e "${BLUE}=== Branch cleanup completed ===${NC}"