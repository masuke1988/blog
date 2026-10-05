---
author: まっす
pubDatetime: 2026-10-05T00:00:00+09:00
title: "getComputedStyle()でCSSの適用結果を取得する仕組みと使い方"
slug: javascript-get-computed-style
featured: true
draft: false
tags:
  - JavaScript
  - CSS
description: "getComputedStyle()の基本とelement.styleとの違いを整理。CSSの適用結果、疑似要素、CSS変数の取得方法や、サイズ計測・パフォーマンスに関する注意点をコード例で説明する。"
---

JavaScriptから要素の文字色や余白を取得したいときに使用するのが、`getComputedStyle()`。

CSSファイルや`<style>`で指定されたスタイル、継承などを反映した値を取得できる。この記事では、`element.style`との違いから、具体的な使い方と注意点まで整理する。

## Table of contents

## getComputedStyle()とは

`getComputedStyle()`は、ブラウザが要素に適用するCSSの値を調べるためのメソッド。

基本の書き方は次のとおり。

```js
const styles = window.getComputedStyle(element);
```

`window.`を省略して、`getComputedStyle(element)`とも書ける。

引数には、CSSセレクタの文字列ではなく、取得した要素を渡す。以下のコード例は、対象のHTMLが読み込まれた後に実行することを前提としている。

```js
const element = document.querySelector(".box");

if (element) {
  const styles = getComputedStyle(element);
  console.log(styles.color);
}
```

`querySelector()`で対象が見つからなければ`null`になる。`getComputedStyle(null)`はエラーになるため、要素の存在を確認しておく。

戻り値は、各CSSプロパティの値を読み取れるオブジェクト。現行の仕様では`CSSStyleProperties`で、以前の仕様や型定義では`CSSStyleDeclaration`という名前も見かける。[MDNの説明](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle)

## element.styleとの違い

まず、次のHTMLとCSSを用意する。

```html
<div class="box">サンプル</div>

<style>
  .box {
    color: red;
    padding: 16px;
  }
</style>
```

この要素の文字色を、2つの方法で取得してみる。

```js
const box = document.querySelector(".box");

if (box) {
  console.log(box.style.color); // ""
  console.log(getComputedStyle(box).color); // "rgb(255, 0, 0)"
}
```

`element.style`が扱うのは、要素の`style`属性に指定されたインラインスタイル。この例では`style`属性がないため、`box.style.color`は空文字列になる。

一方、`getComputedStyle()`では、スタイルシートの指定を反映した文字色が取得できる。

| 比較項目                     | `element.style`          | `getComputedStyle(element)`    |
| ---------------------------- | ------------------------ | ------------------------------ |
| 取得する値                   | インラインスタイルの指定 | CSSの適用・計算を反映した値    |
| CSSファイルや`<style>`の指定 | 直接は取得しない         | 反映する                       |
| 親要素から継承した値         | 直接は取得しない         | 継承するプロパティでは反映する |
| スタイルの変更               | できる                   | 戻り値は読み取り専用           |

例えば、インラインスタイルを追加すると、`element.style`でも値を取得できる。

```html
<div class="box" style="color: blue;">サンプル</div>
```

```js
const box = document.querySelector(".box");

if (box) {
  console.log(box.style.color); // "blue"
  console.log(getComputedStyle(box).color); // "rgb(0, 0, 255)"
}
```

この結果は、ほかに優先される宣言がない場合の例。`getComputedStyle()`は、CSSの優先順位を解決した結果を返す。[MDN — HTMLElement.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)

## プロパティを取得する2つの方法

プロパティは、JavaScriptのキャメルケースで参照できる。

```js
const box = document.querySelector(".box");

if (box) {
  const styles = getComputedStyle(box);

  console.log(styles.backgroundColor);
  console.log(styles.fontSize);
  console.log(styles.paddingLeft);
}
```

CSSと同じハイフン区切りの名前を使いたい場合は、`getPropertyValue()`を使用する。

```js
const box = document.querySelector(".box");

if (box) {
  const styles = getComputedStyle(box);

  console.log(styles.getPropertyValue("background-color"));
  console.log(styles.getPropertyValue("font-size"));
  console.log(styles.getPropertyValue("padding-left"));
}
```

`styles.fontSize`と`styles.getPropertyValue("font-size")`は、同じプロパティを取得する書き方。[MDN — getPropertyValue()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue)

## CSSに書いた値がそのまま返るとは限らない

`getComputedStyle()`が返すのは、厳密には「解決値（resolved value）」。プロパティによって、計算値やレイアウト後の使用値が返される。

例えば、次のようなCSSがあるとする。

```css
html {
  font-size: 16px;
}

.box {
  font-size: 1.5rem;
  color: #ff0000;
}
```

ほかの宣言による上書きがなければ、取得結果は次のようになる。

```js
const box = document.querySelector(".box");

if (box) {
  const styles = getComputedStyle(box);

  console.log(styles.fontSize); // "24px"
  console.log(styles.color); // "rgb(255, 0, 0)"
}
```

