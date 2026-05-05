# Mandarin Course Day 31–90 Framework

This folder is a Codex-ready framework for building Days 31–90 of a 90-day Traditional Mandarin intensive course.

## Purpose

Days 1–30 are assumed to already exist as the foundation layer. This package defines the continuation framework for Days 31–90, with a strict closed-vocabulary policy, grammar depth requirements, phase targets, assessment standards, and daily lesson containers.

## Important

This folder is a **framework/specification**, not the full generated lesson dataset. Codex should use these files to generate the actual day-level data files while enforcing the validator rules.

## Recommended import order

1. `config/course_contract.json`
2. `config/global_generation_rules.json`
3. `docs/method_review.json`
4. `curriculum/macro_structure.json`
5. `curriculum/phases.json`
6. `curriculum/day_31_90_framework.json`
7. `schemas/daily_lesson_schema.json`
8. `schemas/grammar_explanation_contract.json`
9. `validation/closed_vocab_dependency_validator.json`
10. `assessment/assessment_schema.json`
11. `assessment/day_90_final_exam.json`
12. `codex/CODEX_INSTRUCTIONS.md`

## Core non-negotiable rule

Every sentence, dialogue, exercise, grammar example, listening script, speaking prompt, and audio item must use only vocabulary introduced on prior days or the same day. Unknown or future vocabulary must fail the build.
