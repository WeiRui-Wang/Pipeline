#!/usr/bin/env bash

set -e

# delete previous local vm ensure clean environment
bakerx delete vm M1 &>/dev/null
bakerx pull focal cloud-images.ubuntu.com &>/dev/null
bakerx run --ip 192.168.56.10 --sync | grep "ssh -i"