元の`1.5rem`や`#ff0000`という表記を復元するAPIではない。また、すべての値が`px`になるわけでもなく、プロパティによっては`normal`などのキーワードが返る。[CSSOM仕様 — 解決値](https://drafts.csswg.org/cssom/#resolved-values)

取得した値は文字列なので、数値として計算する場合には変換する。

```js
const box = document.querySelector(".box");

if (box) {
  const padding = Number.parseFloat(getComputedStyle(box).paddingLeft);

  if (Number.isFinite(padding)) {
    console.log(padding + 8);
  }
}
```

`parseFloat()`は単位を換算する処理ではなく、文字列の先頭にある数値を読み取る処理。`normal`などでは`NaN`になるため、数値であることを確認してから使う。

## 疑似要素のスタイルを取得する

第2引数に`"::before"`や`"::after"`を渡すと、疑似要素のスタイルを取得できる。

```css
.label::before {
  content: "NEW";
  color: red;
}
```

```js
const label = document.querySelector(".label");

if (label) {
  const styles = getComputedStyle(label, "::before");

  console.log(styles.content); // '"NEW"'
  console.log(styles.color); // "rgb(255, 0, 0)"
}
```

疑似要素は通常のDOM要素として`querySelector()`で取得するのではなく、元の要素と疑似要素名を指定する。`content`の結果には引用符などCSSの表現が含まれるため、通常のテキストと同じものとして扱わない。[MDN — 疑似要素の取得](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle#use_with_pseudo-elements)

## CSS変数を取得する

CSSカスタムプロパティも、`getPropertyValue()`で取得できる。

```css
:root {
  --card-gap: 24px;
}

.card {
  padding: var(--card-gap);
}
```

```js
const card = document.querySelector(".card");

if (card) {
  const styles = getComputedStyle(card);

  console.log(styles.getPropertyValue("--card-gap").trim()); // "24px"
  console.log(styles.paddingTop); // "24px"
}
```

対象の要素から読むことで、その要素での上書きや継承を反映した値を取得できる。未登録のカスタムプロパティに`2rem`を指定した場合、変数自体を読む値は通常`2rem`のまま。`var()`を使った`padding-top`などの結果とは区別する。[CSSOM仕様 — getComputedStyle()](https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle)

## 戻り値は読み取り専用で、変更を反映する

スタイルを変更したい場合は、`element.style`やクラスの切り替えを使用する。

```js
const box = document.querySelector(".box");

if (box) {
  box.style.paddingLeft = "32px";
  box.classList.add("is-active");
}
```

また、`getComputedStyle()`の戻り値は、取得時点の固定されたコピーではなく、要素の変更を反映する「ライブ」なオブジェクト。

```js
const box = document.querySelector(".box");

if (box) {
  box.style.paddingLeft = "16px";

  const styles = getComputedStyle(box);
  const originalPadding = styles.paddingLeft;

  box.style.paddingLeft = "32px";

  console.log(originalPadding); // "16px"
  console.log(styles.paddingLeft); // "32px"
}
```

この例は、`!important`による上書きやトランジションがないことを前提としている。変更前の値を残したい場合は、`originalPadding`のように個々の値を文字列として保存する。[CSSOM仕様 — 戻り値の性質](https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle)

## 要素のサイズを測るAPIとの違い

`getComputedStyle(element).width`はCSSの`width`の解決値。画面上の位置や、変形後の外形を測りたい場合には`getBoundingClientRect()`を使う。

例えば、次のCSSではそれぞれの結果が異なる。

```css
.box {
  box-sizing: content-box;
  width: 200px;
  padding: 10px;
  border: 2px solid;
  transform: scale(1.5);
}
```

```js
const box = document.querySelector(".box");

if (box) {
  console.log(getComputedStyle(box).width); // "200px"
  console.log(box.getBoundingClientRect().width); // 336
}
```

この例では通常のブロック要素を想定している。内容の幅は200px、左右のpaddingとborderを含む幅は224px。それを1.5倍した外形の幅が336pxになる。

`getBoundingClientRect()`は、paddingとborderを含む矩形と、ビューポート基準の位置を取得する。marginは含まれない。[MDN — getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)

## 使用するときの注意点

### 読み取りと書き込みを繰り返さない

スタイルの変更後に値を読み取ると、ブラウザが最新の結果を返すために、スタイルの再計算や、プロパティによってはレイアウトの計算を同期的に行うことがある。

大量の要素を処理するときは、変更と読み取りを交互に繰り返す処理を避け、できる範囲で読み取りを先にまとめる。[web.dev — レイアウトスラッシングの回避](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)

```js
const boxes = [...document.querySelectorAll(".box")];

// 先に必要な値を読む
const paddings = boxes.map(box =>
  Number.parseFloat(getComputedStyle(box).paddingLeft)
);

// 読み取り後に変更する
boxes.forEach((box, index) => {
  if (Number.isFinite(paddings[index])) {
    box.style.paddingLeft = `${paddings[index] + 8}px`;
  }
});
```

### ブラウザで実行する

`getComputedStyle()`は`window`が提供するAPIなので、DOMのないサーバー側では使用できない。

### 取得結果だけで可視性を判断しない

`display`が`none`以外でも、祖先の`display: none`などによって画面に表示されないことがある。`getComputedStyle()`で1つのプロパティを読むだけでは、要素が実際に見えているかをすべて判断できない。

また、`:visited`のスタイルにはプライバシー保護の制限があり、リンクの訪問履歴を判定する用途には使えない。[MDN — 返される値の制限](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle#return_value)

## まとめ

CSSファイルや継承を含めて、要素に適用されるCSSの値をJavaScriptから確認したいときは`getComputedStyle()`を使う。

インラインスタイルを読み書きする`element.style`との違いを理解し、元のCSS表記ではなく解決された値が返ることを押さえておくと使いやすい。サイズや位置を調べる場合は、取得したい情報に応じて`getBoundingClientRect()`などと使い分ける。

## 参考資料

- [MDN — Window.getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle)
- [MDN — HTMLElement.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)
- [MDN — CSSStyleDeclaration.getPropertyValue()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue)
- [CSSOM仕様 — getComputedStyle()](https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle)
- [CSSOM仕様 — 解決値](https://drafts.csswg.org/cssom/#resolved-values)
- [MDN — Element.getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [web.dev — Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
