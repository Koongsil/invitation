// 로컬 개발용 서버: Vercel 없이 http://localhost:8787 에서 같은 API를 띄운다
import http from 'node:http';
import list from './api/guestbook/index.js';

const PORT = process.env.PORT || 8787;

http
  .createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (/^\/api\/guestbook\/?$/.test(pathname)) return list(req, res);
    res.statusCode = 404;
    res.end();
  })
  .listen(PORT, () => console.log(`방명록 API: http://localhost:${PORT}/api/guestbook`));
