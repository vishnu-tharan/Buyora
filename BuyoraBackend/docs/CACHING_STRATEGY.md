# Caching

Redis backs configured Spring caches. Category and brand reads use cache annotations; their creation paths evict relevant entries. Response records used by the default serializer are serializable.

The frontend uses TanStack Query with explicit invalidation after mutations and clears private cached state on logout. Cookie authentication is authoritative; browser storage is used only for non-authoritative convenience state.

Catalog-wide caching, resilient Redis outage behavior and cross-instance invalidation need integration and performance tests. Current source annotations define actual cache coverage; no general product-cache or hit-rate guarantee is made.
