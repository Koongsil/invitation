(function () {
  var C = window.INVITATION;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  var date = new Date(C.date);

  function formatDateLong(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = h < 12 ? '오전' : h === 12 ? '낮' : '오후';
    var hour = h > 12 ? h - 12 : h;
    return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' +
      WEEK[d.getDay()] + '요일 ' + ampm + ' ' + hour + '시' + (m ? ' ' + m + '분' : '');
  }

  var computed = { dateLong: formatDateLong(date) };

  function get(path) {
    if (computed[path] !== undefined) return computed[path];
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, C);
  }

  // ---------- 텍스트 바인딩 ----------
  $$('[data-bind]').forEach(function (el) {
    var v = get(el.dataset.bind);
    if (v !== undefined) el.textContent = v;
  });

  $('#greeting-message').innerHTML = C.greeting
    .map(function (line) { return line ? escapeHtml(line) : '&nbsp;'; })
    .join('<br />');

  // ---------- 사진 (없으면 자리 표시) ----------
  function fillPhoto(el, src, eager) {
    el.dataset.path = src;
    el.classList.add('is-empty');
    // lazy 이미지는 DOM에 붙어 있어야 로드되므로 먼저 붙이고, 로드되면 자리 표시를 걷어낸다
    var img = new Image();
    img.alt = '';
    img.decoding = 'async';
    if (eager) {
      // 첫 화면(메인 커버)은 lazy 없이 가장 먼저 받는다
      img.fetchPriority = 'high';
    } else {
      img.loading = 'lazy';
    }
    img.onload = function () { el.classList.remove('is-empty'); };
    img.onerror = function () { img.remove(); };
    img.src = src;
    el.appendChild(img);
  }

  $$('[data-img]').forEach(function (el) {
    fillPhoto(el, C.images[el.dataset.img], el.dataset.img === 'main');
  });

  // ---------- 연락하기 ----------
  [
    ['#call-groom', C.groom.phone],
    ['#call-bride', C.bride.phone],
    ['#venue-tel', C.venue.tel],
  ].forEach(function (item) {
    var el = $(item[0]);
    if (el) el.href = 'tel:' + item[1];
  });

  // ---------- 달력 / D-day ----------
  (function renderCalendar() {
    var y = date.getFullYear();
    var mo = date.getMonth();
    var first = new Date(y, mo, 1).getDay();
    var last = new Date(y, mo + 1, 0).getDate();
    var html = WEEK.map(function (w, i) {
      return '<span class="is-head' + (i === 0 ? ' is-sun' : '') + '">' + w + '</span>';
    }).join('');
    for (var i = 0; i < first; i++) html += '<span></span>';
    for (var d = 1; d <= last; d++) {
      var cls = [];
      if ((first + d - 1) % 7 === 0) cls.push('is-sun');
      if (d === date.getDate()) cls.push('is-day');
      html += '<span class="' + cls.join(' ') + '">' + d + '</span>';
    }
    $('#calendar').innerHTML = html;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(y, mo, date.getDate());
    var diff = Math.round((target - today) / 86400000);
    var names = C.groom.name + ' ♥ ' + C.bride.name;
    $('#dday').innerHTML =
      diff > 0 ? names + '의 결혼식이 <b>' + diff + '일</b> 남았습니다.' :
      diff === 0 ? '오늘은 ' + names + '의 <b>결혼식 날</b>입니다.' :
      names + '이 결혼한 지 <b>' + -diff + '일</b> 되었습니다.';
  })();

  // ---------- 갤러리 + 라이트박스 ----------
  var gallery = $('#gallery');
  C.images.gallery.forEach(function (src, i) {
    var el = document.createElement('div');
    el.className = 'photo';
    el.dataset.label = '갤러리 ' + (i + 1);
    el.addEventListener('click', function () { openLightbox(i); });
    gallery.appendChild(el);
    fillPhoto(el, src);
  });

  var galleryMore = $('#galleryMore');
  if (C.images.gallery.length > 9) {
    galleryMore.hidden = false;
    galleryMore.addEventListener('click', function () {
      var expanded = gallery.classList.toggle('is-expanded');
      $('span', galleryMore).textContent = expanded ? 'Close' : 'More';
      // 접을 때는 갤러리 위치로 스크롤을 되돌림
      if (!expanded) gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  var lb = $('#lightbox');
  var lbIndex = 0;

  function showLightbox(i) {
    var total = C.images.gallery.length;
    lbIndex = (i + total) % total;
    var stage = $('.lightbox__stage', lb);
    stage.innerHTML = '';
    var el = document.createElement('div');
    el.className = 'photo';
    el.dataset.label = '갤러리 ' + (lbIndex + 1);
    stage.appendChild(el);
    fillPhoto(el, C.images.gallery[lbIndex]);
    $('.lightbox__count', lb).textContent = lbIndex + 1 + ' / ' + total;
  }

  function openLightbox(i) {
    showLightbox(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
  }

  $('.lightbox__close', lb).addEventListener('click', closeLightbox);
  $('.lightbox__nav--prev', lb).addEventListener('click', function () { showLightbox(lbIndex - 1); });
  $('.lightbox__nav--next', lb).addEventListener('click', function () { showLightbox(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLightbox(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
  });

  // ---------- 오시는 길 ----------
  $('#link-naver').href = C.venue.naverMap;
  $('#link-kakao').href = C.venue.kakaoMap;
  $$('[data-guide]').forEach(function (a) { a.href = C.images[a.dataset.guide]; });
  $('#copy-address').addEventListener('click', function () {
    copy(C.venue.address, '주소가 복사되었습니다.');
  });
  var transport = $('#transport');
  if (transport) {
    transport.innerHTML = C.venue.transport
      .map(function (t) { return '<dt>' + escapeHtml(t.title) + '</dt><dd>' + escapeHtml(t.desc) + '</dd>'; })
      .join('');
  }

  // ---------- 계좌 ----------
  $$('.accordion').forEach(function (acc) {
    var list = C.accounts[acc.dataset.side] || [];
    var body = $('.accordion__body', acc);
    list.forEach(function (a) {
      var row = document.createElement('div');
      row.className = 'account__row';
      row.innerHTML =
        '<p><span class="account__role">' + escapeHtml(a.role) + ' ' + escapeHtml(a.name) + '</span><br />' +
        escapeHtml(a.bank) + ' ' + escapeHtml(a.number) + '</p>' +
        '<button class="account__copy" type="button">복사</button>';
      $('button', row).addEventListener('click', function () {
        copy(a.bank + ' ' + a.number, '계좌번호가 복사되었습니다.');
      });
      body.appendChild(row);
    });
    $('.accordion__head', acc).addEventListener('click', function () {
      acc.classList.toggle('is-open');
    });
  });

  // ---------- 미니미 도트 (미니룸 · 방명록 미니룸 공용) ----------
  // 싸이월드 미니미 도트 (글자 하나 = 1픽셀, '.' 은 투명). 외곽선은 그릴 때 자동으로 둘러진다
  var SPRITE_OUTLINE = '#3a2418';
  // 빛은 왼쪽 위에서: 소문자/별도 글자로 하이라이트·그림자 톤을 둔다
  var BASE = {
    H: '#6b3a1f', h: '#a2643a', D: '#45220f', // 머리 (기본 / 하이라이트 / 그림자)
    S: '#ffdcb8', s: '#efbc93', // 피부 (기본 / 그림자)
    P: '#f6a3a3', E: '#2a1a10', M: '#c0504a', // 볼터치 / 눈 / 입
  };
  var SPRITES = {
    groom: {
      palette: Object.assign({}, BASE, {
        J: '#2c2e3b', j: '#4a4e63', K: '#17181f', // 턱시도 (기본 / 하이라이트 / 그림자)
        W: '#ffffff', w: '#d9dee8', // 셔츠
        R: '#d23434', r: '#8e1f1f', // 나비넥타이
        F: '#f27a96', // 부토니에르
        L: '#24252f', l: '#121219', // 바지
        B: '#151515', b: '#6a6a6a', // 구두 (기본 / 광택)
      }),
      rows: [
        '...HHHHHHH...',
        '..HhhhHHHHH..',
        '.HhhHHHHHHHD.',
        '.HhHHHHHHHDD.',
        '.HHHHHHHHHDD.',
        '.HHSSSSSSSHD.',
        '.HSSESSSESsD.',
        '.HSSESSSESsH.',
        '.SPSSSSSSSPs.',
        '..SSSSMSSSs..',
        '...sSSSSSs...',
        '.....sss.....',
        '...JWRrRWJ...',
        '..JjJWwWJJK..',
        '.JjjJWwWJFKK.',
        '.JjJJJwJJJKK.',
        '.JjJJJJJJJKK.',
        '.SjJJJJJJJKs.',
        '..KJJJJJJJK..',
        '...LLLLLLl...',
        '...LLLLLLl...',
        '...LLl.LLl...',
        '...LLl.LLl...',
        '...LLl.LLl...',
        '..BbBB.BbBB..',
      ],
    },
    bride: {
      palette: Object.assign({}, BASE, {
        V: '#f7f5fc', v: '#d6d0e8', // 면사포 (기본 / 그림자)
        T: '#ffd34d', // 티아라
        G: '#fffdf8', g: '#eadfcd', d: '#cfbfa6', // 드레스 (기본 / 그림자 / 짙은 그림자)
        F: '#f27a96', f: '#ffb6c6', n: '#5f9e45', // 부케 꽃 / 꽃 하이라이트 / 잎
      }),
      rows: [
        '.....TFTFT.....',
        '....HHHHHHH....',
        '...HhhhHHHHH...',
        '..VHhhHHHHHDV..',
        '.VVHhHHHHHHDVv.',
        '.VHHHHHHHHHHDv.',
        '.VHHSSSSSSSHDv.',
        '.VHSSESSSESsHv.',
        '.VHSSESSSESsHv.',
        '.VHSPSSSSSPsHv.',
        'VVHHSSSMSSsHHvv',
        'VvHHDsSSSsDHHvv',
        'Vv.HD.sss.DH.vv',
        'Vv..sGGGGGs..vv',
        'Vv.SGGGGGGgS.vv',
        'Vv.SSFFFFFSS.vv',
        'Vv..GFfFFFg..vv',
        'Vv..GnFFFng..vv',
        'Vv..GGGnGGg..vv',
        'V..gGGGGGGGg..v',
        '..gGGGGGGGGgd..',
        '..gGGGGGGGGgd..',
        '.gGGGGGGGGGGgd.',
        'gGGGGGGGGGGGgdd',
        'ggggggggggggddd',
      ],
    },
  };

  // px = 도트 1칸의 화면 크기
  function spriteSvg(sp, px) {
    var w = sp.rows[0].length;
    var h = sp.rows.length;
    var filled = function (x, y) { return y >= 0 && y < h && x >= 0 && x < w && !!sp.palette[sp.rows[y][x]]; };
    var rects = '';
    for (var y = -1; y <= h; y++) {
      for (var x = -1; x <= w; x++) {
        var fill = filled(x, y) ? sp.palette[sp.rows[y][x]]
          : filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1) ? SPRITE_OUTLINE : null;
        if (fill) rects += '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="1" height="1" fill="' + fill + '"/>';
      }
    }
    return '<svg viewBox="0 0 ' + (w + 2) + ' ' + (h + 2) + '" width="' + (w + 2) * px + '" height="' + (h + 2) * px +
      '" shape-rendering="crispEdges" aria-hidden="true">' + rects + '</svg>';
  }

  // 방명록 손님 미니미: 이름으로 머리/옷 색을 정해서 사람마다 다르게
  var GUEST_ROWS = {
    boy: [
      '...HHHHH...',
      '..HhhHHHH..',
      '.HhHHHHHHD.',
      '.HHHHHHHHD.',
      '.HSSSSSSSD.',
      '.SSESSSESs.',
      '.SPSSSSSPs.',
      '..SSSMSSs..',
      '...sSSSs...',
      '..CCCCCCC..',
      '.CcCCCCCCK.',
      '.SCCCCCCCS.',
      '..CCCCCCK..',
      '...LLLLl...',
      '...LL.Ll...',
      '...LL.Ll...',
      '..BBB.BBB..',
    ],
    girl: [
      '...HHHHH...',
      '..HhhHHHH..',
      '.HhHHHHHHD.',
      '.HHHHHHHHD.',
      '.HSSSSSSSD.',
      'HSSESSSESsD',
      'HSPSSSSSPsD',
      'HHSSSMSSsDD',
      'HH.sSSSs.DD',
      'H..CCCCC..D',
      '..SCcCCCS..',
      '...CCCCK...',
      '..CCCCCCK..',
      '.CCCCCCCCK.',
      '.KKKKKKKKK.',
      '...SS.SS...',
      '..BBB.BBB..',
    ],
  };
  var GUEST_HAIR = [
    ['#6b3a1f', '#a2643a', '#45220f'], ['#2a2422', '#4e4542', '#151110'], ['#a0703f', '#d0a066', '#6e4a26'],
    ['#c9a24a', '#ecd07a', '#8f7030'], ['#7a2f3a', '#a85060', '#4f1c24'],
  ];
  var GUEST_TOP = [
    ['#f59ab0', '#ffc4d2', '#d9738c'], ['#8ccbb8', '#b8e6d8', '#5f9e8c'], ['#8fb4e8', '#bcd4f5', '#5f84bd'],
    ['#f2c94c', '#ffe08a', '#c9a02e'], ['#b9a3e3', '#d8caf3', '#8a74b8'], ['#3f4f7a', '#5f72a3', '#28344f'],
    ['#f08a6c', '#ffb39c', '#c4604a'], // 흰 옷은 신부처럼 보여서 뺀다
  ];
  var GUEST_BOTTOM = [['#3d5a8a', '#2a3f63'], ['#2c2c33', '#18181d'], ['#c8b08a', '#9e8664']];

  function guestSprite(seed) {
    var n = 2166136261;
    for (var i = 0; i < seed.length; i++) n = Math.imul(n ^ seed.charCodeAt(i), 16777619);
    // 고를 때마다 다시 섞어서 머리/옷 색이 서로 따로 놀게
    var pick = function (list) {
      n = Math.imul(n ^ (n >>> 15), 2246822507);
      n ^= n >>> 13;
      return list[(n >>> 0) % list.length];
    };
    var rows = pick([GUEST_ROWS.boy, GUEST_ROWS.girl]);
    var hair = pick(GUEST_HAIR), top = pick(GUEST_TOP), bottom = pick(GUEST_BOTTOM);
    return {
      rows: rows,
      palette: Object.assign({}, BASE, {
        H: hair[0], h: hair[1], D: hair[2],
        C: top[0], c: top[1], K: top[2],
        L: bottom[0], l: bottom[1], B: '#4a3426',
      }),
    };
  }

  // ---------- 방명록 미니룸: 방명록 글을 말풍선에 담고 미니미들이 돌아다닌다 ----------
  var plaza = (function () {
    var stage = $('#plaza-stage');
    if (!stage) return { set: function () {}, add: function () {} };

    // 배경 도트 좌표계 (tools/miniroom-lounge.html 과 같은 192x132, 벽-바닥 경계는 2:1 계단)
    var W = 192, H = 132;
    var seam = function (x) { return 46 + Math.floor(Math.abs(96 - x) / 2); };
    var MAX_GUESTS = 10;
    var MAX_TALKING = 2;
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var chars = [];
    var visible = false;

    function spot() {
      for (var tries = 0; tries < 30; tries++) {
        var x = 26 + Math.random() * 140;
        var top = seam(x) + 16;
        var y = top + Math.random() * (124 - top);
        if (x > 134 && x < 166 && y < 90) continue; // 선물 더미
        return { x: x, y: y };
      }
      return { x: 96, y: 100 };
    }

    function place(c) {
      c.el.style.left = (c.x / W) * 100 + '%';
      c.el.style.top = (c.y / H) * 100 + '%';
      c.el.style.zIndex = Math.round(c.y) + (c.state === 'talk' ? 200 : 0);
    }

    function create(opts) {
      var c = { lines: opts.lines, state: 'idle', until: Date.now() + Math.random() * 2500, lastTalk: 0, line: 0 };
      c.el = document.createElement('div');
      c.el.className = 'plaza__char';
      c.el.innerHTML = '<p class="plaza__bubble"></p><div class="plaza__body">' + spriteSvg(opts.sprite, 2) + '</div>';
      c.bubble = $('.plaza__bubble', c.el);
      var at = spot();
      c.x = at.x;
      c.y = at.y;
      place(c);
      c.el.addEventListener('click', function () { if (c.state !== 'talk') talk(c, Date.now()); });
      stage.appendChild(c.el);
      chars.push(c);
      return c;
    }

    function talk(c, now) {
      if (c.state === 'walk') {
        // 걷는 중이면 지금 서 있는 자리에서 멈춘다
        var cs = getComputedStyle(c.el);
        c.x = (parseFloat(cs.left) / stage.clientWidth) * W;
        c.y = (parseFloat(cs.top) / stage.clientHeight) * H;
        c.el.style.transitionDuration = '0s';
        c.el.classList.remove('is-walking');
      }
      var line = c.lines[c.line++ % c.lines.length];
      c.bubble.innerHTML = (line.name ? '<b>' + escapeHtml(line.name) + '</b>' : '') + escapeHtml(line.text);
      c.state = 'talk';
      c.until = now + Math.min(6000, 3000 + line.text.length * 70);
      c.lastTalk = now;
      place(c);
      c.el.classList.add('is-talking');
      // 말풍선이 방 밖으로 잘리지 않게 좌우로 밀어 넣는다 (꼬리는 캐릭터 머리 위에 그대로)
      c.bubble.style.setProperty('--shift', '0px');
      var b = c.bubble.getBoundingClientRect();
      var s = stage.getBoundingClientRect();
      var shift = b.left < s.left + 4 ? s.left + 4 - b.left : b.right > s.right - 4 ? s.right - 4 - b.right : 0;
      c.bubble.style.setProperty('--shift', shift + 'px');
    }

    function walk(c, now) {
      var to = spot();
      var dist = Math.hypot(to.x - c.x, (to.y - c.y) * 2);
      var sec = Math.max(1.5, dist / 14);
      c.x = to.x;
      c.y = to.y;
      c.state = 'walk';
      c.until = now + sec * 1000;
      c.el.style.transitionDuration = sec + 's';
      c.el.classList.add('is-walking');
      place(c);
    }

    // 근처에서 이미 말하는 중이면 말풍선이 겹치니 기다린다
    function crowded(c) {
      return chars.some(function (o) {
        return o !== c && o.state === 'talk' && Math.abs(o.x - c.x) < 70 && Math.abs(o.y - c.y) < 60;
      });
    }

    function tick() {
      if (!visible || document.hidden) return;
      var now = Date.now();
      chars.forEach(function (c) {
        if (now < c.until) return;
        if (c.state === 'talk') c.el.classList.remove('is-talking');
        if (c.state === 'walk') c.el.classList.remove('is-walking');
        if (c.state !== 'idle' || still) {
          c.state = 'idle';
          c.until = now + 1200 + Math.random() * 2800;
          place(c);
        } else {
          walk(c, now);
        }
      });
      // 늘 2명이 말하도록, 서 있는 사람 중 가장 오래 말 안 한 사람부터 (말풍선이 겹치는 자리면 다음 사람)
      var talking = chars.filter(function (c) { return c.state === 'talk'; }).length;
      if (talking >= MAX_TALKING) return;
      chars
        .filter(function (c) { return c.state === 'idle' && now - c.lastTalk > 1500; })
        .sort(function (a, b) { return a.lastTalk - b.lastTalk; })
        .some(function (c) {
          if (crowded(c)) return false;
          talk(c, now);
          return ++talking >= MAX_TALKING;
        });
    }

    function guestLine(item) {
      var text = String(item.message).replace(/\s+/g, ' ').trim();
      return { name: item.name, text: text.length > 36 ? text.slice(0, 35) + '…' : text };
    }

    function addGuest(item) {
      var c = create({ sprite: guestSprite(String(item.id || item.name)), lines: [guestLine(item)] });
      if (chars.length > MAX_GUESTS) chars.shift().el.remove();
      return c;
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(stage);
    } else {
      visible = true;
    }
    setInterval(tick, 250);

    return {
      // 처음 불러온 방명록(최신순)으로 손님을 채운다
      set: function (items) {
        items.slice(0, MAX_GUESTS).reverse().forEach(addGuest);
      },
      // 방금 쓴 글은 바로 말하게
      add: function (item) {
        talk(addGuest(item), Date.now());
      },
    };
  })();

  // ---------- 방명록 ----------
  (function initGuestbook() {
    if (!C.guestbookApi) return;
    var api = C.guestbookApi.replace(/\/+$/, '') + '/api/guestbook';
    var form = $('#guestbook-form');

    $('#guestbook').hidden = false;

    function request(method, url, body) {
      return fetch(url, {
        method: method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) throw new Error(data.error || '잠시 후 다시 시도해 주세요.');
          return data;
        });
      });
    }

    // 목록은 따로 그리지 않고, 최신 글들을 방명록 미니룸의 손님으로만 보여준다
    function load() {
      request('GET', api)
        .then(function (data) { plaza.set(data.items); })
        .catch(function (err) { toast(err.message); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = {
        name: form.name.value.trim(),
        message: form.message.value.trim(),
        website: form.website.value,
      };
      if (!body.name) return toast('이름을 입력해 주세요.');
      if (!body.message) return toast('축하 메시지를 입력해 주세요.');

      var submit = $('button[type="submit"]', form);
      submit.disabled = true;
      request('POST', api, body)
        .then(function (data) {
          plaza.add(data.item);
          form.reset();
          toast('방명록이 등록되었습니다.');
        })
        .catch(function (err) { toast(err.message); })
        .then(function () { submit.disabled = false; });
    });

    load();
  })();

  // ---------- 공유 ----------
  $('#share-link').addEventListener('click', function () {
    copy(location.href, '청첩장 링크가 복사되었습니다.');
  });

  // ---------- 유틸 ----------
  function copy(text, msg) {
    var done = function () { toast(msg); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-show'); }, 1800);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- 미니룸 ----------
  (function renderMiniroom() {
    var room = C.miniroom;
    if (!room) return;

    var stage = $('#miniroom-stage');
    room.characters.forEach(function (ch, i) {
      var el = document.createElement('div');
      el.className = 'miniroom__char';
      el.style.left = ch.x + '%';
      el.style.animationDelay = i * 0.4 + 's';
      var body = ch.image
        ? '<img src="' + escapeHtml(ch.image) + '" alt="" />'
        : spriteSvg(SPRITES[ch.sprite] || SPRITES.groom, 3);
      el.innerHTML = (ch.bubble ? '<p class="miniroom__bubble">' + escapeHtml(ch.bubble) + '</p>' : '') +
        '<div class="miniroom__body">' + body + '</div>';
      stage.appendChild(el);
    });
  })();

  // ---------- 스크롤 등장 효과 ----------
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    $$('.section > *, .ending > *').forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
