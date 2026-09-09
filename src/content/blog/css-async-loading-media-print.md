---
author: まっす
pubDatetime: 2026-09-09T4:00:00Z
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

Google FontsなどのCSSを読み込む際、次のようなコードを見ることがあります。

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

が指定されています。

これは、**CSSによる初期レンダリングのブロックを避けながら、読み込み完了後にCSSを適用するためのテクニック**です。

この記事では、この処理がなぜレンダリングブロックを回避できるのかを整理します。

---

## 通常のCSSはレンダリングをブロックする

通常は次のようにCSSを読み込みます。

```html
<link rel="stylesheet" href="/style.css" />
```

ブラウザはこのCSSを「現在のページ表示に必要なスタイル」と判断します。

ブラウザが画面を表示するまでの流れを簡略化すると、次のようになります。

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

CSSが読み込まれていない状態では、

「このHTMLをどのような見た目で表示すればよいのか」

をブラウザが判断できません。

そのため通常の

```html
<link rel="stylesheet">
```

で読み込まれたCSSについては、CSSの取得・解析が終わるまで初期レンダリングを待ちます。

これが**レンダリングブロック（Render Blocking）**です。

---

## `media="print"` を指定するとどうなるのか

今回のコードでは、

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
/>
```

となっています。

`media="print"` は、

> 印刷時に使用するスタイルシート

という意味です。

通常Webサイトを閲覧している環境は `screen` なので、ブラウザはこのCSSについて、

```text
このCSSは現在の画面表示には必要ない
```

と判断します。

重要なのは、**CSS自体は取得されるが、現在の画面表示に必要なCSSではないためレンダリングをブロックしない**という点です。

つまり、

```html
<link rel="stylesheet" href="/style.css" />
```

の場合は、

```text
CSSを取得
↓
CSSを解析
↓
待つ
↓
画面を描画
```

となるのに対して、

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

のように進みます。

---

## しかし、このままでは画面にCSSが適用されない

当然ながら、

```html
media="print"
```

のままでは画面表示時にCSSが適用されません。

そこで使用するのが `onload` です。

```html
onload="this.media='all'"
```

`<link>` 要素では、スタイルシートの読み込みが完了すると `load` イベントが発生します。

つまり、

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
  onload="this.media='all'"
/>
```

は、次のように動作します。

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

これが、このテクニックの基本的な仕組みです。

---

## `media="all"` とは

`all` はすべてのメディアを対象とします。

つまり、

```js
this.media = 'all';
```

が実行されることで、

```html
media="print"
```

から、

```html
media="all"
```

へ変更されます。

その瞬間から、読み込んだCSSが通常の画面にも適用されます。

重要なのは、

> ページ全体の読み込み完了後に `all` になるわけではない

という点です。

あくまで、

> **そのCSSファイル自身の読み込みが完了したタイミング**

で `load` イベントが発生します。

---

## `this.onload=null` は何をしているのか

実際には次のように書かれていることがあります。

```html
onload="this.onload=null;this.media='all'"
```

分解すると、

```js
this.onload = null;
this.media = 'all';
```

です。

`this` は、この `<link>` 要素自身を指しています。

最初の、

```js
this.onload = null;
```

では、設定されている `onload` ハンドラを解除しています。

その後、

```js
this.media = 'all';
```

を実行しています。

概念的には次のような処理です。

```js
link.onload = () => {
  link.onload = null;
  link.media = 'all';
};
```

`media` の変更などに伴って `load` イベントが再度発生する可能性などを考慮し、イベントハンドラを先に解除しておくための処理です。

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

の動作をまとめると次のようになります。

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

つまり、

**「CSSを読み込まない」のではなく、「CSSを待たずに初期レンダリングを進める」**

のがポイントです。

---

## Google Fontsの場合

Google Fontsでは次のようなコードを使用することがあります。

```html
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600&display=swap"
  rel="stylesheet"
  media="print"
  onload="this.onload=null;this.media='all'"
/>
```

ここで注意したいのは、`fonts.googleapis.com` から直接フォントファイルを取得しているわけではないということです。

まずGoogle Fontsの**CSSファイル**を取得します。

取得されるCSSには、概念的に次のような `@font-face` が書かれています。

```css
@font-face {
  font-family: "Noto Serif JP";
  src: url("https://fonts.gstatic.com/...woff2");
}
```

