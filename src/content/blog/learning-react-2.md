---
author: まっす
pubDatetime: 2026-06-02T6:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習2】Propsについて
slug: learning-react-2
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回は前回少し触れたPropsをもう少し詳しく勉強
---

前回少し触れたReactの基本的な仕組みであるPropsについて学習した。

## Table of contents

## 概要
Propsは、親コンポーネントから子コンポーネントへデータを渡すための仕組み。

イメージ:
```
App
↓
title="test"をPropsとして渡す
↓
Card
```

## １つのProps

上記のイメージを元に親、子コンポーネントを作成。
- 親コンポーネント
```jsx
import Card from "./Card"

function App() {
  return (
    <Card title="test" />
  )
}
```
- 子コンポーネント
```jsx
function Card({ title }) {
  return (
    <div>
      <h2>{title}</h2>
    </div>
  )
}
export default Card
```
- TypeScriptの場合
※ここでは分割代入の詳細な説明は割愛
```tsx
type CardProps = {
  title: string
}
function Card({ title }: CardProps) {
  return <h2>{title}</h2>
}
export default Card
```

## 複数のProps
Propsが複数ある場合、以下のようになる。

上記のイメージを元に親、子コンポーネントを作成。
- 親コンポーネント
```jsx
import Card from "./Card"

function App() {
  return (
    <Card title="test" caption="test caption" level={1} />
  )
}
```
- 子コンポーネント
```jsx
function Card({ title, caption, level }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{caption}</p>
      <p>{level}</p>
    </div>
  )
}
export default Card
```
- TypeScriptの場合
```tsx
type CardProps = {
  title: string
  caption: string
  level: number
}
function Card({ title, caption, level }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{caption}</p>
      <p>{level}</p>
    </div>
  )
}
export default Card
```

## オブジェクトのProps
Propsとしてオブジェクトを渡すこともできる。
複数の関連データをまとめて渡したい場合によく利用される。
```jsx
import Card from "./Card"

const post = { title: "test", caption: "test caption", level: 1 }

function App() {
  return (
    <Card post={post} />
  )
}
```
```jsx
function Card({ post }) {
  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.caption}</p>
      <p>{post.level}</p>
    </div>
  )
}
export default Card
```
分割代入も可能。
```jsx
function Card({ post }) {

  const { title, caption, level } = post
  
  return (
    <div>
      <h2>{title}</h2>
      <p>{caption}</p>
      <p>{level}</p>
    </div>
  )
}
export default Card
```

- TypeScriptの場合
```tsx
type Post = {
  title: string
  caption: string
  level: number
}
type CardProps = {
  post: Post
}
function Card({ post }: CardProps) {
  const { title, caption, level } = post
  return (
    <div>
      <h2>{title}</h2>
      <p>{caption}</p>
      <p>{level}</p>
    </div>
  )
}
export default Card
```

## children

childrenは、コンポーネントの開始タグと終了タグの間に書かれた要素を受け取る特別なProps。
自由に中身を変更できるため、再利用性の高いコンポーネントを作成できる。

```jsx
<Card>
  <h2>test title</h2>
  <p>test paragraph</p>
</Card>
```

```jsx
type CardProps = {
  children: React.ReactNode
}
function Card({ children }: CardProps) {
  return (
    <div>
      {children}
    </div>
  )
}
export default Card
```

```html
<div>
  <h2>test title</h2>
  <p>test paragraph</p>
</div>
```

## まとめ
Propsを使うことで、親コンポーネントから子コンポーネントへデータを渡せるようになり、コンポーネントの再利用性が高まる。
childrenを使うことで、コンポーネントの中身を自由に変更できるため、柔軟なUIが構築できる。

今回の記事では記述はしていないが、配列や関数なども渡すことが可能。

また、Propsは親コンポーネントから渡される読み取り専用のデータであり、子コンポーネント側で変更してはいけない。
