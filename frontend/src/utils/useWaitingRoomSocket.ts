// src/utils/useWaitingRoomSocket.ts
import { useState, useRef, useEffect, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'

export interface Participant {
  userId: number | string
  statusMessage?: string
}
export type MessageType = 'ENTER' | 'EXIT' | 'CLOSE' | 'START' | 'KICK'
export interface MessagePayload {
  roomId: number | string
  userId: number | string
  [key: string]: any
}

export const useWaitingRoomSocket = () => {
  const stompClient = useRef<Client | null>(null)
  const topicSubRef = useRef<StompSubscription | null>(null) // 👈 구독 핸들 저장
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
          setParticipants(prev => {
            const uid = normalizeId(body.userId)
            const idx = prev.findIndex(p => normalizeId(p.userId) === uid)
            if (idx > -1) {
              const next = [...prev]
              next[idx] = { ...next[idx], ...body }
              return next
            }
            return [...prev, { userId: body.userId, statusMessage: body.statusMessage }]
          })
          break
        case 'EXIT':
        case 'KICK':
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
      // SockJS를 쓰면 brokerURL 지정하지 않는 것이 권장
      // brokerURL: 'wss://i13b206.p.ssafy.io/ws/waiting',
      webSocketFactory: () => new SockJS('https://i13b206.p.ssafy.io/ws/waiting'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        console.log('✅ 웹소켓 연결 성공')

        // 이전 구독이 남아있다면 안전하게 해제
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
    // 구독 먼저 해제
    try { topicSubRef.current?.unsubscribe() } catch {}
    topicSubRef.current = null

    const client = stompClient.current
    stompClient.current = null

    if (client?.active) {
      try {
        await client.deactivate() // 비동기 완료 보장
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

  useEffect(() => {
    return () => {
      // 언마운트 시 정리
      void disconnect()
    }
  }, [disconnect])

  return { connected, participants, lastMessage, connect, disconnect, sendMessage }
}
