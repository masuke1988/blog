---
author: まっす
pubDatetime: 2026-06-08T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習6】API通信
slug: learning-react-6
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はAPI通信について学習した。
---

ReactのAPI通信について学習した。

## Table of contents

## APIとは

APIとは、アプリケーション同士がデータをやり取りするための窓口のような仕組み。

天気予報情報を取得したり、microCMSのようなCMSと連携し、記事データを取得したりできる。

## API通信の基本形

データを取得する時にはfetchを使う。

```typescript
fetch('https://api.example.com/');
```

下記の例では、`https://api.example.com/`からデータを取得、レスポンスがあった場合、jsonに変換、`console.log(data);`で内容を表示。
また取得したdataを返す。

```typescript
async function getPost() {
  const res = await fetch('https://api.example.com/');
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }
  const data = await res.json();
  return data;
}
```

## 使用例

### fetchを使って投稿データを取得

`useEffect`を使って、コンポーネントがマウントされた際にfetchを使ってAPI通信を行う。
fetchを使って`https://jsonplaceholder.typicode.com/todos/`からTODOリストを取得し、jsonに変換した後に`useState`で管理する。
`useEffect`を使って、コンポーネントがマウントされた際にAPI通信を行う。

```typescript

import { useEffect, useState } from 'react';

type Todo = {
  id: number;
  title: string;
}

function GetPost() {
  const [todos, setTodos] = useState<Todo[]>([]);

  async function getPost() {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/');
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const data = await res.json();
    return data;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setTodos(await getPost());
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>TODO</h1>
      <ul>
        {todos.map((todo) => {
          return <li key={todo.id}>{ todo.title }</li>;
        })}
      </ul>
    </div>
  );
}

export default GetPost;

```

fetchが完了するまで`Loading...`を表示させる場合は下記のように`useState`を使って管理する。
`res.ok`が`false`の場合は空の配列を設定する。`true`の場合はjsonデータに変更後、`setTodos`に設定する。
ローディング終了処理はfinallyで行う。

```typescript
import { useEffect, useState } from 'react';

type Todo = {
  id: number;
  title: string;
}

function GetPost() {  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getPosts() {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos/');

      // レスポンスが正常でない場合は空の配列を設定してローディングを終了する
      if (!res.ok) {
        setTodos([]);
        return;
      }
      
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div>
      <h1>TODO</h1>
      {isLoading && <p>Loading...</p>}
      <ul>
        { todos.length === 0 ? <li>データがありません</li> :
          todos.map((todo) => {
            return <li key={todo.id}>{ todo.title }</li>;
          })
        }
      </ul>
    </div>
  );

}

export default GetPost;

```

### WordPressからデータを取得

WordPressのREST APIを使って、データを取得する。
WordPressで作成されたサイトの`/wp-json/wp/v2/posts`にアクセスすると、オブジェクト形式のデータが返ってくる。
今回はタイトル取得のみ紹介する。本文表示にはHTML文字列の扱いが必要。

```typescript
import { useState, useEffect } from 'react';

type Post = {
  id: number;
  title: {
    rendered: string;
  };
}

function Loading() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getPosts() {
    try {
      const res = await fetch('https://sample.com/wp-json/wp/v2/posts');

      // レスポンスが正常でない場合は空の配列を設定してローディングを終了する
      if (!res.ok) {
        setPosts([]);
        return;
      }

      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div>
      <h1>WordPressのREST API</h1>
      {isLoading && <p>Loading...</p>}
      <ul>
        {posts.map((post) => {
          return (
            <li key={post.id}>
              {post.title.rendered}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Loading;

```


### fetchを使ったPOST

フォームを使って、テキストをPOSTする。
`https://jsonplaceholder.typicode.com/posts/`は実際にはデータベースへ保存されないモックAPIなので、POSTした結果をフォーム下に表示し、確認する。

```typescript
import { useState } from 'react';

type Result = {
  title: string;
  id: number;
};

function PostForm() {
  const [title, setTitle] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
      {result && (
        <div>
          <p>{result.title}</p>
          <p>{result.id}</p>
        </div>
      )}
    </div>
  );
}

export default PostForm;
```

### その他のメソッド

これまでの例では、`GET`と`POST`のみを扱ってきたが、その他のメソッドも同様に扱うことができる。

- `PUT`
- `DELETE`
- `PATCH`
- `HEAD`
- `OPTIONS`


## まとめ

fetchを使って、HTTPリクエストを送信し、データを取得することができる。
通信エラーやサーバーエラーは`try...catch`を使って処理できる。
`GET`や`POST`などのメソッドを指定することで、異なるリクエストを送信できる。
API通信の処理は複数のコンポーネントで共通化したくなることが多い。
そのような場合は、次回学習するカスタムフックを利用して再利用できる。
なお、実際の開発では認証情報の送信やエラーハンドリング、キャッシュ管理なども必要になる。
