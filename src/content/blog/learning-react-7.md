---
author: まっす
pubDatetime: 2026-06-10T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習7】useRefについて
slug: learning-react-7
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はuseRefについて学習した。
---

ReactのuseRefについて学習した。

## Table of contents

## useRefとは

useRefは、Reactのフックの一つで、レンダリングに影響しない値やDOM要素への参照を保持するための機能である。

主な用途は、
- DOM要素へのアクセス
- 再レンダリングせず値を保持する

の2つである。

下記のように宣言する。

```tsx
const ref = useRef(null);
<input ref={ref} />
```

`useRef`は`current`プロパティを持つオブジェクトを返す。
上記は初期値を`null`に設定している。

`ref.current`プロパティは書き換え可能（ミュータブル）。
※以前勉強したstateは書き換え不可（イミュータブル）。

再レンダリングが発生しても`useRef`が保持している`current`の値は維持される。

`<input ref={ref} />`は「`input`要素へ`ref`を設定して下さい」という指示。
Reactの場合、直接DOMを操作することが少ないが、DOMへのアクセスが必要な場合、`document.querySelector`ではなく`useRef`を使うことが推奨される。

## useStateとの違い

`useState`は、変更されると再レンダリングされるのに対し、`useRef`は、値を書き換えても再レンダリングが発生しないため、画面表示とは関係ない値を保持する用途に向いている。

下記は`useState`と`useRef`の違いをわかりやすくするためのコード。

「useStateを更新」「useRefを更新」「useRefの値を表示」のボタンを用意。
useRefが裏で値を保持できている状態がわかる。

```tsx
import { useRef, useState } from "react";

function Counter() {
  const refCount = useRef(0)
  const [count, setCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)
  return (
    <div>
      <p>useState: {count}</p>
      <p>useRefの表示用: {displayCount}</p>

      {/*useStateを更新*/}
      <button onClick={() => {
        setCount((prev) => prev + 1)
      }} >
        useStateを更新
      </button>

      {/*useRefを更新*/}
      <button onClick={() => {
        refCount.current++
        console.log(`useRef:` + refCount.current)
      }} >
        useRefを更新
      </button>

      {/*useRefの値を表示*/}
      <button onClick={() => {
        setDisplayCount(refCount.current)
      }} >
        useRefの値を表示
      </button>
    </div>
  );
}

export default Counter;

```

ちなみに、再読み込みすると`useState`も`useRef`も初期化される。
`useRef`は永続的に値を保持するのではなく、コンポーネントの寿命の間だけ保持する。
また`current`を書き換えても再レンダリングは発生しない。

## useRefの使い方

### フォーカスを当てる

下記は`button`をクリックして`input`にフォーカスを当てる例。
`inputRef.current?.focus();`でDOMを取得→フォーカスを当てる→カーソル移動を行っている。

```tsx
import React, { useRef } from 'react';

function MyComponent() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input id="counter-input" ref={inputRef} />
      <button onClick={handleClick}>Focus</button>
    </div>
  );
}
```

### 所定の位置までスクロールする

下記は`button`をクリックして`ref={scrollRef}`を設定した`div`までスクロールさせる例。
`scrollRef.current?.scrollIntoView();`でDOMを取得→スクロールさせる。
`behavior: 'smooth'`でスムーズにスクロールさせる。

```tsx
import React, { useRef } from 'react';

function MyComponent() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Scroll</button>
      <div className='section'>
        <h2>Section 1</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
      </div>
      <div className='section' ref={scrollRef}>
        <h2>Section 2</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
      </div>
    </div>
  );
}
```

### 読み込み時に入力欄に自動フォーカス

以下は画面読み込み時に`<input id="name-input" ref={inputRef} />`にフォーカスを当てる例。
複数`input`要素があるが、`ref={inputRef}`のある要素が対象。

```tsx
import { useRef, useEffect } from "react";

function AutoFocusTest() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [])

  return (
    <div>
      <label htmlFor="name-input">
        Name:
        <input id="name-input" ref={inputRef} />
      </label>
      <label htmlFor="age-input">
        Age:
        <input id="age-input" />
      </label>
      <label htmlFor="address-input">
        Address:
        <input id="address-input" />
      </label>
    </div>
  );
}

export default AutoFocusTest;

```


### タスク追加時に、一番下のタスクに移動

以下はタスクを追加した際に、一番下のタスクに移動する例。
フォームで`submit`を行うと、追加されたタスクまで移動する。
`ref={i === tasks.length - 1 ? scrollRef : null}`で、最後の要素だけに`scrollRef`を設定している。
tasks を更新すると再レンダリングが行われる。
その後最後の要素に`scrollRef`が設定される。
依存配列にtasksを指定した`useEffect`が実行されるため、新しく追加された要素までスクロールできる。

```tsx
import { useRef, useState, useEffect } from "react";

function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'test 1' },
    { id: 2, text: 'test 2' },
    { id: 3, text: 'test 3' },
  ]);
  const [newTask, setNewTask] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [tasks])

  return (
    <div>
      {tasks.map((item, i) => (
        <div className='section' key={item.id} ref={i === tasks.length - 1 ? scrollRef : null}>
          <h2>{item.id}</h2>
          <p>{item.text}</p>
        </div>
      ))}
      <div className='section'>
        <form onSubmit={(e) => {
          e.preventDefault();
          setTasks((prev) => [...prev, { id: prev.length + 1, text: newTask }]);
          setNewTask('');
        }}>
          <input name='newTask' type='text' value={newTask} onChange={(e) => {
            setNewTask(e.target.value);
          }} />
          <button type='submit'>Send</button>
        </form>
      </div>
    </div>
  );
}

export default TaskList;

```

## まとめ

`useRef`は、DOM要素への参照や、レンダリングに影響しない値を保持するためのフックである。
`useState`は値を更新すると再レンダリングされるが、`useRef`はcurrentを書き換えても再レンダリングは発生しない。
そのため、画面表示とは関係なく値を保持したい場合や、DOM要素へアクセスしたい場合に利用するのが適している。
