---
author: まっす
pubDatetime: 2026-07-15T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習14】TanStack Queryについて
slug: learning-react-14
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はTanStack Queryについて学習した。
---

ReactのTanStack Queryについて学習した。

## Table of contents

## TanStack Queryとは

TanStack Queryはサーバーデータの取得、キャッシュ、同期、更新を管理するライブラリ。
前回勉強した`Zustand`がクライアントの状態を管理するのに対し、`TanStack Query`はサーバーデータの管理を行う。

## TanStack Queryを使用するメリット

- キャッシュ：取得したデータをクエリキーごとに保存できる
- リクエストの重複排除：同じクエリに対する同時リクエストをまとめられる
- バックグラウンド更新：条件に応じて古いデータを自動で再取得できる
- 通信状態の管理：ローディングやエラー管理用のStateを自分で用意する必要がない

## TanStack Queryの利用場面例

- 自動キャッシュ
- バックグラウンド更新
- 重複リクエストの排除
- ローディング・エラー状態の管理
- ページネーション・無限スクロール対応


## インストール

今回はpnpmを使用しているため、次のコマンドでインストールする。
```
pnpm add @tanstack/react-query
```

## QueryClientProviderの設定

TanStack Queryを使用するには、アプリケーションを`QueryClientProvider`で囲む必要がある。

`main.tsx`でプロバイダーの設定。
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)

```

`QueryClient`は、TanStack Queryのキャッシュやクエリの設定を管理するインスタンス。
作成した`queryClient`を`QueryClientProvider`の`client`へ渡すことで、その配下にあるコンポーネントからTanStack Queryを利用できる。

`QueryClient`をコンポーネント内で作成すると、再レンダリングのたびに新しいインスタンスが作られる可能性がある。そのため、通常はコンポーネントの外側で作成する。

## useQueryの基本的な使い方

次は、`useQuery`を使用してJSONPlaceholderからTodo一覧を取得する例。

`queryKey`はキャッシュを識別するための一意なキー。TanStack Queryのクエリキーは配列で指定する。
`queryFn`はデータを取得するためのPromiseを返す関数。ここでは`fetch`を使用してAPIからデータを取得している。
取得に失敗した場合はエラーを投げる。
TanStack Queryは、`queryFn`が返したPromiseの成功または失敗をもとに、クエリの状態を管理する。

```tsx
import { useQuery } from '@tanstack/react-query';

type Todo = {
  id: number;
  title: string;
}

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/todos/',
  );

  if (!response.ok) {
    throw new Error('Todoの取得に失敗しました');
  }

  return response.json();
}


function  TanstackTest() {
  const { data: todos = [], isPending, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {todos.map((todo: Todo) => {
        return <div key={todo.id}>{todo.title}</div>;
      })}
    </div>
  );
}

