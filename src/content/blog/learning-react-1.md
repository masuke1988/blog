---
author: まっす
pubDatetime: 2026-06-02T4:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習1】JSXとコンポーネント、Props
slug: learning-react-1
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はJSXとコンポーネント、Propsについて
---

Reactの基本的な仕組みであるJSXとコンポーネント、Propsについて学習した。

## Table of contents

## 概要
Reactは、コンポーネントを組み合わせてユーザーインターフェースを構築するためのUIライブラリ。

例:ブログサイト
```
Header
├── Logo
├── Navigation
└── Search

Main
├── PostCard
├── PostCard
└── PostCard
```

「Logo」「Navigation」などがコンポーネント。
コンポーネントはJSXを使って記述する。


## JSXとは
JSXは、Reactでコンポーネントを記述するための構文。

JSXの記述例は下記の通り。
JSXを使うことで、JavaScript内にHTMLのような構文を記述できる。
記述例:
```jsx
function Header() {
  return <header>ヘッダー</header>;
}
```

## HTMLとの違い
- HTML
```html
<div class="box">
  <label for="name">名前</label>
</div>
```

- JSX
```jsx
<div className="box">
  <label htmlFor="name">名前</label>
</div>
```

## コンポーネント
下記のようなコンポーネントを作成して、複数表示させる。
```jsx
function Card() {
  return (
    <div className="card">
      <h2>React test</h2>
    </div>
  );
}

export default Card;
```

表示する側で`Card`コンポーネントを読み込んで使用する。
```jsx
import Card from "./Card";

function App() {
  return (
    <>
      <Card />
      <Card />
      <Card />
    </>
  );
}
```
これで同一のコンポーネントを複数回使用することができる。

## コンポーネントのProps
コンポーネントには、Propsというものがあり、表示する側からコンポーネントに値を渡すことが可能になる。

記述例:
```jsx
function Card({ title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
    </div>
  );
}
export default Card;
```

```jsx
import Card from "./Card";

function App() {
  return (
    <>
      <Card title="React test 1" />
      <Card title="React test 2" />
      <Card title="React test 3" />
    </>
  );
}
```

これで最終的に下記のように表示される。
```html
<div class="card">
  <h2>React test 1</h2>
</div>
<div class="card">
  <h2>React test 2</h2>
</div>
<div class="card">
  <h2>React test 3</h2>
</div>
```

## まとめ
Reactは、コンポーネントベースのUIライブラリであり、JSXを使ってコンポーネントを記述する。
Propsを設定することで、コンポーネントの再利用性を高めることができる。
