// =============================================================
// 청첩장 내용은 이 파일만 수정하면 됩니다.
// 사진은 public/images 폴더에 아래 경로대로 넣어주세요.
// (파일이 없으면 자리 표시용 박스가 대신 보입니다)
// =============================================================
window.INVITATION = {
  groom: {
    name: "김성호",
    father: "김영구",
    mother: "남정희",
    relation: "장남",
    phone: "010-0000-0000",
  },
  bride: {
    name: "이서용",
    father: "이송섭",
    mother: "소숙희",
    relation: "삼녀",
    phone: "010-0000-0000",
  },

  // 예식 일시 (24시간제)
  date: "2027-01-23T11:10:00",

  venue: {
    name: "더뉴컨벤션웨딩홀",
    hall: "1층 르노브홀",
    address: "서울특별시 강서구 공항대로36길 57",
    tel: "1661-3303",
    naverMap: "https://map.naver.com/",
    kakaoMap: "https://map.kakao.com/",
    transport: [{ title: "주차", desc: "웨딩홀 지하 주차장 2시간 무료" }],
  },

  greeting: [
    "대학교 3학년,",
    "같은 강의실에서 시작된 인연이",
    "어느새 평생을 약속하게 되었습니다.",
    "함께 울고 웃으며 쌓아온 시간만큼",
    "앞으로의 날들도 나란히 걸어가려 합니다.",
    "",
    "축복의 자리에 귀한 걸음 하시어",
    "저희의 새로운 시작을 함께해주세요!",
  ],

  // 사진 경로
  images: {
    main: "images/main.jpg", // 메인 커버 (세로 3:4 권장)
    greeting: "images/greeting.jpg", // 인사말 아래 사진 (가로 4:3 권장)
    // 오시는 길 약도 이미지 (누르면 크게 보기)
    locationMap: "images/map.jpg", // 약도
    locationDirection: "images/direction.jpg", // 교통 안내
    // 갤러리 (개수 자유롭게 추가/삭제)
    gallery: [
      "images/gallery/01.jpg",
      "images/gallery/02.jpg",
      "images/gallery/03.jpg",
      "images/gallery/04.jpg",
      "images/gallery/05.jpg",
      "images/gallery/06.jpg",
      "images/gallery/07.jpg",
      "images/gallery/08.jpg",
      "images/gallery/09.jpg",
    ],
  },

  // 방명록 API 주소 (server/ 의 Vercel 배포 주소, 비워두면 방명록 숨김)
  guestbookApi: "https://invitation-server-two.vercel.app",

  // 싸이월드 미니룸 (페이지 맨 아래)
  miniroom: {
    characters: [
      {
        sprite: "groom", // 기본 도트 캐릭터 (groom / bride)
        image: "", // 직접 만든 캐릭터 이미지 경로를 넣으면 sprite 대신 사용 (예: "images/miniroom/groom.png")
        x: 32, // 가로 위치 (%)
        bubble: "와주셔서 고마워요!",
      },
      {
        sprite: "bride",
        image: "",
        x: 68,
        bubble: "행복하게 잘 살게요♥",
      },
    ],
  },

  accounts: {
    groom: [
      {
        role: "신랑",
        name: "김성호",
        bank: "○○은행",
        number: "000-0000-0000-00",
      },
      {
        role: "신랑 아버지",
        name: "김영구",
        bank: "○○은행",
        number: "000-0000-0000-00",
      },
      {
        role: "신랑 어머니",
        name: "남정희",
        bank: "○○은행",
        number: "000-0000-0000-00",
      },
    ],
    bride: [
      {
        role: "신부",
        name: "이서용",
        bank: "○○은행",
        number: "000-0000-0000-00",
      },
      {
        role: "신부 아버지",
        name: "이송섭",
        bank: "○○은행",
        number: "000-0000-0000-00",
      },
      {
        role: "신부 어머니",
        name: "소숙희",
        bank: "○○은행",
        number: "000-0000-0000-00",
      },
    ],
  },
};
