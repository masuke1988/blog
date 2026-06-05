---
author: まっす
pubDatetime: 2026-06-05T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習5】Reactのフォームについて
slug: learning-react-5
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はReactのフォームについて学習した。
---

これまで勉強した`useState`を使った簡単な入力フォームについて学習した。
サーバとの連携は行なっていない。

## Table of contents

## 基本形

`input`を使用した基本的な入力フォーム。
入力欄にテキストを入力すると、`value`が更新され、入力内容が表示される。

```tsx
import React, { useState } from 'react';

function Form() {
  const [value, setValue] = useState("");

  return (
    <div>
      <input type="text" value={value} onChange={(e) => {
        setValue(e.target.value)
      }} />
      <div>
        <p>{ value }</p>
      </div>
    </div>
  );
}

export default Form;
```

## テキストボックス

`textarea`を使用したテキストボックス。
`value`が更新されると、入力内容が表示される。

```tsx
import React, { useState } from 'react';

function Form() {
  const [value, setValue] = useState("");

  return (
    <div>
      <textarea value={value} onChange={(e) => {
        setValue(e.target.value)
      }} />
      <div>
        <p>{ value }</p>
      </div>
    </div>
  );
}

export default Form;
```

## チェックボックス

チェックボックスを使用。チェックされている場合は`true`、チェックされていない場合は`false`が`value`に設定される。

```tsx
import React, { useState } from 'react';

function Form() {
  const [value, setValue] = useState(false);

  return (
    <div>
      <input type="checkbox" checked={value} onChange={(e) => {
        setValue(e.target.checked)
      }} />
      <div>
        <p>{value ? 'チェックされています' : 'チェックされていません'}</p>
      </div>
    </div>
  );
}

export default Form;
```

## ラジオボタン

ラジオボタンを使用して、複数の選択肢から1つを選べるようにする例。

```tsx
import React, { useState } from 'react';

function Form() {
  const [value, setValue] = useState('male');

  return (
    <div>
      <label>
        <input type="radio" value="male" checked={value === 'male'} onChange={(e) => {
          setValue(e.target.value)
        }} />
        <span>男性</span>
      </label>
      <label>
        <input type="radio" value="female" checked={value === 'female'} onChange={(e) => {
          setValue(e.target.value)
        }} />
        <span>女性</span>
      </label>
      <div>
        <p>{value === 'male' ? '男性' : '女性'}</p>
      </div>
    </div>
  );
}

export default Form;
```

## フォーム送信

フォームの送信を処理する例。
`onSubmit`に関数を設定し、アラートが表示されるように実装。

```tsx
import React, { useState } from 'react';

function Form() {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(value);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={value} onChange={(e) => {
          setValue(e.target.value)
        }} />
        <button type="submit">Submit</button>
      </form>
      <div>
        <p>{value}</p>
      </div>
    </div>
  );
}

export default Form;
```

## 複数選択

複数項目を入力できるフォームの例。
簡単なバリデーション（必須項目は空白禁止）を追加している。

```tsx
import React, { useState } from 'react';

function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    alert(Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n'));
  }

  const validateForm = () => {
    const result = [];
    Object.entries(formData).forEach(([key, value]) => {
      if (value === '' && key !== 'content') {
        result.push(`${key}を入力してください。`);
      }
    });

    if (result.length > 0) {
      alert(result.join('\n'));
      return false;
    }
    return true;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">
          名前*:
          <input type="text" id="name" value={formData.name} onChange={(e) => {
            setFormData({...formData, name: e.target.value})
          }} />
        </label>
        <label htmlFor="email">
          メール*:
          <input type="email" id="email" value={formData.email} onChange={(e) => {
            setFormData({...formData, email: e.target.value})
          }} />
        </label>
        <label htmlFor="content">
          内容:
          <textarea id="content" value={formData.content} onChange={(e) => {
            setFormData({...formData, content: e.target.value})
          }} />
        </label>
        <button type="submit">Submit</button>
      </form>
      <div>
        <div>
          {Object.entries(formData).map(([key, value]) => (
            <p key={key}>{key}: {value}</p>
          ))}
        </div>
        <p>*:必須</p>
      </div>
    </div>
  );
}

export default Form;
```

## TODOリスト

TODOリストの例です。
TODO名とTODO詳細を入力でき、不要になったら削除可能。

```tsx
import { useState } from 'react';

type Todo = {
  'TODO名': string;
  'TODO詳細': string;
};

function Form() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<Todo>({ 'TODO名': '', 'TODO詳細': '' });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setTodos([...todos, newTodo])
    setNewTodo({ 'TODO名': '', 'TODO詳細': '' });
  }

  const validateForm = () => {
    if(!newTodo['TODO名'] || !newTodo['TODO詳細']) {
      alert('TODO名とTODO詳細を入力してください。');
      return false;
    }
    return true;
  }

  return (
    <div>
      <div>
        {todos.map((item, index) => (
          // 実務ではIDを発行してkeyに使用することが多い
          <p key={index}>{item['TODO名']} - {item['TODO詳細']}
            <button onClick={() => setTodos(todos.filter((_,i)=> i !== index))}>削除</button>
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          <span>TODO名</span>
          <input type="text" value={newTodo['TODO名']} onChange={(e) => setNewTodo({ ...newTodo, 'TODO名': e.target.value })} />
        </label>
        <label>
          <span>TODO詳細</span>
          <input type="text" value={newTodo['TODO詳細']} onChange={(e) => setNewTodo({ ...newTodo, 'TODO詳細': e.target.value })} />
        </label>
        <button type="submit">追加</button>
      </form>
    </div>
  );
}

export default Form;

```

## まとめ

簡単なフォームをいくつか作成してみた。
実務ではここからAPI通信を組み合わせ、サーバへデータを送信したり、取得したりすることが多い。
