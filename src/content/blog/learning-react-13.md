---
author: まっす
pubDatetime: 2026-07-2T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習13】Zustandについて
slug: learning-react-13
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はZustandについて学習した。
---

ReactのZustandについて学習した。

## Table of contents

## Zustandとは

React向けの軽量な状態管理ライブラリ。
先に勉強したContext APIよりもシンプルに、コンポーネント間での状態を共有できる。

## Contextとの違い

ZustandとContextの違いは、下記のようなものがある。

1. Contextよりも簡潔に書ける。Providerで囲まなくて良い
2. Context APIでは`Provider`のvalueが更新されると、そのContextを利用しているコンポーネントが再レンダリングされる。一方Zustandは必要な状態だけを購読できる。

## Zustandの使い方

### 基本パターン

#### 状態を読む
```tsx
const todos = useTodoStore((state) => state.todos);
```

#### 関数を呼び出す
```tsx
const addTodo = useTodoStore((state) => state.addTodo);
```
下記のように分割代入でまとめて呼び出すことも可能。
```tsx
const { todos, addTodo } = useTodoStore();
```
ただし、store全体を取得するため、必要な値だけselectorで取得する書き方の方が再レンダリングを抑えやすい。

#### 状態を更新する
```tsx
set((state) => ({
  todos: [...state.todos, newTodo],
}));
```

### カウンターの作成

Zustandを使ったカウンターを作成。
`useCountStore`を作成。ここでzustandの`create`関数を使って初期状態と更新関数を定義する。
`CounterStore`型を作成しておく。
関数の型は`() => void`として定義する。

```tsx
import { create } from "zustand";

type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

export const useCountStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () =>
    set((state) => ({
      count: state.count + 1
    })),
  decrement: () =>
    set((state) => ({
      count: state.count > 0 ? state.count - 1 : state.count
    })),
}));
```

実際にカウントアップ・ダウンを行う`Counter`コンポーネントを作成。
ここで`useCountStore`を使ってカウントの値と更新関数を取得する。
定数`count`、`increment`、`decrement`にそれぞれ、`useCountStore`で定義した値、関数を割り当てる。
記述方法は値も関数も基本的に同じ。

```tsx
import { useCountStore } from "./useCountStore";

export const Counter = () => {
  const increment = useCountStore((state) => state.increment);
  const decrement = useCountStore((state) => state.decrement);

  return (
    <div>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};
```

`CounterDisplay`コンポーネントは、カウントの値を表示するだけのコンポーネント。
`Counter`コンポーネントと同様、`useCountStore`を使って`count`の値を取得する。
これで別コンポーネントと`count`の状態を共有することができる。

```tsx
import { useCountStore } from "./useCountStore";

export const CounterDisplay = () => {
  const count = useCountStore((state) => state.count);

  return (
    <div>
      <p>Count Display: {count}</p>
    </div>
  );
};

```

定義した各コンポーネントを読み込み、`App`コンポーネントで使用する。

```tsx
import { Counter } from './Counter';
import { CounterDisplay } from './CounterDisplay';


function App() {
  return (
    <>
      <CounterDisplay />
      <Counter />
    </>
  );
}
export default App;
```

### TODOリストの作成

Zustandを使ってTODOリストを作成する。
カウンター同様の手順で`useTodoStore`を作成する。
型は単体のTodo用の`Todo`と、Zustand用の`TodoStore`を定義する。

`todos`の初期値は単体のTodoの配列で、`addTodo`、`toggleTodo`、`deleteTodo`の各アクションを定義する。

今回、`id`には簡易的に`Date.now()`を使用しているが、実運用ではuuidなどを使うことが多い。

```tsx
import { create } from "zustand";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type TodoStore = {
  todos: Todo[];
  addTodo: (title: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
};

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [{ id: Date.now(), title: "test", completed: false }],
  addTodo: (title) =>
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: Date.now(),
          title,
          completed: false,
      }]
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id)
    })),
}));

```

Todoの入力を行う`TodoInput`を作成。
`useState`を使って入力値を管理し、`handleSubmit`内で`addTodo`アクションを呼び出す。

```tsx
import { useTodoStore } from './useTodoStore';
import { useState } from 'react';

export function TodoInput() {
  const [title, setTitle] = useState('');
  const addTodo = useTodoStore((state) => state.addTodo);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo(title);
    setTitle('');
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}
```

Todoの表示を行う`TodoList`を作成。
`useTodoStore`を使って`todos`を取得し、各Todoの`completed`、`title`、`id`を表示する。
`toggleTodo`と`deleteTodo`アクションを呼び出すボタンを追加する。

```tsx
import { useTodoStore } from './useTodoStore';

export function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  return (
    <>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
            <span>{todo.title}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}

```

定義した各コンポーネントを読み込み、`App`コンポーネントで使用する。

```tsx
import { TodoList } from './TodoList';
import { TodoInput } from './TodoInput';


function App() {
  return (
    <>
      <TodoInput />
      <TodoList />
    </>
  );
}
export default App;
```

## まとめ

ZustandはContextよりもシンプルに状態管理を行うことが可能。
上記で作成した`useTodoStore`や`useCountStore`で一括して状態と更新処理をまとめて管理できるため、コンポーネント間でのデータ受け渡しがシンプルになると感じた。

特にProviderが不要で、必要な状態だけ取得できる点は大きなメリットだと思う。