export default TanstackTest;
```

### useQueryの主な戻り値
`useQuery`からは、取得したデータだけでなく、通信状態やエラー情報なども受け取れる。

#### data

取得したデータ。

```tsx
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
});
```

データを取得する前は`undefined`になる可能性がある。

次のように初期値を設定すると、JSX内で`undefined`を確認せずに利用できる。

```tsx
const { data: todos = [] } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
});
```

#### isPending

クエリにまだ利用可能なデータがなく、`status`が`pending`の場合にtrueになる。
通常の自動実行されるクエリでは、初回ローディングの判定として利用できる。

```tsx
if (isPending) {
  return <p>Loading...</p>;
}
```

#### isFetching

`queryFn`が実行されている間はtrueになる。
初回のデータ取得だけでなく、バックグラウンドでの再取得中もtrueになる。

```tsx
{isFetching && <p>データを更新中...</p>}
```

#### isLoading

初回のデータ取得が実際に行われている間だけtrueになる。
TanStack Query v5では、次の状態に相当する。

```tsx
isLoading = isPending && isFetching;
```

通常の自動実行されるクエリでは、`isPending`を初回表示に利用できる。
一方、`enabled: false`などでクエリを無効化している場合は、データ取得前から`isPending`がtrueになる。そのため、実際に通信中かどうかを判断したい場合は`isLoading`を使用する。

#### isSuccess

クエリが成功し、`status`が`success`の場合にtrueになる。

#### isError

クエリが失敗し、`status`が`error`の場合にtrueになる。

#### error

クエリの実行中に発生したエラー。
```tsx
if (isError) {
  return <p>Error: {error.message}</p>;
}
```

`isPending`や`isError`は、`status`から導かれる真偽値。
一方、`error`は状態名ではなく、発生したエラーの内容を持つオブジェクトである。

#### statusとfetchStatus

TanStack Queryでは、データの状態と通信の状態が分けて管理されている。
`status`には、次の値がある。
```
pending
error
success
```

`fetchStatus`には、次の値がある。
```
fetching
paused
idle
```

`status`は「利用できるデータがあるか」「エラーになったか」を表す。

`fetchStatus`は「現在通信しているか」を表す。

そのため、キャッシュ済みデータを表示しながらバックグラウンドで再取得している場合は、次のような組み合わせになる。

```
status: success
fetchStatus: fetching
```

`isFetching`は、`fetchStatus`が`fetching`かどうかを判定しやすくした値である。

### キャッシュとstaleTime

TanStack Queryは、取得したデータをクエリキーごとにキャッシュする。

ただし、初期設定では、取得したデータはすぐに「古いデータ」として扱われる。

キャッシュがすぐ削除されるという意味ではない。

キャッシュは残っているが、コンポーネントの再マウント、ウィンドウへの再フォーカス、ネットワークへの再接続などをきっかけに、バックグラウンドで再取得される可能性がある。

一定時間は新しいデータとして扱いたい場合は、`staleTime`を設定する。

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 60 * 1000,
});
```

この例では、取得後1分間はデータが新しい状態として扱われる。

利用されなくなったクエリは非アクティブな状態になり、初期設定では5分後にキャッシュから削除される。この時間は`gcTime`で変更できる。

### キャッシュの取得と削除

キャッシュの仕組みを確認するため、手動でデータを取得し、キャッシュを削除するデモを作成した。

```tsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type Todo = {
  id: number;
  title: string;
};

const todosQueryKey = ['todos'] as const;

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos');

  if (!response.ok) {
    throw new Error('Todo の取得に失敗しました');
  }

  return response.json();
}

function TanstackTest() {
  const queryClient = useQueryClient();
  const [forceRerender, setForceRerender] = useState(0);
  const { error, isFetching, refetch } = useQuery({
    queryKey: todosQueryKey,
    queryFn: fetchTodos,
    enabled: false,
  });

  const removeCachedTodos = () => {
    queryClient.removeQueries({ queryKey: todosQueryKey, exact: true });
    setForceRerender((version) => version + 1);
  };

  const cachedTodos = queryClient.getQueryData<Todo[]>(todosQueryKey);
  const queryState = queryClient.getQueryState(todosQueryKey);
  const hasCachedData = cachedTodos !== undefined;

  if (isFetching) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <p>キャッシュ済みデータ: {hasCachedData ? 'あり' : 'なし'}</p>
      <p>キャッシュ件数: {cachedTodos?.length ?? 0}</p>
      <p>
        最終更新: {queryState?.dataUpdatedAt
          ? new Date(queryState.dataUpdatedAt).toLocaleTimeString()
          : '未取得'}
      </p>

      <button
        type='button'
        onClick={() => void refetch()}
        disabled={isFetching}
      >
        {isFetching ? '取得中...' : 'データを取得'}
      </button>
      <button
        type='button'
        onClick={() => removeCachedTodos()}
        disabled={!hasCachedData || isFetching}
      >
        {isFetching ? '削除中...' : 'キャッシュを削除'}
      </button>

      <ul>
        {cachedTodos?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default TanstackTest;

```

`useQueryClient`を使用すると、`QueryClientProvider`に設定した`QueryClient`のインスタンスをコンポーネント内から取得できる。

```tsx
const queryClient = useQueryClient();
```

`getQueryData`は、指定したクエリキーに保存されているキャッシュを同期的に取得する。

```tsx
queryClient.getQueryData<Todo[]>(todosQueryKey);
```

該当するキャッシュが存在しない場合は`undefined`になる。

