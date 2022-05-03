#!/usr/bin/env bash

set -e

# delete previous local vm ensure clean environment
bakerx delete vm F0 &>/dev/null
bakerx pull focal cloud-images.ubuntu.com &>/dev/null
bakerx run | grep "ssh -i"
VBoxManage controlvm F0 natpf1 ",tcp,,8000,,8000" &>/dev/null
