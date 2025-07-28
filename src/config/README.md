# Configuration Files

This directory contains configuration files for dropdown options throughout the application.

## educationOptions.json

This file contains the dropdown options for the education forms.

## businessOptions.json

This file contains the dropdown options for the business forms.

### Structure:

#### educationOptions.json
```json
{
  "institutions": [...],     // מוסד לימודים options
  "degrees": [...],          // תואר/תעודה options  
  "universityJobs": [...]    // תפקיד באוניברסיטה options
}
```

#### businessOptions.json
```json
{
  "categories": [...],       // קטגוריית העסק options
  "services": [...],         // שירותים מיוחדים options
  "tags": [...]              // תגיות חיפוש options
}
```

### Usage:

**Education options** are automatically loaded into:
- `/profile/education` - Education management form
- `/students` - Student search autocomplete
- Any other education-related forms

**Business options** are automatically loaded into:
- `/add-business` - Business creation form
- `/edit-business/[id]` - Business editing form
- Business search filters
- Any other business-related forms

### How to modify:

1. Open the relevant JSON file:
   - `src/config/educationOptions.json` for education forms
   - `src/config/businessOptions.json` for business forms
2. Add, remove, or modify items in any of the arrays
3. Save the file
4. The changes will be automatically reflected in all forms after rebuild/restart

### Notes:

- **Automatic Sorting**: All options are automatically sorted alphabetically in Hebrew
- Keep items in Hebrew for consistency with the UI
- JSON order doesn't matter - options are sorted at runtime
- The "אחר..." (Other) option is automatically added by form components
- Always maintain valid JSON syntax

### Example modifications:

#### Adding a new business category:
```json
{
  "categories": [
    "מסעדנות ואוכל",
    "טכנולוגיה ומחשבים",
    "הקטגוריה החדשה שלי",  // <- New category
    ...
  ]
}
```

#### Adding a new education institution:
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