そのため実際の流れは、

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

となります。

---

## `display=swap` とは役割が違う

Google FontsのURLには、

```text
display=swap
```

も指定されています。

これは `media="print"` とは別の問題を解決するものです。

### `media="print"` → `media="all"`

目的は、

**CSSによる初期レンダリングのブロックを避けること**

です。

### `display=swap`

目的は、

**Webフォントが読み込まれるまで文字が表示されなくなることを避けること**

です。

フォント読み込み中はシステムフォントなどで文字を表示し、

```text
システムフォントで表示
↓
Webフォント取得完了
↓
Webフォントに切り替え
```

という動作になります。

整理すると次のようになります。

| 方法 | 対象 | 目的 |
| --- | --- | --- |
| `media="print"` → `all` | CSS | レンダリングブロックを避ける |
| `display=swap` | Webフォント | フォント取得中も文字を表示する |

似たパフォーマンス対策ですが、担当している部分が異なります。

---

## デメリットもある

この方法を使えば必ず良いというわけではありません。

CSSの適用を意図的に遅らせるため、

```text
初期表示
↓
CSS読み込み完了
↓
スタイル変更
```

という変化が発生します。

そのため通常のCSSにこの方法を使うと、

- 一瞬スタイルが当たっていない状態が表示される
- レイアウトが変化する
- CLS（Cumulative Layout Shift）が悪化する

といった問題が発生する可能性があります。

したがって、ページのレイアウトやファーストビューに必要なCSSまで非同期化するべきではありません。

---

## Critical CSSとの考え方

CSSは大きく、

```text
初期表示に必要なCSS
↓
同期的に読み込む

初期表示に不要なCSS
↓
非同期的に読み込む
```

と分けることができます。

初期表示に必要なCSSは **Critical CSS** と呼ばれることがあります。

たとえば、

```html
<style>
  /* ファーストビューに必要なCSS */
</style>

<link
  rel="stylesheet"
  href="/non-critical.css"
  media="print"
  onload="this.onload=null;this.media='all'"
/>
```

という構成も考えられます。

ただし、CSSの分割やインライン化は管理コストも増えるため、実際のWebサイトではCore Web VitalsやLighthouseなどを計測したうえで導入するのが適切です。

---

## JavaScriptが無効な場合

この方法は、

```html
onload="this.media='all'"
```

というJavaScriptに依存しています。

JavaScriptが実行されなければ、

```html
media="print"
```

のままなので画面にCSSが適用されません。

そのため、重要なCSSをこの方法で読み込む場合は `noscript` を使ったフォールバックも考えられます。

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
  onload="this.onload=null;this.media='all'"
/>

<noscript>
  <link rel="stylesheet" href="/style.css" />
</noscript>
```

JavaScriptが無効な環境では、`noscript` 内の通常のスタイルシートが読み込まれます。

---

## まとめ

```html
<link
  rel="stylesheet"
  href="/style.css"
  media="print"
  onload="this.onload=null;this.media='all'"
/>
```

は、ブラウザの `media` 属性の扱いを利用したCSSの非同期読み込みテクニックです。

ポイントは、

1. `media="print"` にする
2. 現在の画面表示には不要なCSSと判断される
3. CSS自体は取得される
4. レンダリングをブロックしない
5. CSS取得完了時に `load` イベントが発生する
6. `media="all"` に変更する
7. 取得済みCSSが画面にも適用される

という流れです。

特に重要なのは、

> **「CSSを後からダウンロードする」のではなく、「CSSは取得しつつ、その取得完了を初期レンダリングの条件にしない」**

という点です。

Google Fontsで使用する場合は、

```text
media="print" → "all"
```

がCSSのレンダリングブロック対策、

```text
display=swap
```

がWebフォント読み込み中のテキスト表示対策、

と分けて理解すると分かりやすくなります。

## 参考資料

- [Filament Group - The Simplest Way to Load CSS Asynchronously](https://www.filamentgroup.com/lab/load-css-simpler/)
- [Filament Group - loadCSS](https://filamentgroup.github.io/loadCSS/)
- [MDN - CSS performance optimization](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS)
- [MDN - Web performance best practices](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Best_practices)
- [MDN - `<link>`: The External Resource Link element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link)
