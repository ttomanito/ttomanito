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
          break
        case 'EXIT':
        case 'KICK':
          setParticipants(prev => prev.filter(p => normalizeId(p.userId) !== normalizeId(body.userId)))
          break
        case 'START':
          break
        case 'CLOSE':
          break
      }
    } catch {
      // 메시지 처리 실패 시 무시
    }
  }, [])

  const connect = useCallback((roomId: number | string, initialParticipants: Participant[] = []) => {
    if (stompClient.current?.active) {
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

        topicSubRef.current?.unsubscribe()
        topicSubRef.current = client.subscribe(`/topic/waiting/${roomId}`, onMessageReceived)
      },
      onWebSocketClose: () => {
        setConnected(false)
      },
      onStompError: () => {
        setConnected(false)
      },
    })

    stompClient.current = client
    client.activate()
  }, [onMessageReceived])

  const disconnect = useCallback(async () => {
    try { topicSubRef.current?.unsubscribe() } catch {
      // 실패 시 무시
    }
    topicSubRef.current = null

    const client = stompClient.current
    stompClient.current = null

    if (client?.active) {
      try {
        await client.deactivate()
      } catch {
        // 비정상 종료는 무시
      }
    }
    setConnected(false)
    setParticipants([])
  }, [])

  const sendMessage = useCallback((type: MessageType, payload: MessagePayload) => {
    const client = stompClient.current
    if (!client?.active) {
      return
    }
    client.publish({
      destination: '/app/waiting/message',
      body: JSON.stringify({ type, ...payload }),
    })
  }, [])

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
