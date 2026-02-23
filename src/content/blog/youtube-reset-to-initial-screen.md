---
author: まっす
pubDatetime: 2026-02-23T0:00:00Z
title: <YouTube>動画終了後、YouTubeの関連動画が表示されるのを防ぐ
slug: youtube-reset-to-initial-screen
featured: true
draft: false
tags:
  - YouTube
  - JavaScript
description: 動画終了後、YouTubeの関連動画が表示されるのを防ぐ
---

<!-- ## Table of contents -->


## 作成した経緯
- YouTubeを埋め込んだ際、「１回だけ動画再生した後、関連動画が表示されるのを防ぎ、再生前の画面を表示させたい」という要望が出てきたため。
- そのままiframeで埋め込み、srcにパラメータをつける方法だと、「同じチャンネルの動画を表示」「ループさせる」など、しか出来ず、細かい調整ができなかった。

## コード

### HTML
```html
<div id="player"></div>
```

### JavaScript

```javascript
// メモリ上に新しい <script> タグを生成
const tag = document.createElement('script');

// ページ内にあるタグの1番最初のタグを目印にする
const firstScriptTag = document.getElementsByTagName('script')[0];
const videoId = 'YOUR_VIDEO_ID';
let player;

// 作成したscriptタグにYouTube API の URL を指定
tag.src = "https://www.youtube.com/iframe_api";

// 目印にしたタグの直前に、生成したタグを割り込ませる
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// プレーヤーを初期化する関数
function createPlayer() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: videoId,
    playerVars: {
      'rel': 0,
      'iv_load_policy': 3
    },
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  // 動画が終了（YT.PlayerState.ENDED）したとき
  if (event.data == YT.PlayerState.ENDED) {
    // 1. 現在のプレーヤーを破棄
    player.destroy();
    // 2. 再び同じ場所にプレーヤーを作成（これでタイトルも復活します）
    createPlayer();
  }
}

// ページ読み込み後、APIがonYouTubeIframeAPIReady関数を自動で読み込む
function onYouTubeIframeAPIReady() {
  createPlayer();
}

```


## 終わりに
YouTubeにアップした動画を埋め込むことはよくあるので、この機能はよく使いそう。

## 参考
- https://developers.google.com/youtube/iframe_api_reference?hl=ja