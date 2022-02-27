#!/usr/bin/env bash

set -e

# delete previous local vm
bakerx delete vm M1
bakerx pull focal cloud-images.ubuntu.com
bakerx run M1 focal --ip 192.168.56.10 --sync