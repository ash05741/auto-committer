import { simpleGit, SimpleGit } from 'simple-git';

// Initialize simple-git in the current working directory
const git: SimpleGit = simpleGit();

/**
 * Checks if the workspace has any uncommitted changes.
 */
export async function hasUncommittedChanges(): Promise<boolean> {
    const status = await git.status();
    return !status.isClean();
}

/**
 * Extracts a complete diff of all changes in the workspace.
 * Uses Intent-to-Add to ensure brand new files are included in the diff.
 */
export async function getWorkspaceDiff(): Promise<string> {
    // Add untracked files to the index just enough to be diffed
    await git.add(['-N', '.']);

    // Extract the raw diff for all changes
    const diff = await git.diff();
    return diff;
}

/**
 * Stages a specific array of files and commits them with the provided message.
 */
export async function commitFiles(files: string[], message: string): Promise<void> {
    if (files.length === 0) return;

    // Clear any existing staged changes to ensure a clean commit boundary
    await git.reset();

    // Stage only the selected files
    await git.add(files);

    // Commit them with the AI-generated message
    await git.commit(message);
}

/**
 * Pushes the current branch to the remote repository.
 */
export async function pushChanges(): Promise<void> {
    const status = await git.status();
    const currentBranch = status.current;

    if (currentBranch) {
        await git.push('origin', currentBranch);
    } else {
        throw new Error('Could not determine current branch for pushing.');
    }
}