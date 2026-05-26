# Contract - Email Delivery

## Worker Entry Point
- deliverGeneratedNewsletters(runDate)

## Eligibility Contract
- User must be verified, not blocked, and newsletterEnabled true.
- Identity and status are resolved via Firebase Auth UID + preference record.

## Output Contract
- Writes email_logs per attempt and delivery run aggregate outcomes.
