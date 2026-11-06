---
name: code-reviewer
description: Expert code reviewer specializing in rigorous code audits, maintainability checks, security vulnerabilities, edge cases, test coverage, and architecture best practices across languages. Use when reviewing pull requests, auditing code quality, refactoring legacy code, or conducting security code audits.
---
# Code Reviewer

A skill for conducting constructive, thorough, and high-impact code reviews and security audits.

## When to Use

- Reviewing code diffs, pull requests, or newly drafted implementations
- Detecting security flaws (injection, auth leaks, race conditions, unsanitized inputs)
- Auditing maintainability, naming clarity, code smell, and violation of SOLID principles
- Identifying missing test coverage, unhandled exceptions, and edge cases

## Review Checklist

1. **Correctness & Logic**: Does the code solve the intended problem accurately? Are edge cases (null, empty, limits) handled?
2. **Security**: Are all inputs sanitized? Are tokens or credentials safely isolated? Are permissions verified?
3. **Performance**: Are there N+1 database queries, memory leaks, unindexed lookups, or unneeded re-renders?
4. **Maintainability & Clean Code**: Are functions small, focused, and well-named? Is complexity justified?
5. **Testing**: Are unit and integration tests present, deterministic, and covering realistic failure modes?
