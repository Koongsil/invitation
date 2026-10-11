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
  function fillPhoto(el, src) {
    el.dataset.path = src;
    el.classList.add('is-empty');
    var img = new Image();
    img.alt = '';
    img.loading = 'lazy';
    img.onload = function () {
      el.classList.remove('is-empty');
      el.appendChild(img);
    };
    img.src = src;
  }

  $$('[data-img]').forEach(function (el) {
    fillPhoto(el, C.images[el.dataset.img]);
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
  $('#link-tmap').href = C.venue.tmap;
  $('#copy-address').addEventListener('click', function () {
    copy(C.venue.address, '주소가 복사되었습니다.');
  });
  $('#transport').innerHTML = C.venue.transport
    .map(function (t) { return '<dt>' + escapeHtml(t.title) + '</dt><dd>' + escapeHtml(t.desc) + '</dd>'; })
    .join('');

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
