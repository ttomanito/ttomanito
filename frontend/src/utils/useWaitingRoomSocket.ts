// src/utils/useWaitingRoomSocket.ts
import { useState, useRef, useEffect, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'

export interface Participant {
  userId: number | string
  statusMessage?: string
  name?: string
}
export type MessageType = 'ENTER' | 'EXIT' | 'CLOSE' | 'START' | 'KICK'
export interface MessagePayload {
  roomId: number | string
  userId: number | string
  [key: string]: any
}

export const useWaitingRoomSocket = () => {
  const stompClient = useRef<Client | null>(null)
  const topicSubRef = useRef<StompSubscription | null>(null)
  const [connected, setConnected] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [lastMessage, setLastMessage] = useState<any>(null)
  const normalizeId = (v: number | string) => String(v)

  const onMessageReceived = useCallback((message: IMessage) => {
    try {
      const body = JSON.parse(message.body)
      setLastMessage(body)

      switch (body.type as MessageType) {
        case 'ENTER':
          // 🔥 ENTER만 WaitingRoomPage에서 API로 처리 (name 정보 필요)
          break
        case 'EXIT':
        case 'KICK':
          // 🔥 EXIT/KICK은 기존 로직 유지 (userId만 있으면 충분)
          setParticipants(prev => prev.filter(p => normalizeId(p.userId) !== normalizeId(body.userId)))
          break
        case 'START':
          console.log('게임 시작!')
          break
        case 'CLOSE':
          console.log('방 닫힘')
          break
      }
    } catch (e) {
      console.error('메시지 처리 오류:', e)
    }
  }, [])

  const connect = useCallback((roomId: number | string, initialParticipants: Participant[] = []) => {
    if (stompClient.current?.active) {
      console.warn('이미 연결됨')
      return
    }

    setParticipants(initialParticipants)

    const client = new Client({
      webSocketFactory: () => new SockJS('https://i13b206.p.ssafy.io/ws/waiting'),
      // webSocketFactory: () => new SockJS('http://localhost:8080/ws/waiting'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        console.log('✅ 웹소켓 연결 성공')

        topicSubRef.current?.unsubscribe()
        topicSubRef.current = client.subscribe(`/topic/waiting/${roomId}`, onMessageReceived)
      },
      onWebSocketClose: () => {
        setConnected(false)
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body)
        setConnected(false)
      },
    })

    stompClient.current = client
    client.activate()
  }, [onMessageReceived])

  const disconnect = useCallback(async () => {
    try { topicSubRef.current?.unsubscribe() } catch {}
    topicSubRef.current = null

    const client = stompClient.current
    stompClient.current = null

    if (client?.active) {
      try {
        await client.deactivate()
      } catch (e) {
        console.warn('deactivate 실패 무시:', e)
      }
    }
    setConnected(false)
    setParticipants([])
    console.log('🔌 웹소켓 연결 종료')
  }, [])

  const sendMessage = useCallback((type: MessageType, payload: MessagePayload) => {
    const client = stompClient.current
    if (!client?.active) {
      console.error('연결 안 됨: 메시지 전송 불가')
      return
    }
    client.publish({
      destination: '/app/waiting/message',
      body: JSON.stringify({ type, ...payload }),
    })
  }, [])

  // 🔥 외부에서 participants를 업데이트할 수 있는 함수 추가
  const updateParticipants = useCallback((newParticipants: Participant[]) => {
    setParticipants(newParticipants)
  }, [])

  useEffect(() => {
    return () => {
      void disconnect()
    }
  }, [disconnect])

  return { 
    connected, 
    participants, 
    lastMessage, 
    connect, 
    disconnect, 
    sendMessage,
    updateParticipants
  }
}