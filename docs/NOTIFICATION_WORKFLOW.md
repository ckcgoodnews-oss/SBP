# Notification Workflow

1. Business event occurs.
2. Template is selected.
3. Notification row is queued.
4. Provider worker sends notification.
5. Row is updated to sent or failed.

Package 08 creates the queue and template structure. A future worker sends actual messages.
