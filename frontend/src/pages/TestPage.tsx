// src/pages/TestPage.tsx
import { useEffect, useState } from 'react';
import { deleteRequest, patchRequest, postRequest } from '@/api/requests';
import { Button, Input } from '@chakra-ui/react';
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
  const [roomId, setRoomId] = useState(null);
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
      <br />
      <p>- 대기방 테스트 로직</p>
      <Input
        placeholder="roomId 입력"
        value={roomId}
        type="number"
        onChange={e => {
          setRoomId(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          postRequest(`/room/${roomId}/message`, { message: '상태메시지 테스트' });
          console.log('HI');
        }}
      >
        대기방 참여하기
      </Button>
      <Button
        onClick={() => {
          deleteRequest(`/room/6/exit`, { roomId: 6 });
          console.log('HI');
        }}
      >
        대기방 나가기
      </Button>
    </div>
  );
};

export default TestPage;