`getQueryState`は、指定したクエリの状態を取得する。

```tsx
queryClient.getQueryState(todosQueryKey);
```

今回は、最後にデータが更新された時刻を表す`dataUpdatedAt`を取得している。

`removeQueries`は、条件に一致するクエリをキャッシュから削除する。

```tsx
queryClient.removeQueries({
  queryKey: todosQueryKey,
  exact: true,
});
```

`exact: true`を指定すると、クエリキーが完全に一致するクエリだけが対象になる。指定しなければ、先頭部分が一致する複数のクエリも対象になる場合がある。

`getQueryData`や`getQueryState`は、キャッシュの現在値を読み取るメソッドであり、それ自体にはReactコンポーネントを再レンダリングする仕組みがない。
今回のデモでは、キャッシュ削除後にStateを更新してコンポーネントを再レンダリングし、キャッシュの状態を画面へ反映している。

通常のデータ表示では、`getQueryData`を毎回使用するのではなく、`useQuery`から返される`data`を使用する方が自然である。

### enabledによる自動取得の無効化

先ほどの例では、次の設定を使用している。

```tsx
enabled: false;
```

`enabled: false`を設定すると、コンポーネントが表示されてもクエリは自動実行されない。
`refetch`を呼び出すことで、手動でデータを取得できる。

```tsx
const { refetch } = useQuery({
  queryKey: todosQueryKey,
  queryFn: fetchTodos,
  enabled: false,
});

await refetch();
```

ただし、常に`enabled: false`にしてボタンから`refetch`する方法では、TanStack Queryの自動再取得などの機能を利用しにくくなる。

そのため、通常は自動的に取得する形を基本とし、検索条件が入力されるまで取得したくない場合などに`enabled`を使用する。

`refetch`を実行した場合は、useQueryが管理する`isFetching`などの状態が変化するため、コンポーネントは自動的に再レンダリングされる。
一方、`getQueryData`や`getQueryState`はキャッシュを読み取るためのメソッドであり、それ自体にはコンポーネントを再レンダリングする仕組みがない。
今回のデモでは、`removeQueries`の実行後にStateを更新することで再レンダリングを発生させ、削除後のキャッシュ状態を画面へ反映している。

### WordPressの記事取得

WordPress REST APIから記事を取得する場合も、基本的な構造は同じ。
APIのレスポンスに合わせて型を設定する。

```tsx
import { useQuery } from '@tanstack/react-query';

type WpPost = {
  id: number;
  title: {
    rendered: string;
  };
};

const wpQueryKey = ['wpPosts'] as const;

async function fetchWpPosts(): Promise<WpPost[]> {
  const response = await fetch('https://sample.com/wp-json/wp/v2/posts');

  if (!response.ok) {
    throw new Error('記事の取得に失敗しました');
  }

  return response.json();
}

function GetWPPosts() {
  const { data: posts = [], isPending, isError, error, } = useQuery({
    queryKey: wpQueryKey,
    queryFn: fetchWpPosts,
  });

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title.rendered}</li>
      ))}
    </ul>
  );
}

export default GetWPPosts;

```

WordPressの記事タイトルは、次のようなオブジェクトになっている。
```
{
  "title": {
    "rendered": "記事タイトル"
  }
}
```

そのため、タイトルを表示するときは次のように記述する。
```tsx
post.title.rendered;
```

一覧を表示する際の`key`には、配列の番号ではなく、WordPressの記事IDである`post.id`を使用する。
```tsx
<li key={post.id}>
  {post.title.rendered}
</li>
```


### 古いデータを残したままキャッシュを更新

<!--WordPressサイトから記事を取得、古い一覧を表示したまま、新しいデータを取得するサンプル。
`invalidateQueries`は「キャッシュを残したまま、最新の状態にする」ことが可能。-->


