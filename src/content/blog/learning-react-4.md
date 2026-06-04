---
author: まっす
pubDatetime: 2026-06-04T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習4】useEffectについて
slug: learning-react-4
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はuseEffectを勉強
---

Reactの基本的な仕組みであるuseEffectについて学習した。

## Table of contents

## 概要

### useEffectとは
useEffectは、Reactのフックの一つで、コンポーネントの副作用を管理するための機能。レンダリング後に副作用を実行するために使用される。

### 副作用とは
副作用とは、コンポーネントのレンダリング以外で行う処理（タイマー処理、イベントリスナー、localStorageへの保存やAPI取得など）を指す。

## useEffectの使い方

### 基本形

以下は読み込むとconsole.logで「test」が出力されるコンポーネント。
`useEffect`の第一引数に実行したい処理、第二引数には依存配列を入れる。
この場合、依存配列は空（[]）にすると、コンポーネントの初回レンダリング時にのみ実行される。
再レンダリング時に毎回実行したい場合は依存配列「[]」を削除する。

```typescript
import React, { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    console.log('初回のみ');
  }, []);
}

export default MyComponent;
```

### 依存配列の指定

以下はボタンをクリックするとカウントが変更されるコンポーネント。
クリック時に`useState`の`setCount`を呼び出してカウントを更新。
`useEffect`の第二引数に依存配列を指定することで、依存する値が変更されたときにEffectを実行する。

```tsx
import React, { useEffect, useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log(`countが変更されたときに実行: ${count}`);
  }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  )
}

export default MyComponent;
```

### 開始、終了の処理

以下はEffectの開始時に`console.log('開始')`を実行、コンポーネントのアンマウント時から1秒後に`console.log('終了')`を実行するコンポーネント。
setTimeoutを使って非同期処理を行っている。
`return`で返した関数はクリーンアップ関数と呼ばれる。
コンポーネントのアンマウント（削除）時に、Effectのクリーンアップ関数が自動的に実行される。

```tsx
import React, { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    console.log('開始');
    return () => {
      setTimeout(() => {
        console.log('終了');
      }, 1000);
    };
  }, []);
}

export default MyComponent;
```

### タイマー処理

以下はEffectの開始時に`const intervalId = setInterval(() => {})`を実行するコンポーネント。1秒おきにカウントアップ。
setIntervalを使って非同期処理を行っている。
終了時にclearIntervalを使ってタイマーを停止する。

```tsx
import React, { useEffect, useState } from 'react';

function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {

    const intervalId = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <p>{count}</p>
    </div>
  );
}

export default Timer;
```

次はEffectの開始時に`const time = setInterval(() => {})`を実行する点は同じだが、現在の日付、時刻を表示するコンポーネント。
先の記述例同様、setIntervalを使って非同期処理、終了時にclearIntervalを使用。

```tsx
import React, { useEffect, useState } from 'react';

function Timer() {
  const [time, setTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <p>{time}</p>
    </div>
  );
}

export default Timer;
```

### localStorageの処理

以下は、まず`useState`でコンポーネントのStateを初期化し、localStorageからデータを取得。
Effectの開始時にカウントアップを実行し、その後、localStorageへの保存を行う。

```tsx
import React, { useEffect, useState } from 'react';

function LocalStorageTest() {
  // useStateの初期化時にlocaStorageからデータを取得。
  // データがなければ0を入れておく
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem('count');
    return savedCount !== null ? Number(savedCount) : 0;
  });

  // カウントアップ
  useEffect(() => {
    const intervalInt = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalInt);
  }, []);

  // localStorageへ保存
  useEffect(() => {
    localStorage.setItem('count', String(count));
  }, [count]);

  return (
    <div>
      <p>{count}</p>
    </div>
  );
}

export default LocalStorageTest;
```

## 注意点

開発環境（StrictMode）では useEffect が2回実行されたように見えることがあります。
これは React が副作用の問題を検出するための開発専用の挙動です。本番環境では1回のみ実行されます。

## まとめ
useEffectを使用すると、コンポーネントのレンダリング後に副作用を実行できる。
依存配列を利用することで、初回のみ実行したり、特定のState変更時に実行したりできる。
