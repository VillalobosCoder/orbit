#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M%S)
compose="docker compose -f compose.prod.yml"

$compose exec -T postgres pg_dump -U orbit orbit | gzip > "backups/db-$stamp.sql.gz"

docker run --rm \
  --volumes-from "$($compose ps -q api)" \
  -v "$PWD/backups:/backup" \
  alpine tar czf "/backup/storage-$stamp.tar.gz" -C /data/storage .

find backups -type f -mtime +14 -delete
echo "Backup saved in backups/ ($stamp)"