```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';

type WpPost = {
  id: number;
  title: {
    rendered: string;
  };
};

const wpQueryKey = ['wpPosts'] as const;

async function fetchWpPosts(): Promise<WpPost[]> {
  const response = await fetch('https://daigando.sakura.ne.jp/test/green_catalysis/wp-json/wp/v2/topics');

  if (!response.ok) {
    throw new Error('記事の取得に失敗しました');
  }

  return response.json();
}

function GetWPPosts() {
  const queryClient = useQueryClient();
  const { data: posts = [], dataUpdatedAt ,error, isFetching, isPending } = useQuery({
    queryKey: wpQueryKey,
    queryFn: fetchWpPosts,
  });

  const invalidateWpPosts = async () => {
    await queryClient.invalidateQueries({
      queryKey: wpQueryKey,
      exact: true,
    });

  };

  const removeWpPosts = () => {
    queryClient.removeQueries({ queryKey: wpQueryKey, exact: true });
    console.log('キャッシュを削除しました');
  };

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <p>キャッシュ件数: {posts.length}</p>
      <p>
        最終更新:
        {dataUpdatedAt
          ? new Date(dataUpdatedAt).toLocaleTimeString()
          : '未取得'}
      </p>

      <button
        type='button'
        onClick={() => void invalidateWpPosts()}
        disabled={isFetching}
      >
        {isFetching ? '取得中...' : '記事を最新化'}
      </button>
      <button
        type="button"
        onClick={removeWpPosts}
        disabled={isFetching}
      >
        キャッシュを削除
      </button>

      {isFetching && <p>古いキャッシュを表示したまま更新中...</p>}

      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title.rendered}</li>
        ))}
      </ul>

    </div>
  );
}

export default GetWPPosts;

```

`invalidateQueries`は、指定したキャッシュを直接新しいデータに書き換えるメソッドではない。
対象のクエリを「古い状態」として無効化するメソッド。

```tsx
await queryClient.invalidateQueries({
  queryKey: wpQueryKey,
  exact: true,
});
```

対象のクエリが画面上で使用されている場合、初期設定ではバックグラウンドで再取得される。
再取得中も以前の`data`は残っているため、記事一覧を表示したまま`isFetching`を使って更新中の表示を出せる。

```tsx
{isFetching && (
  <p>古いデータを表示したまま更新中...</p>
)}
```

`invalidateQueries`を実行すると、対象クエリは`staleTime`の設定に関係なく古い状態になる。
そのうえで、現在使用中のクエリはバックグラウンドで再取得される。

### removeQueriesとinvalidateQueriesの違い

removeQueriesとinvalidateQueriesは、どちらもQueryClientから使用できるが、役割が異なる。

#### removeQueries

キャッシュそのものを削除する。

```tsx
queryClient.removeQueries({
  queryKey: ['wpPosts'],
  exact: true,
});
```

ログアウト時にユーザー固有のキャッシュを削除したい場合などに使用できる。

#### invalidateQueries

キャッシュを残したまま、データを古い状態にする。

```tsx
await queryClient.invalidateQueries({
  queryKey: ['wpPosts'],
  exact: true,
});
```

画面で使用中のクエリであれば、バックグラウンドで再取得される。
記事の追加、更新、削除などによって、現在のキャッシュが古くなったことが分かっている場合に使用する。

```
removeQueries → キャッシュを削除する
invalidateQueries → キャッシュを古い状態にして再取得を促す
```

## まとめ

`Zustand`に続き、状態管理を行う`TanStack Query`について勉強した。
両者は同じ状態管理ライブラリとして扱われることがあるが、主な役割は異なる。

```
クライアント状態 → Zustand
サーバー状態     → TanStack Query
```
Zustandは、モーダルの開閉、入力途中の値、画面上の選択状態など、アプリケーション内部の状態管理に向いている。
TanStack Queryは、APIから取得したデータのキャッシュ、再取得、同期、更新状態の管理に向いている。
`fetch`だけでデータを取得する場合は、データ、ローディング、エラーなどを個別に管理する必要がある。

TanStack Queryの`useQuery`を使用すると、次の処理をまとめて扱える。

- APIからのデータ取得
- データのキャッシュ
- 初回ローディング状態
- バックグラウンドでの再取得状態
- エラー状態
- キャッシュの無効化と再取得

今回の学習では、`useQuery`による基本的なデータ取得に加えて、`getQueryData`、`removeQueries`、`invalidateQueries`を使ったキャッシュ操作も確認した。
