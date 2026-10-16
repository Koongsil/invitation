// 방명록 공통 로직 (Vercel 함수와 로컬 dev 서버가 함께 사용)
//   GET    /api/guestbook?cursor=<id>   목록 (최신순, 페이지 단위)
//   POST   /api/guestbook               작성 { name, message }
// 글 삭제는 관리자가 MongoDB Atlas 에서 직접 한다

import { MongoClient, ObjectId } from 'mongodb';

const PAGE_SIZE = 10;
const LIMITS = { name: 20, message: 500 };

// 서버리스 함수가 재사용될 때 연결을 다시 맺지 않도록 전역에 보관
let clientPromise;
function collection() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI 환경 변수가 없습니다.');
  clientPromise ||= new MongoClient(process.env.MONGODB_URI).connect();
  return clientPromise.then((c) => c.db(process.env.MONGODB_DB || 'invitation').collection('guestbook'));
}

export function handler(route) {
  return async (req, res) => {
    setCors(req, res);
    if (req.method === 'OPTIONS') return send(res, 204);
    try {
      const url = new URL(req.url, 'http://localhost');
      send(res, ...(await route(req, url)));
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error(err);
      send(res, 500, { error: '잠시 후 다시 시도해 주세요.' });
    }
  };
}

export async function routeList(req, url) {
  if (req.method === 'GET') return [200, await list(url)];
  if (req.method === 'POST') return [201, await create(req)];
  throw new HttpError(405, '지원하지 않는 요청입니다.');
}

async function list(url) {
  const cursor = toObjectId(url.searchParams.get('cursor'));
  const docs = await (await collection())
    .find(cursor ? { _id: { $lt: cursor } } : {}, { projection: { name: 1, message: 1, createdAt: 1 } })
    .sort({ _id: -1 })
    .limit(PAGE_SIZE + 1)
    .toArray();

  const hasMore = docs.length > PAGE_SIZE;
  const items = docs.slice(0, PAGE_SIZE).map(toEntry);
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}

async function create(req) {
  const body = await readJson(req);
  if (body.website) throw new HttpError(400, '잘못된 요청입니다.'); // 스팸봇용 숨김 필드

  const name = clean(body.name);
  const message = clean(body.message, true);

  if (!name || name.length > LIMITS.name) throw new HttpError(400, `이름은 1~${LIMITS.name}자로 입력해 주세요.`);
  if (!message || message.length > LIMITS.message) throw new HttpError(400, `내용은 1~${LIMITS.message}자로 입력해 주세요.`);

  const doc = { name, message, createdAt: new Date() };
  const { insertedId } = await (await collection()).insertOne(doc);
  return { item: toEntry({ ...doc, _id: insertedId }) };
}

// ---------- 유틸 ----------
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function toEntry(d) {
  return { id: d._id.toHexString(), name: d.name, message: d.message, createdAt: d.createdAt.toISOString() };
}

function toObjectId(v) {
  return v && ObjectId.isValid(v) && String(v).length === 24 ? new ObjectId(v) : null;
}

function clean(v, multiline) {
  let s = String(v || '').replace(/\r\n?/g, '\n');
  s = multiline ? s.replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ');
  return s.trim();
}

async function readJson(req) {
  try {
    // Vercel은 req.body 를 미리 파싱해 주고, 일반 Node 서버는 스트림을 직접 읽는다
    if ('body' in req && req.body != null) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 10000) throw new Error('too large');
    }
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new HttpError(400, '잘못된 요청입니다.');
  }
}

function setCors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
}

function send(res, status, data) {
  res.statusCode = status;
  if (data === undefined) return res.end();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}
