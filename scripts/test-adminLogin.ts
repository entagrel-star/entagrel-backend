import adminLogin from '../api/adminLogin';

function makeReq(body: any) {
  return {
    method: 'POST',
    body,
    headers: {},
  } as any;
}

function makeRes() {
  const res: any = {};
  res.status = (code: number) => { res._status = code; return res; };
  res.json = (payload: any) => { res._json = payload; return res; };
  return res;
}

(async () => {
  const req = makeReq({ email: 'noone@example.com', password: 'pw' });
  const res = makeRes();
  try {
    await (adminLogin as any)(req, res);
    console.log('Response status:', res._status);
    console.log('Response json:', res._json);
  } catch (err) {
    console.error('Handler threw:', err);
    process.exit(1);
  }
})();
