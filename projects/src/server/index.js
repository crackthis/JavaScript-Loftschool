// не забудьте сделать npm install ;)


const { Server } = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');



function readBody(req) {
  return new Promise((resolve, reject) => {
    let dataRaw = '';

    req.on('data', (chunk) => (dataRaw += chunk));
    req.on('error', reject);
    req.on('end', () => resolve(JSON.parse(dataRaw)));
  });
}

const server = http.createServer(async (req, res) => {
  try {
    //CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      /** add other headers as per requirement */
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    if (['GET', 'POST'].indexOf(req.method) > -1) {
      res.writeHead(200, headers);
      return;
    }

    res.writeHead(405, headers);
    res.end(`${req.method} is not allowed for the request.`);



    if (/\/photos\/.+\.png/.test(req.url)) {
      const [, imageName] = req.url.match(/\/photos\/(.+\.png)/) || [];
      const fallBackPath = path.resolve(__dirname, '../images/no-photo.png');
      const filePath = path.resolve(__dirname, '../photos', imageName);
      console.log(fallBackPath);
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        return fs.createReadStream(filePath).pipe(res);
      } else {
        return fs.createReadStream(fallBackPath).pipe(res);
      }
    } else if (req.url.endsWith('/upload-photo')) {
      const body = await readBody(req);
      console.log(body);
      const name = body.name.replace(/\.\.\/|\//, '');
      const [, content] = body.image.match(/data:image\/.+?;base64,(.+)/) || [];
      const filePath = path.resolve(__dirname, '../photos', `${name}.png`);

      if (name && content) {
        fs.writeFileSync(filePath, content, 'base64');

        broadcast(connections, { type: 'photo-changed', data: { name } });
      } else {
        return res.end('fail');
      }
    }
    res.end('ok');
  } catch (e) {
    console.error(e);
    res.end('fail');
  }
}).listen(8080);





const wss = new Server({ server });


const connections = new Map();

wss.on('connection', (socket) => {
  connections.set(socket, {});

  socket.on('message', (messageData) => {
    const message = JSON.parse(messageData);
    let excludeItself = false;

    if (message.type === 'hello') {
      excludeItself = true;
      connections.get(socket).userName = message.data.name;
      sendMessageTo(
        {
          type: 'user-list',
          data: [...connections.values()].map((item) => item.userName).filter(Boolean),
        },
        socket
      );
    }

    sendMessageFrom(connections, message, socket, excludeItself);
  });

  socket.on('close', () => {
    sendMessageFrom(connections, { type: 'bye-bye' }, socket);
    connections.delete(socket);
  });
});

function sendMessageTo(message, to) {
  to.send(JSON.stringify(message));
}

function broadcast(connections, message) {
  for (const connection of connections.keys()) {
    connection.send(JSON.stringify(message));
  }
}

function sendMessageFrom(connections, message, from, excludeSelf) {
  const socketData = connections.get(from);

  if (!socketData) {
    return;
  }

  message.from = socketData.userName;

  for (const connection of connections.keys()) {
    if (connection === from && excludeSelf) {
      continue;
    }

    connection.send(JSON.stringify(message));
  }
}
