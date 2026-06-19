---
author: まっす
pubDatetime: 2026-06-19T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習12】Contextについて
slug: learning-react-12
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はContextについて学習した。
---

ReactのContextについて学習した。

## Table of contents

## Contextとは

一般的にContextは特定の状況、状態に関する情報を指す。
「アプリケーションにユーザーがログインしている」「どのユーザーが操作を行なっているか」「使用中の言語」など、がそれに該当する。
また、「ダークモード」などのアプリケーション全体に関わるグローバルな設定も関係する。

ReactにおけるContextは、複数のコンポーネントで共有したい状態や値を管理する仕組みである。
ユーザーのログインの状態や言語設定などの情報は、いろんなコンポーネントで使用する可能性がある。

コンポーネントが情報を取得する場合、Propsを介して情報を渡す必要がある。
しかし、コンポーネントの階層が深くなると、各コンポーネント毎にPropsを渡す記述が増えるため、管理が難しくなる。

そこでContextを使用すると、コンポーネントが直接それらの情報を取得できるようになる。

ReactのContextは、`useContext`というHookを使用して、コンポーネントがContextの値を取得できるようになる。


## useContextの使い方

### サンプル
簡単なサンプルを記載する。

`TestContext.tsx`で`createContext`と`useContext`を使用して、Contextの作成と使用に関する設定を行う。
各コンポーネントで使用できるよう`export`する。


子コンポーネント`TestComponent.tsx`では、コンポーネント内で`useTestContext`を変数`value`に代入する。
`value`は任意の位置で`{value}`として表示する。

親コンポーネントでは、`TestContext`と`TestComponent`をimport。
作成したContextを使用して、`TestContext.Provider`の`value`で値を渡す。`Provider`は名前の通り、データを配る役目があります。
今回の例では、渡す値は`const value`で定義している。
値を渡したいコンポーネントは`TestContext.Provider`で囲う。

親コンポーネント`App.tsx`
```jsx
import { TestContext } from './context/TestContext';
import TestComponent from './components/TestComponent';

function App() {
  const value = '渡す情報';

  return (
    <TestContext.Provider value={value}>
      <TestComponent />
    </TestContext.Provider>
  );
}
export default App;
```

子コンポーネント`TestComponent.tsx`
```tsx
import { useTestContext } from '../context/TestContext';

function TestComponent() {
  const value = useTestContext();

  return (
    <div>
      <p>{value}</p>
    </div>
  );
}

export default TestComponent;

```

コンテキストの設定`TestContext.tsx`
```tsx
import { useContext, createContext } from "react";

type TestContextType = string;
export const TestContext = createContext<TestContextType | null>(null);

export function useTestContext() {
  const context = useContext(TestContext);

  if (context === null) {
      throw new Error('useTestContext must be used inside TestContextProvider');
  }
  return context;
}
```

### ユーザーの追加、一覧

名前と権限を選択し、ユーザー登録を行う機能を作成。
登録後は一覧表示に追加する。

`UserContext.tsx`で`createContext`と`useContext`を使用して、Contextの作成と使用に関する設定を行う。
各コンポーネントで使用できるよう`export`する。
`type`も合わせて定義しておく。`User`はユーザーの情報を表す型。他コンポーネントでも使用するので、`export`する。

`UserProvider.tsx`で`UserContext.Provider`を使用して、Contextの値を渡す。
`type UserProviderProps`を定義して、`children`と`value`を受け取る。
`value`で受け取るのは`users`と`addUser`。
`users`は`initialUsers`で初期値を設定する。
`addUser`はユーザーを追加する関数。

`UserComponent.tsx`で表示部分とフォームを作成する。
`useUserContext`を使用して、Contextの値`users`と`addUser`を取得する。
`users`は`map`を使用して、ユーザーの一覧を表示する。
`addUser`はフォームで入力されたユーザー情報を追加する。


親コンポーネント`App.tsx`
```tsx
import { UserProvider } from './chapters/context/UserProvider';
import { UserComponent } from './chapters/context/UserComponent';

function App() {
  return (
    <UserProvider>
      <UserComponent />
    </UserProvider>
  );
}
export default App;
```

コンテキストの設定`UserContext.tsx`
```tsx
import { createContext, useContext } from "react";

export type User = {
  id: number;
  name: string;
  role: "admin" | "editor";
}
type UserContextValue = {
  users: User[];
  addUser: (name: string, role: User["role"]) => void;
};

export const UserContext = createContext<UserContextValue | null>(null);

export function useUserContext() {
  const context = useContext(UserContext);

  if (context === null) {
     throw new Error('useUserContext must be used within UserProvider');
  }
  return context
}
```

プロバイダーの設定`UserProvider.tsx`
```tsx
import { useState, type ReactNode } from "react";
import { UserContext, type User } from "./UserContext";

type UserProviderProps = {
  children: ReactNode;
}

const initialUsers: User[] = [
  {id: 1, name:'Taro', role: 'admin'},
  {id: 2, name:'Hanako', role: 'editor'},
];

export function UserProvider({ children }: UserProviderProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const addUser = (name: string, role: User["role"]) => {
    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: currentUsers.length + 1,
        name,
        role,
      },
    ])
  }

  return (
    <UserContext.Provider value={{ users, addUser }}>
      {children}
    </UserContext.Provider>
  );
}

```

コンポーネントの作成`UserComponent.tsx`
```tsx
import { useState } from 'react';
import { useUserContext } from './UserContext';

export function UserComponent() {
  const { users, addUser } = useUserContext();
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('editor');

  return (
    <div>
      <ul>
        {users.map((user) => {
          return <li key={user.id}>
            {user.name} ({user.role})</li>;
        })}
      </ul>
      <form onSubmit={(e) => {
        e.preventDefault();

        if (!newUserName.trim()) return;
        
        addUser(newUserName, newUserRole);
        setNewUserName('');
        setNewUserRole('editor');
      }}>
        <input
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
        />
        <select
          value={newUserRole}
          name="role"
          onChange={(e) => setNewUserRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}
```

## まとめ

Contextは、複数のコンポーネントで共有したい値を管理するための仕組みである。
通常、親から子へ値を渡す場合にはPropsを使用するが、コンポーネントの階層が深くなると、何度もPropsを渡す必要があり管理が煩雑になる。
Contextを使うことで、階層の深いコンポーネントに毎回Propsを渡さなくても、必要なコンポーネントから値を取得できる。

ただし、すべての状態でContextを使用する必要はない。
コンポーネント内だけで完結する状態や値は`useState`を使い、複数コンポーネントで共有したい場合はContextを使う。
状態管理はReactの中でもかなり重要な機能。
