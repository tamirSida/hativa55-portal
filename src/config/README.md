# Education Configuration

This directory contains configuration files for the education system.

## educationOptions.json

This file contains the dropdown options for the education forms. You can easily modify these options by editing the JSON file.

### Structure:

```json
{
  "institutions": [...],     // מוסד לימודים options
  "degrees": [...],          // תואר/תעודה options  
  "universityJobs": [...]    // תפקיד באוניברסיטה options
}
```

### Usage:

The options are automatically loaded into:
- `/profile/education` - Education management form
- `/students` - Student search autocomplete
- Any other education-related forms

### How to modify:

1. Open `src/config/educationOptions.json`
2. Add, remove, or modify items in any of the arrays
3. Save the file
4. The changes will be automatically reflected in all forms after rebuild/restart

### Notes:

- Keep items in Hebrew for consistency with the UI
- Order matters - items appear in the dropdowns in the same order as the JSON
- Don't forget to add the "אחר..." (Other) option is automatically added by the form components
- Always maintain valid JSON syntax

### Example modification:

To add a new institution:
```json
{
  "institutions": [
    "אוניברסיטת תל אביב",
    "האוניברסיטה העברית",
    "המכללה החדשה שלי",  // <- New institution
    ...
  ]
}
```