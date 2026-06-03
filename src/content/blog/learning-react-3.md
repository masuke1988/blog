---
author: まっす
pubDatetime: 2026-06-02T8:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習3】useStateについて
slug: learning-react-3
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はuseStateを勉強
---

Reactの基本的な仕組みであるuseStateについて学習した。

## Table of contents

## 概要

### useStateとは
useStateは、Reactのフックの一つで、コンポーネントのState（状態）を管理するための機能。

### フックとは
Reactのフックは、コンポーネントの状態やライフサイクルを管理するための関数。

### Stateとは
コンポーネントの状態を表すデータ。これを更新してUIを変化させる。
Stateが更新されると、Reactが再レンダリングして画面を更新してくれる。

### useStateの使い方
useStateは、コンポーネント内で使用する。
使用する際は、「 [count, setCount] 」のように、現在のStateとStateを更新する関数をセットで定義する。

### useStateの基本的な使い方：数値の増減

以下はボタンをクリックするとカウントが増減するコンポーネント。
`useState(0)`とすることで初期値を0としている。

```tsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      {/*増やすボタン*/}
      <button onClick={() => setCount(count + 1)}>+1</button>

      {/*減らすボタン*/}
      <button onClick={() => setCount(count - 1)}>-1</button>
    </div>
  );
}
```

### useStateの基本的な使い方：文字列の変更

以下はボタンをクリックすると名前が変更されるコンポーネント。
`useState('')`とすることで初期値を空文字列としている。
クリックすると、「John」という文字列に変更される。

```tsx
import React, { useState } from 'react';

function UserName() {
  const [name, setName] = useState('');
  return (
    <div>
      <p>Name: {name}</p>
      <button onClick={() => setName('John')}>Johnに変更</button>
    </div>
  );
}
```

入力した文字列を表示したい場合
```tsx
import React, { useState } from 'react';

function UserName() {
  const [name, setName] = useState('');
  return (
    <div>
      <p>Name: {name}</p>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}
```

### useStateの基本的な使い方：booleanの変更

以下はチェックボックスをクリックすると表示/非表示が切り替わるコンポーネント。
`useState(false)`とすることで初期値をfalseとしている。

```tsx
import React, { useState } from 'react';

function ToggleVisibility() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <input type="checkbox" checked={isOpen} onChange={() => setIsOpen(!isOpen)} />
      <p>{isOpen ? 'Open' : 'Closed'}</p>
    </div>
  );
}
```

### useStateの基本的な使い方：オブジェクトの変更

以下はオブジェクトに格納された名前と年齢を設定するコンポーネント。
`useState`に初期値のオブジェクトを設定している。
入力欄からデータを更新できる。
オブジェクトを更新する場合は、スプレッド構文（...）を利用して既存の値をコピーしてから更新する。

```tsx
import React, { useState } from 'react';

const userData = {
  name: "大阪たろう",
  age: 38
}

function UserInfo() {
  const [user, setUser] = useState(userData);
  return (
    <div>
      <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
      <input type="number" value={user.age} onChange={(e) => setUser({ ...user, age: Number(e.target.value) })} />
      <p>{user.name}</p>
      <p>{user.age}</p>
    </div>
  );
}
```

### useStateの基本的な使い方：配列の変更

以下は配列に格納されたタスクを表示、フォームから更新するコンポーネント。
`useState`に初期値の配列を設定している。
入力欄からデータを更新できる。
配列のStateは直接配列の値を変更せず、新しい配列を作成してから更新する。
push()やsplice()などで既存の配列を直接変更するのではなく、filter()やmap()、スプレッド構文(...)を利用して新しい配列を作成する。

```tsx
import React, { useState } from 'react';

type Todo = string

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    '買い物',
    'ジム'
  ]);

  const [text, setText] = useState('')
  
  return (
    <div>
      {todos.map((todo, i) => (
        <p key={i}>
          {todo} 
          <button onClick={() => setTodos(todos.filter((_, index) => index !== i))}>削除</button>
        </p>
      ))}

      <div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return
          setTodos([...todos, text])
          setText('')
        }}>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit">追加</button>
        </form>
      </div>
    </div>
  );
}
```

## まとめ
`useState`はReactのフックの一つで、コンポーネント単位で状態を管理するための仕組み。
`onClick`や`onChange`などのイベントをきっかけにStateを更新できる。これらでStateが更新すると、Reactがコンポーネントを再レンダリングし、変更内容を画面へ反映してくれる。
ただし、更新したデータは再読み込みで元に戻る。
複数コンポーネントで状態を共有したい場合は、ContextやZustandなどの仕組みを使用する。
