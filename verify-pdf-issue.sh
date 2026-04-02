#!/bin/bash
# Check if there are any downloaded files today that are not PDFs
find ~/Downloads -type f -mtime -1 -not -name "*.pdf"
