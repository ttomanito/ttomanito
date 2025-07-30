// src/pages/TestPage.tsx
import { useEffect, useState } from 'react';
import { patchRequest } from '@/api/requests';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type Todo2 = {
  title: string;
};

const TestPage = () => {
  const [todo] = useState<Todo | null>(null);

  useEffect(() => {
    patchRequest<Todo2>('/posts/1', { title: 'foo' }).catch(console.error);
    // getRequest<Todo>('/todos/1').then(setTodo).catch(console.error);
  }, []);

  return (
    <div>
      {todo ? (
        <div>
          <h2>{todo.title}</h2>
          <p>완료 여부: {todo.completed ? '✅' : '❌'}</p>
        </div>
      ) : (
        '로딩 중...'
      )}
    </div>
  );
};

export default TestPage;
