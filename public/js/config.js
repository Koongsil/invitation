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
    relation: "장녀",
    phone: "010-0000-0000",
  },

  // 예식 일시 (24시간제)
  date: "2027-01-23T11:10:00",

  venue: {
    name: "더뉴컨벤션웨딩홀",
    hall: "1층 르노브홀",
    address: "서울특별시 강서구 공항대로36길 57",
    tel: "1661-3303",
    // 구글 지도: Maps Embed API 키 (비워두면 키 없는 기본 임베드로 표시)
    // 공개 저장소에 올라가므로 Google Cloud 콘솔에서 반드시 HTTP 리퍼러 제한을 걸어주세요
    googleMapsApiKey: "",
    // 지도에서 검색할 값 (비워두면 address 사용)
    mapQuery: "",
    naverMap: "https://map.naver.com/",
    kakaoMap: "https://map.kakao.com/",
    tmap: "https://tmap.life/",
    transport: [
      { title: "지하철", desc: "2호선 ○○역 3번 출구 도보 5분" },
      { title: "버스", desc: "간선 000, 지선 0000 ○○역 하차" },
      { title: "주차", desc: "웨딩홀 지하 주차장 2시간 무료" },
    ],
  },

  greeting: [
    "서로가 마주 보며 다져온 사랑을",
    "이제 함께 한 곳을 바라보며",
    "걸어갈 수 있는 큰 사랑으로 키우고자 합니다.",
    "",
    "저희 두 사람이 사랑의 이름으로",
    "지켜나갈 수 있도록 앞날을",
    "축복해 주시면 감사하겠습니다.",
  ],

  // 사진 경로
  images: {
    main: "images/main.jpg", // 메인 커버 (세로 3:4 권장)
    greeting: "images/greeting.jpg", // 인사말 아래 사진 (가로 4:3 권장)
    ending: "images/ending.jpg", // 마지막 사진
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

  // 방명록 API 주소 (server/ 의 Cloudflare Worker 배포 주소, 비워두면 방명록 숨김)
  // 예: "https://invitation-guestbook.<계정>.workers.dev"
  guestbookApi: "",

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
