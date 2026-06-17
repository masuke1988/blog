---
author: まっす
pubDatetime: 2026-06-17T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習11】カスタムフック
slug: learning-react-11
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はカスタムフックについて学習した。
---

Reactのカスタムフックについて学習した。

## Table of contents

## カスタムフックとは

これまで学んださまざまな基本的なReactのフックを組み合わせて、再利用可能なロジックを作成する仕組み。

カスタムフックを使用することで、ロジックの再利用が可能になり、テストも行いやすくなる。

## カスタムフックの作成方法

Reactのフックを利用した関数を作成し、`use`で始まる関数名をつければカスタムフックとして扱うことができる。

```tsx
function useCustomHook() {
  処理を記述
}
```

## フォルダ構成

カスタムフックを作成する際、下記のようなフォルダ構成に特に決まりはないが、ある程度の決まりは必要。
下記サイトがわかりやすくまとめられていた。
[https://levtech.jp/media/article/column/detail_711/]

個人的には下記のような構成が管理しやすい。（上記URLの「技術別分類」に近い形）

```
src/
├─ hooks/
│  ├─ useCounter.ts
│  ├─ useFetch.ts
│  └─ useWindowSize.ts
├─ components/
└─ pages/
```


## カスタムフックの実例

### カウントアップ

カウントアップの処理に関するフック`useCounter`を作成。
`count`と`handleClick`を返す。

```tsx
import { useState } from "react";
export function useCounter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1)
  }

  return {
    count,
    handleClick,
  }
}
```

利用する側は下記のようになる。
`useCounter`から返される`count`は数値の表示、`handleClick`は`button`のクリックイベントに割り当てることで、カウントアップ機能を分割したコードとなっている。

```tsx
import { useCounter } from "./useCounter";

function App() {
  const { count, handleClick } = useCounter();

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClick}>カウントアップ</button>
    </div>
  );
}
```

### API取得

APIを取得するためのカスタムフック`useFetch`を作成。
`useFetch`は`url`を受け取り、`posts`と`loading`を返す。

`useFetch`の実装は下記のようになる。

意図的に`loading`を`false`にするタイミングを1秒遅らせている。

```tsx
import { useState, useEffect } from "react";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export function useFetch(url: string) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function getPosts() {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }
        
        const json: Post[] = await res.json();
        console.log(json);
        setPosts(json);

        // 意図的に1秒後にloadingをfalseにしている
        setTimeout(() => {
          setLoading(false);
        }, 1000)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    getPosts();
  }, [url])

  return { posts, loading };
}

```

利用する側は下記のようになる。

`useFetch`にURLを渡し、`fetch`でデータを取得。
`posts`には取得したデータが配列形式で入っているため、`map`を使って各要素を表示している。
`loading`は`true`の間は`<p>Loading...</p>`を表示させ、ローディング中であることを示している。
`useState`使って管理しているので、`loading`の値が変わると再レンダリングが発生し、`Loading`表示と取得したデータ表示が切り替わる。

```tsx
import { useFetch } from "./useFetch";

function App() {
  const { posts, loading } = useFetch("https://jsonplaceholder.typicode.com/posts");

  return (
    <div>
      {loading ? <p>Loading...</p> : posts.map(post =>{
        return (
          <div key={post.id}>
            <p>POST ID: {post.id}, UserID: {post.userId}</p>
            <p>{post.title}</p>
            <p>{post.body}</p>
          </div>
        )
      })}
    </div>
  );
}
```

### 画面サイズ取得

`window.innerWidth`と`window.innerHeight`を使って画面サイズを取得→`useState`で値を保持し、`useEffect`でリサイズイベントを監視して値を更新する。
`useEffect`で`resize`イベントを登録し、画面サイズが変更されたときにstateを更新している。

```tsx
import { useState, useEffect } from "react";

export function useWindowSize() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return { width, height };
}
```

利用する側は下記のようになる。

`useWindowSize`を読み込み、`width`と`height`を取得。
`width`と`height`を使って画面サイズに応じた表示を行う。
下記は`Mobile`、`Tablet`、`Desktop`の画面サイズに応じた表示を行う例。

```tsx
import { useWindowSize } from "./useWindowSize";

function App() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Window size: {width} x {height}</p>
      {width < 500 && <p>Mobile view</p>}
      {(width >= 500 && width < 768) && <p>Tablet view</p>}
      {width >= 768 && <p>Desktop view</p>}
    </div>
  );
}
```

## まとめ

これまで勉強してきた各フックを活用して、共通のロジックをフックとして登録できるカスタムフックは非常に便利。
またテストを行う際も、「特定の機能のみテストする」ということも容易となるので、管理もしやすくなる。
カスタムフックはUIを再利用するものではなく、ロジックを再利用するための仕組みである。
