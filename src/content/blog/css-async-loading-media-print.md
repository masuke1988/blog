---
author: まっす
pubDatetime: 2026-09-09T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: "CSSのレンダリングブロックを回避する media=\"print\" + onload の仕組み"
slug: css-async-loading-media-print
featured: true
draft: false
tags:
  - CSS
description: "linkタグのmedia=\"print\"とonloadを利用してCSSを非同期的に読み込み、レンダリングブロックを回避する仕組みをまとめた。Google Fontsでの利用例やdisplay=swapとの違いも整理した。"
---

linkタグのmedia=\"print\"とonloadを利用してCSSを非同期的に読み込み、レンダリングブロックを回避する仕組みをまとめた。Google Fontsでの利用例やdisplay=swapとの違いも整理した。

## Table of contents


## はじめに

Google FontsなどのCSSを読み込む際、次のようなコードを見ることがある。

```html
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600&display=swap"
  rel="stylesheet"
  media="print"
  onload="this.onload=null;this.media='all'"
/>
```

通常のCSS読み込みとは異なり、

```html
media="print"
onload="this.onload=null;this.media='all'"
```

が指定されている。

これは、CSSによる初期レンダリングのブロックを避けながら、読み込み完了後にCSSを適用するためのテクニック。

この記事では、この処理がなぜレンダリングブロックを回避できるのかを整理する。

---

## 通常のCSSはレンダリングをブロックする

通常は次のようにCSSを読み込む。

```html
<link rel="stylesheet" href="/style.css" />
```

ブラウザはこのCSSを「現在のページ表示に必要なスタイル」と判断する。

ブラウザが画面を表示するまでの流れを簡略化すると、次のようになる。

```text
HTMLを解析
  ↓
DOMを構築

CSSを取得・解析
  ↓
CSSOMを構築

DOM + CSSOM
  ↓
Render Tree
  ↓
Layout
  ↓
Paint
```

CSSが読み込まれていない状態では、「このHTMLをどのような見た目で表示すればよいのか」をブラウザが判断できない。

そのため通常の

```html
<link rel="stylesheet">
```

で読み込まれたCSSについては、CSSの取得・解析が終わるまで初期レンダリングを待つ。

これがレンダリングブロック（Render Blocking）。


## `media="print"` を指定するとどうなるのか

今回のコードは、

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
/>
```

となっている。

`media="print"` は、「印刷時に使用するスタイルシート」という意味。

通常Webサイトを閲覧している環境は `screen` なので、「ブラウザはこのCSSについて、このCSSは現在の画面表示には必要ない」と判断されるため、CSS自体は取得されるが、現在の画面表示に必要なCSSではないためレンダリングをブロックしない。

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
/>
```

では概念的に、

```text
CSSを取得
       ↓
       └── バックグラウンドで進行

HTML解析
↓
初期レンダリング
```

のように進む。



## このままでは画面にCSSが適用されない

```html
media="print"
```

のままでは画面表示時にCSSが適用されないので、ここで `onload` を使用する。

```html
onload="this.media='all'"
```

`<link>` 要素では、スタイルシートの読み込みが完了すると `load` イベントが発生する。

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
  onload="this.media='all'"
/>
```

これは次のように動作する。

```text
CSS読み込み開始
↓
media="print"なので現在の画面描画には不要
↓
初期レンダリングをブロックしない
↓
CSS読み込み完了
↓
loadイベント発生
↓
this.media = "all"
↓
画面にもCSSを適用
```

`media="all"` はすべてのメディアを対象とする。

その瞬間から、読み込んだCSSが通常の画面にも適用される。
ページ全体の読み込み完了後に `all` になるわけではなく、あくまで、そのCSSファイル自身の読み込みが完了したタイミングで `load` イベントが発生する。

## `this.onload=null` は何をしているのか

実際には次のように書かれていることがある。

```html
onload="this.onload=null;this.media='all'"
```

`this` は、この `<link>` 要素自身を指している。

最初の、

```js
this.onload = null;
```

では、設定されている `onload` ハンドラを解除している。

その後、

```js
this.media = 'all';
```

を実行している。

`media` の変更などに伴って `load` イベントが再度発生する可能性などを考慮し、イベントハンドラを先に解除しておくための処理。

---

## 全体の流れ

今回のコード、

```html
<link
  href="/style.css"
  rel="stylesheet"
  media="print"
  onload="this.onload=null;this.media='all'"
/>
```

の動作をまとめると次のようになる。

```text
ページ読み込み
↓
<link>を発見
↓
CSS取得開始
↓
media="print"
↓
現在のscreen表示には必要ない
↓
レンダリングをブロックしない
↓
ページの初期描画が進む

        CSS取得完了
             ↓
        loadイベント
             ↓
       onload = null
             ↓
       media = "all"
             ↓
       CSSが画面にも適用
```

---

## Google Fontsの場合

Google Fontsでは次のようなコードを使用することがある。

```html
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600&display=swap"
  rel="stylesheet"
  media="print"
  onload="this.onload=null;this.media='all'"
/>
```

取得されるCSSには、概念的に次のような `@font-face` が書かれている。

```css
@font-face {
  font-family: "Noto Serif JP";
  src: url("https://fonts.gstatic.com/...woff2");
}
```

そのため実際の流れは、下記のようになる。

```text
Google FontsのCSSを取得
↓
media="all"
↓
@font-faceが有効になる
↓
woff2などのフォントファイルを取得
↓
Webフォントを適用
```

---

### `display=swap`

`display=swap`はWebフォントが読み込まれるまで文字が表示されなくなることを避ける。

フォント読み込み中はシステムフォントなどで文字を表示し、

```text
システムフォントで表示
↓
Webフォント取得完了
↓
Webフォントに切り替え
```

という動作になる。

整理すると次のようになる。

| 方法 | 対象 | 目的 |
| --- | --- | --- |
| `media="print"` → `all` | CSS | レンダリングブロックを避ける |
| `display=swap` | Webフォント | フォント取得中も文字を表示する |

---

## デメリット

CSSの適用を意図的に遅らせるため、

```text
初期表示
↓
CSS読み込み完了
↓
スタイル変更
```

という変化が発生する。

そのため通常のCSSにこの方法を使うと、

- 一瞬スタイルが当たっていない状態が表示される
- レイアウトが変化する
- CLS（Cumulative Layout Shift）が悪化する

といった問題が発生する可能性がある。

したがって、ページのレイアウトやファーストビューに必要なCSSまで非同期化するべきではない。

## まとめ

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
  onload="this.onload=null;this.media='all'"
/>
```

は、ブラウザの `media` 属性の扱いを利用したCSSの非同期読み込みテクニック。

流れをまとめると下記のようになる。

1. `media="print"` にする
2. 現在の画面表示には不要なCSSと判断される
3. CSS自体は取得される
4. レンダリングをブロックしない
5. CSS取得完了時に `load` イベントが発生する
6. `media="all"` に変更する
7. 取得済みCSSが画面にも適用される

## 参考資料

- [Filament Group - The Simplest Way to Load CSS Asynchronously](https://www.filamentgroup.com/lab/load-css-simpler/)
- [Filament Group - loadCSS](https://filamentgroup.github.io/loadCSS/)
- [MDN - CSS performance optimization](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS)
- [MDN - Web performance best practices](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Best_practices)
- [MDN - `<link>`: The External Resource Link element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link)
