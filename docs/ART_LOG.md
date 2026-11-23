# 그림 기록 (만드는 법·비용) — 오늘의 파크골프

## 2026-11-23 · 6·7코스 섬 그림 (대표 허락 16:00 「그림도 계속 그려」, 2장)
- 도구: ElevenLabs creative_generate_image, 모델 recraft-v4.1, 1장씩(generations_count 1), 플로우 NGgP2kRgeCY37NbatCmn
  - Recraft 직접 연결은 크레딧 부족으로 실패 → 같은 recraft-v4.1을 ElevenLabs에서 씀
- 비용: 장당 242 크레딧(ElevenLabs) × 2 = 484
- 후처리: 1344×768 원본 → 가장자리에서 이어진 거의 흰 배경(최솟값 >226)을 순백으로 → 아래로 치우쳐 정사각 흰 바탕에 붙임(세로 여백 62%를 위로) → 720×720 JPG 86 — 코스 길 화면의 multiply 합성에서 상자가 안 보이게
- art/course_lake.jpg (호숫가 언덕, generation nTrDd61kujuKfdZafNmH) 주문문:
  Miniature diorama of a Korean park golf course on a small floating island, isolated on a pure white background, three-quarter aerial view, photorealistic tilt-shift. Deep winter: thick fresh snow on the ground and on pine trees, a calm mountain lake beside rolling snowy hills, a narrow stream with a small wooden footbridge crossing the course, a winding pale green fairway path dusted with snow leading to a small putting green with a tiny red flag, misty snow-covered mountains in the background. Visible cut-away soil cliff edge of the island underneath. Soft daylight, gentle shadows, clean and calm, square image, no people, no text.
- art/course_sea.jpg (바닷가 솔밭, generation ethOp9VQCRb2TtTuqc2H) 주문문:
  Miniature diorama of a Korean park golf course on a small floating island, isolated on a pure white background, three-quarter aerial view, photorealistic tilt-shift. Winter seaside: dark green coastal black pine grove, pale sand dunes and sand bunkers, a winding green fairway leading to a small putting green with a tiny red flag, a little white lighthouse on rocks, a short stone breakwater and calm deep blue winter sea with soft waves along one side of the island, clear cold sky. Visible cut-away soil and rock cliff edge of the island underneath. Soft daylight, gentle shadows, clean and calm, square image, no people, no text.

## 2026-11-23 · 공 치는 소리 (대표 16:14 고름, 메인 PD #M-1123-1615)
- sfx/hit.mp3 ← CLAUDE_MAIN/PARKGOLF/광고소재_2026-11-22/공치는소리_맑은나무딱.wav(ElevenLabs eleven_text_to_sound_v3, 노드 uuc1yPjD5LM3z87tIcFo, 약 17크레딧 — 메인 PD 기록) → ffmpeg 모노 44.1kHz 96k mp3(6.6KB)
- 본편 치기·슈퍼샷 치기 둘 다 이 소리, 세기에 따라 볼륨 0.3~1.0, 효과음 끄기 따름, 파일을 못 받으면 예전 합성음

## 2026-11-23 · 8·9코스 섬 그림 (대표 16:58 「골프 코스 계속 만들어」, 코스마다 1장)
- 같은 방식: ElevenLabs recraft-v4.1, 1장씩, 플로우 NGgP2kRgeCY37NbatCmn, 장당 242 크레딧 × 2 = 484 (오늘 누적 968)
- art/course_temple.jpg (산사 가는 길, generation d3C1ki9EMAlvlfFE3Uk7): 주문문 앞뒤는 6·7코스와 같고 가운데만 — Winter mountain temple path: snow on the ground and on pine trees, old stone steps, a small traditional Korean Buddhist temple hall with curved tiled roof and a little stone pagoda on a hill, a persimmon tree with a few orange persimmons left, a tiny frozen pond, a winding green fairway dusted with snow leading to a small putting green with a tiny red flag, misty snowy mountains behind.
- art/course_reed.jpg (갈대 강둑, generation n26N8VXMbCYS3gJ3wV2K): 가운데 — Winter riverside: tall golden-beige dry reed beds along a calm blue river bend, a flock of white swans and migrating birds on the water, a grassy embankment path with a few bare willow trees, sandy river banks, a winding green fairway leading to a small putting green with a tiny red flag, soft low winter sunlight.
- 후처리 같음(가장자리 흰 배경 순백 → 정사각 → 720 JPG)
