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

  // ---------- 방명록 ----------
  (function initGuestbook() {
    if (!C.guestbookApi) return;
    var api = C.guestbookApi.replace(/\/+$/, '') + '/api/guestbook';
    var form = $('#guestbook-form');
    var listEl = $('#guestbook-list');
    var moreBtn = $('#guestbook-more');
    var cursor = null;

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

    function formatDate(iso) {
      var d = new Date(iso);
      return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate());
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function renderItem(item) {
      var li = document.createElement('li');
      li.className = 'guestbook__item';
      li.innerHTML =
        '<div class="guestbook__meta"><strong>' + escapeHtml(item.name) + '</strong>' +
        '<span>' + formatDate(item.createdAt) + '</span></div>' +
        '<p class="guestbook__message">' + escapeHtml(item.message) + '</p>';
      return li;
    }

    function updateEmpty() {
      $('#guestbook-empty').hidden = listEl.children.length > 0;
    }

    function load() {
      moreBtn.disabled = true;
      request('GET', api + (cursor ? '?cursor=' + cursor : ''))
        .then(function (data) {
          data.items.forEach(function (item) { listEl.appendChild(renderItem(item)); });
          cursor = data.nextCursor;
          moreBtn.hidden = !cursor;
          updateEmpty();
        })
        .catch(function (err) { toast(err.message); })
        .then(function () { moreBtn.disabled = false; });
    }

    moreBtn.addEventListener('click', function () { if (cursor) load(); });

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
          listEl.insertBefore(renderItem(data.item), listEl.firstChild);
          form.reset();
          updateEmpty();
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

    function spriteSvg(sp) {
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
      var px = 3; // 도트 1칸 = 3px
      return '<svg viewBox="0 0 ' + (w + 2) + ' ' + (h + 2) + '" width="' + (w + 2) * px + '" height="' + (h + 2) * px +
        '" shape-rendering="crispEdges" aria-hidden="true">' + rects + '</svg>';
    }

    var stage = $('#miniroom-stage');
    room.characters.forEach(function (ch, i) {
      var el = document.createElement('div');
      el.className = 'miniroom__char';
      el.style.left = ch.x + '%';
      el.style.animationDelay = i * 0.4 + 's';
      var body = ch.image
        ? '<img src="' + escapeHtml(ch.image) + '" alt="" />'
        : spriteSvg(SPRITES[ch.sprite] || SPRITES.groom);
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
