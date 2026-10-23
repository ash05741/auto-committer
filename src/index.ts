#!/usr/bin/env node

import { intro, outro, spinner, confirm, note, cancel, isCancel } from '@clack/prompts';
import { hasUncommittedChanges, getWorkspaceDiff, commitFiles, pushChanges } from './git/index.js'
import { generateCommitGroups } from './ai/index.js';

async function main() {
    // 1. Start the CLI UI
    intro('🚀 Auto-Committer Agent');
    const s = spinner();

    try {
        // 2. Check for changes
        s.start('Checking workspace for changes');
        const hasChanges = await hasUncommittedChanges();
        if (!hasChanges) {
            s.stop('Working directory is clean.');
            outro('Nothing to commit. Streak safe!');
            process.exit(0);
        }

        // 3. Extract diff
        s.message('Extracting git diff (including untracked files)');
        const diff = await getWorkspaceDiff();

        // 4. Send to Gemini
        s.message('AI is analyzing changes and grouping commits');
        const commitGroups = await generateCommitGroups(diff);
        s.stop('Analysis complete.');

        if (commitGroups.length === 0) {
            outro('AI could not find meaningful changes to commit.');
            process.exit(0);
        }

        // 5. Display proposed commits for human review
        let summary = '';
        commitGroups.forEach((group, index) => {
            summary += `\n[Commit ${index + 1}]: ${group.commit_message}\n`;
            group.files.forEach(file => {
                summary += `   - ${file}\n`;
            });
        });

        note(summary, 'Proposed Commits');

        // 6. Ask for confirmation
        const shouldCommit = await confirm({
            message: 'Do you want to proceed with these commits?',
            initialValue: true,
        });

        if (isCancel(shouldCommit) || !shouldCommit) {
            cancel('Operation cancelled. Your workspace was not modified.');
            process.exit(0);
        }

        // 7. Execute Git commits
        s.start('Executing commits');
        for (const group of commitGroups) {
            s.message(`Committing: ${group.commit_message}`);
            await commitFiles(group.files, group.commit_message);
        }
        s.stop('All groups committed successfully.');

        // 8. Optional Auto-Push
        const shouldPush = await confirm({
            message: 'Do you want to push to origin?',
            initialValue: true,
        });

        if (isCancel(shouldPush) || !shouldPush) {
            outro('Done! Commits are saved locally.');
            process.exit(0);
        }

        s.start('Pushing to remote repository');
        await pushChanges();
        s.stop('Pushed successfully.');

        outro('🎉 All done! GitHub streak maintained.');

    } catch (error: any) {
        s.stop('An error occurred.');
        console.error(error.message || error);
        cancel('Agent execution failed.');
        process.exit(1);
    }
}

main();