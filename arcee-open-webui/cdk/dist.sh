#!/usr/bin/env bash

set -euo pipefail

echo "Building CDK stacks for distribution"
echo "====================================="

rm -rf dist
mkdir -p dist/arcee

pnpm cdk synth \
  --app 'pnpm ts-node --prefer-ts-exts bin/dist.ts' \
  --json \
  --no-version-reporting \
  --no-path-metadata \
  --no-asset-metadata \
  --no-staging \
  --ignore-errors \
  --exclusively \
  --output dist

echo "====================================="
echo "Ignore the CDK errors above, they are expected"
echo "====================================="

for file in ./dist/*.template.json; do
  filename="${file##*/}"  # Get just the filename
  label="${filename%%.*}" # Get the part before the first dot
  if [[ $label == "dist" ]]; then
    newname="openwebui.json" # Special case for the base dist stack
  else
    newname="openwebui-${label#*-}.json" # Construct filename by removing the prefix up to the first dash
  fi

  echo "Writing to dist/arcee/$newname"
  cp "$file" "dist/arcee/$newname"

  # If we ever need to remove bootstrapless-synthesizer for dist, we can revert to this previous behavior
  # echo "Removing CDK dependency from $label, writing to dist/arcee/$newname"
  # jq 'del(.Parameters.BootstrapVersion, .Rules.CheckBootstrapVersion)' <"$file" >"dist/arcee/$newname"
done
