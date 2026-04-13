# Archive Folder

This folder stores files and docs moved from the working tree that are considered legacy or no longer needed.

## How to use the archiver

1. Edit `archive-config.json` at the repo root and list exact file paths in `files`, or filename patterns in `patterns`.
2. Run the script:

```powershell
# Preview without moving
powershell -ExecutionPolicy Bypass -File tools/archive_old_content.ps1 -DryRun

# Move files
powershell -ExecutionPolicy Bypass -File tools/archive_old_content.ps1
```

## Safe defaults

- Python `__pycache__` folders are archived automatically.
- No other files are moved unless you list them.

## Suggested candidates (confirm before archiving)

- Older documentation variants or duplicates.
- Deprecated components (e.g., older dashboard pages).
- Temporary notes or delivery summaries once finalized.

Update `DOCUMENTATION_INDEX.md` accordingly after archiving documentation.