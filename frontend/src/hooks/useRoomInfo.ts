// src/hooks/useRoomInfo.ts

import { useState, useEffect } from 'react';
import { getRequest } from '@/api/requests';

// 👇 실제 API 응답과 일치하도록 수정한 타입 정의
export interface RoomInfo {
    roomId: string;
    creatorId: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    missionDays: string[];
}

export const useRoomInfo = (roomId: string | number | undefined | null) => { // 🔥 개선: 타입 확장
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // 🔥 추가: 에러 상태

    useEffect(() => {
        // 🔥 개선: 더 유연한 roomId 체크
        if (!roomId) {
            setRoomInfo(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        const fetchRoomData = async () => {
            setIsLoading(true);
            setError(null); // 🔥 추가: 에러 초기화
            
            try {
                const data = await getRequest<any>(`/room/${roomId}`);
                const transformedData: RoomInfo = {
                    ...data,
                    creatorId: String(data.creatorId), // number → string 변환
                    roomId: String(data.roomId),
                };
                setRoomInfo(transformedData);
            } catch (error) {
                console.error("Room info fetch failed:", error);
                setRoomInfo(null);
                setError(error instanceof Error ? error.message : '방 정보를 불러올 수 없습니다.'); // 🔥 추가: 에러 설정
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId]);

    return { roomInfo, isLoading, error }; // 🔥 개선: error도 반환
};