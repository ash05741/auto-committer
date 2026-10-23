import { simpleGit, SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export async function hasUncommittedChanges(): Promise<boolean> {
    const status = await git.status();
    return !status.isClean();
}

export async function getWorkspaceDiff(): Promise<string> {
    await git.add(['-N', '.']);
    return await git.diff();
}

export async function commitFiles(files: string[], message: string): Promise<void> {
    if (files.length === 0) return;
    await git.reset();
    await git.add(files);
    await git.commit(message);
}

export async function pushChanges(): Promise<void> {
    const status = await git.status();
    const currentBranch = status.current;
    if (currentBranch) {
        await git.push('origin', currentBranch);
    } else {
        throw new Error('Could not determine current branch for pushing.');
    }
}