---
sidebar_position: 6
title: Caching Setup
description: Configure caching for improved performance
---

# Caching Setup

This guide explains how to configure caching for BFFless storage to improve performance and reduce cloud storage costs.

## Overview

BFFless supports two caching backends:

| Backend | Best For | Persistence | Shared |
|---------|----------|-------------|--------|
| **In-Memory** | Single instance, development | No | No |
| **Redis** | Multi-instance, production | Yes | Yes |

## Benefits of Caching

- **Faster response times** - Cached files are served from memory/Redis
- **Reduced cloud costs** - Fewer GET requests to cloud storage
- **Lower latency** - No network round-trip for cached content
- **Better scalability** - Offload read traffic from storage

## In-Memory Cache

### When to Use

- Single-instance deployments
- Development environments
- Small deployments with limited traffic
- When you want zero external dependencies

### Limitations

- Cache is lost on restart
- Not shared between instances
- Limited by server memory
- Not suitable for horizontal scaling

### Configuration

#### Via Environment Variables

```bash
# Enable caching
CACHE_ENABLED=true
CACHE_TYPE=memory

# Memory cache options
CACHE_MAX_SIZE_MB=100
CACHE_MAX_ITEMS=10000
CACHE_DEFAULT_TTL=3600
CACHE_MAX_FILE_SIZE_MB=10
```

## Redis Cache

### When to Use

- Multi-instance deployments
- Production environments
- When you need cache persistence
- Horizontal scaling scenarios
- When cache should survive restarts

### Requirements

- Redis server 6.0+ (recommended)
- Network connectivity from BFFless to Redis

### Redis Installation

#### Docker

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### Docker Compose

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### Configuration

#### Via Environment Variables

```bash
# Enable caching
CACHE_ENABLED=true
CACHE_TYPE=redis

# Redis connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
REDIS_KEY_PREFIX=storage:cache:

# Cache options
CACHE_DEFAULT_TTL=3600
CACHE_MAX_FILE_SIZE_MB=10
```

## Cache Behavior

### What Gets Cached

BFFless caches file downloads with intelligent TTL based on content type:

| Content Type | Default TTL | Reason |
|--------------|-------------|--------|
| HTML | 5 minutes | May change frequently |
| CSS/JS | 1 hour | Usually versioned |
| Images | 1 hour | Rarely change |
| Fonts | 24 hours | Almost never change |
| Other | 1 hour | Default |

### What Doesn't Get Cached

- Files larger than `maxFileSize` (default 10MB)
- Files with `Cache-Control: no-cache` headers
- Upload operations (only downloads are cached)

### Cache Invalidation

Cache is automatically invalidated when:

- A file is re-uploaded (same key)
- A file is deleted
- A deployment is deleted
- Manual cache clear is triggered

## Monitoring Cache Performance

### Cache Statistics

View cache stats via API:

```bash
curl http://localhost:3000/api/storage/cache/stats \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "hits": 15234,
  "misses": 1256,
  "hitRate": 0.924,
  "size": 52428800,
  "maxSize": 104857600,
  "itemCount": 1523,
  "formattedSize": "50 MB"
}
```

### Key Metrics

| Metric | Good Value | Action if Low |
|--------|------------|---------------|
| **Hit Rate** | > 80% | Increase cache size or TTL |
| **Size Usage** | < 90% | Increase max size if often full |
| **Evictions** | Low | Increase max size |

## Performance Tuning

### Optimal Cache Size

Calculate based on your working set:

```
Recommended Size = (Average File Size) × (Active Files) × 1.5
```

Example:
- Average file size: 50KB
- Active files: 10,000
- Recommended: 50KB × 10,000 × 1.5 = 750MB

### TTL Optimization

Adjust TTLs based on your update frequency:

| Scenario | Recommended TTL |
|----------|-----------------|
| Frequently updated content | 5-15 minutes |
| Daily updates | 1 hour |
| Weekly updates | 24 hours |
| Static content | 1 week |

## Troubleshooting

### Low Hit Rate

Causes:
- Cache size too small
- TTL too short
- High traffic on unique files
- Cache recently cleared

Solutions:
- Increase cache size
- Increase TTL for appropriate content
- Add CDN for popular content

### Redis Connection Issues

Causes:
- Redis not running
- Wrong host/port
- Password incorrect
- Network/firewall issues

Solutions:
- Verify Redis is running: `redis-cli ping`
- Check connection settings
- Test connectivity: `telnet redis-host 6379`
- Check firewall rules

## Best Practices

1. **Start with in-memory** for development
2. **Use Redis** for production multi-instance
3. **Monitor hit rate** and adjust size/TTL
4. **Set appropriate TTLs** per content type
5. **Don't cache huge files** - Use CDN instead
6. **Enable Redis persistence** for production
7. **Plan for cache invalidation** in deployment process
8. **Monitor Redis memory** usage

## Related Guides

- [AWS S3 Setup](/storage/aws-s3)
- [Google Cloud Storage Setup](/storage/google-cloud-storage)
- [Azure Blob Storage Setup](/storage/azure-blob-storage)
- [MinIO Setup](/storage/minio)
- [Migration Guide](/storage/migration-guide)
