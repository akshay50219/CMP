1️⃣ Overall Data Model (Big Picture)
Core Entities

User → authors, reviewers, admins

Paper → submitted research papers

Review → evaluation of a paper by a reviewer

Relationships
User (Author)  ─── submits ───▶ Paper
User (Reviewer) ── reviews ───▶ Review ───▶ Paper
Admin ── manages everything

Key Design Decisions

One Paper → Many Reviews

One Reviewer → Many Reviews

Conflict of Interest handled per review

Final decision stored on Paper

Assignments tracked via Review documents

This avoids tight coupling and scales well.

2️⃣ User Schema (Authors, Reviewers, Admins)
Purpose

Represents any authenticated person in the system.

Fields Explained
Field	Purpose
name	Full name
email	Login + unique identity
password	Hashed password
role	Author / Reviewer / Admin
affiliation	University / Organization
expertiseAreas	Used for reviewer-paper matching
isActive	Soft disable accounts
createdAt	Audit trail
Relationship Notes

Authors are linked to papers

Reviewers are linked via reviews

Admins don’t need special relations

3️⃣ Paper Schema (Research Submissions)
Purpose

Represents a submitted research paper.

Fields Explained
Field	Purpose
title	Paper title
abstract	Research summary
keywords	Search + reviewer matching
authors	References to User (Author role)
pdfPath	Uploaded paper file
status	Submission lifecycle
finalDecision	Accept / Reject
submittedAt	Submission timestamp
Status Flow
submitted → under_review → accepted / rejected

Relationship Notes

One paper → many reviews

Authors are stored as references (supports multi-author papers)

4️⃣ Review Schema (Evaluation Layer)
Purpose

Represents one reviewer’s evaluation of one paper.

Fields Explained
Field	Purpose
paper	Paper being reviewed
reviewer	Reviewer user
scores	Structured evaluation
comments	Confidential reviewer notes
conflictOfInterest	Mandatory disclosure
recommendation	Accept / Reject / Weak Accept
submittedAt	Review submission time
Key Design Win

Conflict of Interest is review-specific, not paper-wide

Supports multiple reviewers per paper

Supports blind review workflows later

5️⃣ Indexing Strategy (Performance at Scale)
Why Indexing Matters Here

Reviewer dashboards

Paper status filtering

Admin analytics

Assignment workflows

Suggested Indexes
Collection	Index
User	email (unique)
User	role
Paper	status
Paper	finalDecision
Review	paper + reviewer (compound)
Review	reviewer

These are production-grade, not academic.