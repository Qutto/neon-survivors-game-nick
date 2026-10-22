#!/bin/bash
# stat.sh <js> : mean survival (s) over 8 seeds per scenario, fresh profile, no god
JS=$1
for pl in "home recruit" "home reiji" "home nova" "ice titan" "ice volt" "hive echo"; do
  tot=0; for s in 1 2 3 4 5 6 7 8; do t=$(FRESH=${F:-1} node $JS $pl 6 0 s$s | grep "^END" | grep -o 't=[ 0-9:]*' | tr -d 't= '); m=${t%%:*}; sec=${t##*:}; tot=$((tot + m*60 + 10#$sec)); done
  printf "%-14s %4ds\n" "$pl" $((tot/8))
done
