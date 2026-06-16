---
author: まっす
pubDatetime: 2026-06-16T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習10】useReducerによる状態管理
slug: learning-react-10
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はuseReducerによる状態管理について学習した。
---

ReactのuseReducerによる状態管理について学習した。

## Table of contents

## useReducerとは

`useReducer`は、Reactコンポーネントの状態（state）を管理するためのフック。
`useState`と同じく状態管理に使用するが、複雑な状態管理や複数の更新ルールを1箇所にまとめたい場合に適している。
状態更新のロジックを集約できるため、大規模なコンポーネントで管理しやすくなる。

## useReducerの基本

`useReducer`の基本的な要素は下記の通り。

- 状態（state：コンポーネント内で管理するデータ）
- アクション（action：状態をどのように更新するかを指定。typeプロパティを持ち、更新の種類を区別できる）
- リデューサー（現在の状態とアクションを受け取り、新しい状態を返す）
- dispatch（アクションを実行し、状態の更新を実行する関数）


## useReducerの使い方

簡単な例を下記に示す。
`useReducer`を使用したカウンターを作成。
`reducer`で現在のstateとactionを受け取り、新しいstateを返す。
条件分岐は`switch`文を使用し、`action.type`に基づいて状態を更新している。

```tsx
import { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, 0);
  return (
    <>
      <p>カウント{state}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}

export default Counter;

```

## useReducerを使ったTODOリスト

`useReducer`を使用してTODOリストを作成する例を下記に示す。
初期値として`{ todos: [{ id: 0, text: 'test' }] }`を設定している。
追加、削除、リセットの`action`を使用して状態を更新している。
`action.payload`には、状態更新に必要な追加データを渡すことができる。
今回の場合、`add`では`inputValue`の値を渡し、`remove`では`todo.id`を渡し、削除するTodoのid情報を渡している。
`reset`では`todos`を空にしている。

`id`は、実際の開発ではUUIDやデータベースのIDを利用することが多い。

```tsx
import { useReducer, useState } from 'react';

type Action = {
  type: 'add' | 'remove' | 'reset';
  payload?: string | number;
}

type State = {
  todos: { id: number; text: string | number }[];
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return { todos: [...state.todos, { id: state.todos.length, text: action.payload }] };
    case 'remove':
      return { todos: state.todos.filter(todo => todo.id !== action.payload) };
    case 'reset':
      return { todos: [] };
    default:
      return state;
  }
}

function TodoList() {

  const [state, dispatch] = useReducer(reducer, { todos: [{ id: 0, text: 'test' }] });
  const [inputValue, setInputValue] = useState('');


  return (
    <>
      <div>
        <form onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: 'add', payload: inputValue });
          setInputValue('');
        }}>
          <input type="text" value={inputValue} onChange={(e) => {
            setInputValue(e.target.value);
          }}/>
          <button type="submit">Add</button>
        </form>

        <ul>
          {state.todos.map((todo) => (
            <li key={todo.id}>{todo.id} : {todo.text}
              <button onClick={() => {
                dispatch({ type: 'remove', payload: todo.id });
              }}>Remove</button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => {
          dispatch({ type: 'reset' });
        }}>Reset</button>
      </div>
    </>
  );
}

export default TodoList;

```

## useReducerを使ったショッピングカート

`useReducer`を使用してTODOリストに情報を追加し、ショッピングカートを作成。
初期値は`{ items: [] }`と設定している。
追加、削除、リセットに加え、商品の数量管理用に`increment`と`decrement`の`action`を追加。
`reducer`の分岐にも`increment`と`decrement`を追加。
`action.payload`には、`id` `name` `num`のデータを渡すことを想定。

```tsx
import { useReducer, useState } from 'react';

type Action = {
  type: 'add' | 'remove' | 'reset' | 'increment' | 'decrement';
  payload?: {
    id?: number;
    name?: string;
    num?: number;
  };
}

type Item = {
  id: number;
  name: string;
  num: number;
}

type State = {
  items: Item[];
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return { 
        items: [...state.items, { 
          id: action.payload?.id ?? state.items.length,
          name: action.payload?.name ?? '',
          num: action.payload?.num ?? 1 
        }] 
      };
    case 'remove':
      return { 
        items: state.items.filter(item => item.id !== action.payload?.id) 
      };
    case 'increment':
      return { 
        items: state.items.map(item => item.id === action.payload?.id ? { ...item, num: item.num + 1 } : item) 
      };
    case 'decrement':
      return { 
        items: state.items.map(item => item.id === action.payload?.id ? { ...item, num: Math.max(0, item.num - 1) } : item) 
      };
    case 'reset':
      return { 
        items: [] 
      };
    default:
      return state;
  }
}

function Cart() {

  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [inputValue, setInputValue] = useState('');
  const [numValue, setNumValue] = useState(1);


  return (
    <>
      <div>
        <form onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: 'add', payload: { name: inputValue, num: numValue } });
          setInputValue('');
          setNumValue(1);
        }}>
          <input type="text" value={inputValue} onChange={(e) => {
            setInputValue(e.target.value);
          }}/>
          <input type="number" value={numValue} onChange={(e) => {
            setNumValue(e.target.value);
          }} />

          <button type="submit">Add</button>
        </form>

        <ul>
          {state.items.map((item) => (
            <li key={item.id}>{item.name}：{item.num}
              <button type="button" onClick={() => {
                dispatch({ type: 'increment', payload: { id: item.id } });
              }}>+1</button>
              <button type="button" onClick={() => {
                dispatch({ type: 'decrement', payload: { id: item.id } });
              }}>-1</button>
              <button onClick={() => {
                dispatch({ type: 'remove', payload: { id: item.id } });
              }}>Remove</button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => {
          dispatch({ type: 'reset' });
        }}>Reset</button>
      </div>
    </>
  );
}

export default Cart;

```

## まとめ

`useReducer`を使用すれば、複数の状態管理と追加や削除、アップデート、フィルターなどのアクションの分岐をわかりやすくまとめることができる。
単体の状態管理の場合は、`useState`を使用するよう使い分けは必要。
この記事に書いたサンプルコードでも、`useReducer`の`payload`に使用する値を`useState`で一時的に保持している。

`useState`でも同じことは実現できるが、状態更新のパターンが増えてくるとコードが分散しやすくなる。
そのような場合はuseReducerを利用することで、状態更新のロジックを1箇所にまとめることができ、保守しやすいコードを書くことができる。
