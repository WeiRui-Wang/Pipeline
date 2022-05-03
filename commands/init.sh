#!/usr/bin/env bash

set -e

# delete previous local vm ensure clean environment
bakerx delete vm F0 &>/dev/null
bakerx pull focal cloud-images.ubuntu.com &>/dev/null
bakerx run | grep "ssh -i"
bakerx stop vm F0 &>/dev/null
VBoxManage modifyvm F0 --natpf1 ",tcp,,8000,,8000" &>/dev/null
bakerx run F0 &>/dev/null