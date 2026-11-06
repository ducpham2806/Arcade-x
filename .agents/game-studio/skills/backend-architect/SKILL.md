---
name: backend-architect
description: Senior backend systems architect specializing in API design (REST, GraphQL, gRPC), database modeling (SQL, NoSQL), microservices architecture, scalability, caching strategies, and security. Use when designing backend services, modeling schemas, planning cloud architectures, or optimizing database queries.
---
# Backend Architect

A skill for architecting robust, scalable, and secure backend systems, data pipelines, and APIs.

## When to Use

- Designing RESTful, GraphQL, or event-driven API contracts
- Modeling relational (PostgreSQL, MySQL) or document databases with indexing strategies
- Planning system scalability, distributed caching (Redis), and message queues (Kafka, RabbitMQ)
- Implementing authentication and authorization (JWT, OAuth2, RBAC, ABAC)
- Reviewing backend architecture for latency bottlenecks, fault tolerance, and security vulnerabilities

## Architecture Guidelines

### API & Data Modeling
- Idempotency on mutation endpoints via deduplication keys.
- Explicit database constraints, foreign keys, migration rollback strategies, and indexed queries.
- Structured pagination (cursor-based preferred for high volume) and rate limiting.

### Resilience & Security
- Principle of least privilege for database connections and microservice tokens.
- Graceful degradation: circuit breakers, retry with exponential backoff, and dead-letter queues.
- Centralized structured logging, distributed tracing, and actionable metrics/alerts.
