---
author: まっす
pubDatetime: 2026-06-10T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習8】useMemoについて
slug: learning-react-8
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はuseMemoについて学習した。
---

ReactのuseMemoについて学習した。

## Table of contents

## useMemoとは

useMemoは、Reactのメモ化Hooksであり、依存値が変更されない限り、前回の計算結果を再利用するためのフック。
不要な計算を防ぐことで、パフォーマンス改善が期待できる。

## useMemoの基本的な書き方

`useMemo`の基本的な書き方は以下の通り。

```tsx
const value = useMemo(() => {
  return 計算結果
}, [依存値]);

// 値段と個数をかけた合計値を算出する
const total = useMemo(() => {
  return price * count
}, [price, count]);
```

## useMemoの使い方

### 使い方①：大量のポストから必要なものをフィルタリング

`posts`の中からキーワードに投稿タイトルが該当するものをフィルタリングする。
`useEffect`を使用して、ポストの取得と`posts`の更新を行う。
`filteredPosts`の依存配列に`posts`と`keyword`を指定する。
`isDarkMode`は、`useState`を使用して、意図的に再レンダリングを発生させるために作成。
`isDarkMode`が切り替わっても、`filteredPosts`は再計算されない。

````tsx
import { useState, useMemo, useEffect } from 'react';

type Posts = {
  id: number;
  title: string;
  completed: boolean;
};
export default function UserSearchList() {
  const [posts, setPosts] = useState<Posts[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos/');
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }
        const data = await res.json();
        setPosts(data);
      } catch(error) {
        console.error(error);
      }
    }
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const lowerKeyword = keyword.toLowerCase()
      return post.title.toLowerCase().includes(lowerKeyword);
    });
  }, [posts, keyword]);

  return (
    <>
      <button onClick={() => {
        setIsDarkMode(!isDarkMode)
        console.log('モード切替が実行されました');
      }}>
        モード切替（現在: {isDarkMode ? 'ダーク' : 'ライト'}）
      </button>
      <div>
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </div>
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </>
  );
}

````


### 使い方②：大量のユーザーデータからフィルター、ソート

`LARGE_USER_DATA`でサンプルデータを10000件作成し、ソート用の`filteredUsers`を作成。
スコア順にソートされる。
検索ワードが変わった時に、`useMemo`を使用して1万件のフィルター＆ソートを再計算する。
こちらも意図的に再レンダリングさせるために`isDarkMode`の切替できるように設定。

```tsx
import { useState, useMemo } from 'react';

// 擬似的に1万件のユーザーデータを作成
const LARGE_USER_DATA = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
  score: Math.floor(Math.random() * 10000),
}));

export default function UserSearchList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // 計算とは無関係なState

  // 「検索ワード」が変わった時だけ、1万件のフィルター＆ソートを再計算する
  const filteredUsers = useMemo(() => {
    console.log('1万件の計算（フィルター＆ソート）が実行されました');

    return LARGE_USER_DATA.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.score - a.score);
  }, [searchTerm]); // 依存配列には searchTerm だけを指定

  return (
    <div style={{ background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000', padding: '20px' }}>

      {/* 1. 計算とは関係ないボタン */}
      <button onClick={() => {
        setIsDarkMode(!isDarkMode)
        console.log('モード切替が実行されました');
      }}>
        モード切替（現在: {isDarkMode ? 'ダーク' : 'ライト'}）
      </button>

      {/* 2. 検索入力欄 */}
      <input
        type="text"
        placeholder="ユーザー名を検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ display: 'block', margin: '10px 0' }}
      />

      {/* 3. 結果の表示（上位5件） */}
      <ul>
        {filteredUsers.slice(0, 5).map((user) => (
          <li key={user.id}>{user.name} (スコア: {user.score})</li>
        ))}
      </ul>
    </div>
  );
}

```
## 注意点

useMemoが効果を発揮しやすいのは、下記のような場合です。
* 重い計算
* ソート
* フィルタ
* 集計
* 計算コストが高い処理
* 大量データの加工

```tsx
const text = useMemo(() => {
  return "React";
}, []);
```

このようなテキストを返すだけのものは使用しない。

## まとめ

計算結果を再利用し、データの加工処理を効率化するための機能である。
依存配列の値が変更されない限り再計算を行わず、不要な計算を減らすことでパフォーマンス改善が期待できる。
ただ、すべての処理に使うと逆にオーバーヘッドになるため、ボトルネックを見極めて適切に導入することが大切。
