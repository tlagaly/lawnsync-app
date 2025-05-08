#!/bin/bash
# git-health-check.sh
# Repository health monitoring script for LawnSync
# This script performs various checks to ensure the repository is in a healthy state

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== LawnSync Repository Health Check ===${NC}"
echo "Performing comprehensive health check of your Git repository..."

# Update all remote references
echo -e "${YELLOW}Fetching latest changes from remote...${NC}"
git fetch --all --prune

# 1. Check branch sync status
echo -e "\n${BLUE}1. BRANCH SYNCHRONIZATION STATUS${NC}"
echo -e "${YELLOW}Checking if branches are ahead/behind remote...${NC}"

# Get a list of all local branches
local_branches=$(git branch | sed 's/^..//')

# Initialize counters
sync_count=0
out_of_sync_count=0

for branch in $local_branches; do
    # Get upstream branch if it exists
    upstream=$(git rev-parse --abbrev-ref $branch@{upstream} 2>/dev/null) || upstream=""
    
    if [ -n "$upstream" ]; then
        # Check if branch is ahead or behind
        ahead=$(git rev-list --count $upstream..$branch)
        behind=$(git rev-list --count $branch..$upstream)
        
        if [ $ahead -gt 0 ] && [ $behind -gt 0 ]; then
            echo -e "${RED}✗ $branch: DIVERGED from $upstream (ahead $ahead, behind $behind)${NC}"
            out_of_sync_count=$((out_of_sync_count+1))
        elif [ $ahead -gt 0 ]; then
            echo -e "${YELLOW}⚠ $branch: ahead of $upstream by $ahead commits${NC}"
            out_of_sync_count=$((out_of_sync_count+1))
        elif [ $behind -gt 0 ]; then
            echo -e "${YELLOW}⚠ $branch: behind $upstream by $behind commits${NC}"
            out_of_sync_count=$((out_of_sync_count+1))
        else
            echo -e "${GREEN}✓ $branch: in sync with $upstream${NC}"
            sync_count=$((sync_count+1))
        fi
    else
        echo -e "${YELLOW}⚠ $branch: no upstream branch configured${NC}"
    fi
done

echo -e "${BLUE}Branch sync summary:${NC} $sync_count branches in sync, $out_of_sync_count branches out of sync"

# 2. Check for stale branches
echo -e "\n${BLUE}2. STALE BRANCH CHECK${NC}"
echo -e "${YELLOW}Checking for stale branches...${NC}"

stale_count=0
merged_count=0

# Check for merged branches
echo -e "${YELLOW}Merged branches that could be cleaned up:${NC}"
merged_branches=$(git branch --merged | grep -v "master\|development" | sed 's/^..//')

if [ -n "$merged_branches" ]; then
    for branch in $merged_branches; do
        echo -e "${GREEN}✓ $branch: merged, can be deleted${NC}"
        merged_count=$((merged_count+1))
    done
else
    echo -e "${GREEN}✓ No merged branches to clean up${NC}"
fi

# Check for stale branches (no commits in the last 90 days)
echo -e "\n${YELLOW}Branches with no recent activity (90+ days):${NC}"
for branch in $local_branches; do
    # Skip master and development branches
    if [ "$branch" == "master" ] || [ "$branch" == "development" ]; then
        continue
    fi
    
    # Get the timestamp of the latest commit on this branch
    latest_commit_timestamp=$(git log -1 --format=%at $branch)
    current_timestamp=$(date +%s)
    days_since_commit=$(( ($current_timestamp - $latest_commit_timestamp) / 86400 ))
    
    if [ $days_since_commit -gt 90 ]; then
        last_commit_date=$(git log -1 --format=%cd --date=local $branch)
        echo -e "${YELLOW}⚠ $branch: inactive for $days_since_commit days (last commit: $last_commit_date)${NC}"
        stale_count=$((stale_count+1))
    fi
done

if [ $stale_count -eq 0 ]; then
    echo -e "${GREEN}✓ No stale branches found${NC}"
fi

echo -e "${BLUE}Stale branch summary:${NC} $merged_count branches can be deleted, $stale_count inactive branches"

# 3. Check if development is behind master
echo -e "\n${BLUE}3. DEVELOPMENT/MASTER ALIGNMENT${NC}"
echo -e "${YELLOW}Checking if development branch is behind master...${NC}"

# Get commitish for each branch
master_hash=$(git rev-parse master)
dev_hash=$(git rev-parse development)

if [ "$master_hash" = "$dev_hash" ]; then
    echo -e "${GREEN}✓ development and master are at the same commit${NC}"
elif git merge-base --is-ancestor $dev_hash $master_hash; then
    echo -e "${RED}✗ development is behind master - needs to be updated${NC}"
    echo -e "${YELLOW}  Run: git checkout development && git merge master${NC}"
elif git merge-base --is-ancestor $master_hash $dev_hash; then
    echo -e "${YELLOW}⚠ master is behind development - this is expected if changes haven't been released yet${NC}"
else
    echo -e "${RED}✗ development and master have diverged - they need to be reconciled${NC}"
fi

# 4. Check for large files and bloat
echo -e "\n${BLUE}4. REPOSITORY SIZE AND BLOAT${NC}"

# Check total repository size
repo_size=$(du -sh . | cut -f1)
echo -e "${YELLOW}Total repository size:${NC} $repo_size"

# Check for large files
echo -e "${YELLOW}Checking for large files (>1MB) in the repository...${NC}"
large_files=$(find . -type f -size +1M -not -path "./.git/*" | sort -h)

if [ -n "$large_files" ]; then
    echo -e "${YELLOW}⚠ Large files detected:${NC}"
    for file in $large_files; do
        file_size=$(du -sh "$file" | cut -f1)
        echo -e "  ${YELLOW}$file ($file_size)${NC}"
    done
    echo -e "${YELLOW}Consider if these files should be in .gitignore or Git LFS${NC}"
else
    echo -e "${GREEN}✓ No large files detected${NC}"
fi

# 5. Configuration check
echo -e "\n${BLUE}5. GIT CONFIGURATION CHECK${NC}"

# Check .gitignore exists
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓ .gitignore exists${NC}"
else
    echo -e "${RED}✗ .gitignore not found${NC}"
fi

# Check if Git LFS is installed and configured
if command -v git-lfs &> /dev/null && git lfs install --skip-repo &> /dev/null; then
    echo -e "${GREEN}✓ Git LFS is installed${NC}"
    
    if [ -f ".gitattributes" ]; then
        lfs_tracked=$(grep -c "filter=lfs" .gitattributes || true)
        echo -e "${GREEN}✓ LFS is tracking $lfs_tracked file type(s)${NC}"
    else
        echo -e "${YELLOW}⚠ Git LFS is installed but no .gitattributes file found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Git LFS is not installed${NC}"
fi

echo -e "\n${BLUE}=== Repository Health Check Summary ===${NC}"
if [ $out_of_sync_count -gt 0 ] || [ $stale_count -gt 0 ] || [ "$master_hash" != "$dev_hash" ]; then
    echo -e "${YELLOW}⚠ Some issues were detected that may require attention.${NC}"
    echo -e "${YELLOW}  Run the git-sync.sh script to synchronize branches.${NC}"
    echo -e "${YELLOW}  Run the git-cleanup.sh script to clean up stale branches.${NC}"
else
    echo -e "${GREEN}✓ Repository is in good health!${NC}"
fi