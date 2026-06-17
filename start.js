#!/usr/bin/env node
/* ============================================================
   BuildBase ローカル開発サーバー
   ------------------------------------------------------------
   使い方:  node start.js  （または npm start）
   - このフォルダを静的配信し、ブラウザで自動的に開きます。
   - 依存パッケージなし（Nodeの標準モジュールのみ）。npm install 不要。
   - なぜ必要？ .jsx を読み込む多ファイル版は file:// で直接開くと
     ブラウザのセキュリティ制限で真っ白になります。http:// で開けば動きます。
   ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = __dirname;
const START_PORT = Number(process.env.PORT) || 8000;
// ブラウザで最初に開くページ
const ENTRY = "電子黒板 工事写真管理 プロトタイプ.html";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/javascript; charset=utf-8", // type="text/babel" で読み込むため
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ "Cache-Control": "no-cache" }, headers));
  res.end(body);
}

const server = http.createServer((req, res) => {
  // クエリ除去 + URLデコード（日本語・空白を含むファイル名に対応）
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (e) {
    return send(res, 400, "Bad Request");
  }
  if (urlPath === "/") urlPath = "/" + ENTRY;

  // パストラバーサル対策：ROOT の外には出さない
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) return send(res, 403, "Forbidden");

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, "404 Not Found: " + urlPath, { "Content-Type": "text/plain; charset=utf-8" });
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  });
});

// ポートが使用中なら自動で +1 して再試行（最大20回）
function listen(port, attemptsLeft) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.log(`  ポート ${port} は使用中。${port + 1} を試します…`);
      listen(port + 1, attemptsLeft - 1);
    } else {
      console.error("サーバー起動に失敗しました:", err.message);
      process.exit(1);
    }
  });
  server.listen(port, "127.0.0.1", () => onReady(port));
}

function openBrowser(url) {
  const platform = process.platform;
  try {
    if (platform === "win32") {
      // Windows: start。空タイトル "" を渡すのが定石
      spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
    } else if (platform === "darwin") {
      spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    } else {
      spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
    }
  } catch (e) {
    /* 自動で開けなくても URL を表示しているので問題なし */
  }
}

function onReady(port) {
  const base = `http://127.0.0.1:${port}`;
  const entryUrl = `${base}/${encodeURIComponent(ENTRY)}`;
  console.log("");
  console.log("  ✅ BuildBase 開発サーバーを起動しました");
  console.log("  ------------------------------------------------");
  console.log(`     アプリ:  ${entryUrl}`);
  console.log(`     ルート:  ${base}/`);
  console.log("  ------------------------------------------------");
  console.log("  ブラウザを自動で開きます。開かない場合は上のURLをコピーしてください。");
  console.log("  停止するには Ctrl + C を押してください。");
  console.log("");
  openBrowser(entryUrl);
}

listen(START_PORT, 20);
