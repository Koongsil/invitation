#!/bin/sh
# 갤러리 사진 축소본 생성 (macOS sips 사용)
#   thumb/ : 갤러리 칸용 (긴 변 640px)
#   large/ : 크게 보기용 (긴 변 1600px)
# 사진을 추가/교체한 뒤 프로젝트 루트에서 `sh tools/resize-gallery.sh` 실행
set -e
cd "$(dirname "$0")/../public/images/gallery"
mkdir -p thumb large
for f in *.jpg; do
  [ -f "thumb/$f" ] || sips -Z 640 -s formatOptions 70 "$f" --out "thumb/$f" >/dev/null
  [ -f "large/$f" ] || sips -Z 1600 -s formatOptions 80 "$f" --out "large/$f" >/dev/null
done
echo "done"
