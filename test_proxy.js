const http = require('http');

const optionsLogin = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const reqLogin = http.request(optionsLogin, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    console.log('Login Body:', data);
    console.log('Set-Cookie:', res.headers['set-cookie']);

    const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : null;
    
    if (cookie) {
      const optionsMe = {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Cookie': cookie
        }
      };
      
      const reqMe = http.request(optionsMe, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log('Me Status:', res2.statusCode);
          console.log('Me Body:', data2);
        });
      });
      reqMe.end();
    } else {
      console.log('NO COOKIE RECEIVED FROM PROXY!');
    }
  });
});

reqLogin.write(JSON.stringify({ email: 'admin@seclabs.io', password: 'admin123' }));
reqLogin.end();
