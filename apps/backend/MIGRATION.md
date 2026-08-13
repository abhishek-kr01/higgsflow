# Database migration after schema update

From the repository root:

```bash
bun --filter backend run db:generate
bun --filter backend run db:migrate -- --name complete-higgsflow
```

If this is a disposable development database and the old schema is no longer needed:

```bash
bun --filter backend prisma migrate reset
```
