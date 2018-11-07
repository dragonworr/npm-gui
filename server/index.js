import express from 'express';
import bodyParser from 'body-parser';
import Analytics from 'analytics-node';
import path from 'path';
import fs from 'fs';
// import opn from 'opn';
import Console from './console';


import { projectRouter } from './routers/project.router';
import { searchRouter } from './routers/search.router';
import { explorerRouter } from './routers/explorer.router';
import { infoRouter } from './routers/info.router';

// Define a port/host we want to listen to
const PORT = 1337;
const HOST = 'localhost';

const client = new Analytics(Buffer.from('aXNpS01OeDNnZ1A0ZlE0VFBqelFvTjdsZDFmejF0NVU=', 'base64').toString());

client.track({
  event: 'npm-gui start',
  userId: new Date().toString(),
});

export const app = express();

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// routes
// app

app.use('/api/explorer', explorerRouter);
app.use('/api/search', searchRouter);
app.use('/api/project', projectRouter);
app.use('/api/info', infoRouter);

app.use('/', express.static(path.normalize(`${__dirname}/../client`), { index: ['index.html'] }));

function start(host, port) {
  // start server
  const server = app.listen(port || PORT, host || HOST, () => {
    console.log(`npm-gui web-server running at http://${(host || HOST)}:${(port || PORT)}/`);
    // opn(`http://${(host || HOST)}:${(port || PORT)}`);
  });

  Console.bind(server, '/api/console');

  return server;
}

export default start;
