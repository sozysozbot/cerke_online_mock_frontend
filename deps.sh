#!/bin/sh

rm -rf src/lib/cerke_calculate_hands
rm -rf src/lib/api2

mkdir src/lib/cerke_calculate_hands
mkdir src/lib/api2

find cerke_calculate_hands -name "*.ts" | xargs -I {} cp {} src/lib/cerke_calculate_hands
find api2 -name "*.ts" | xargs -I {} cp {} src/lib/api2
