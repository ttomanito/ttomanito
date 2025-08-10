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

export const useRoomInfo = (roomId: string | undefined) => {
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!roomId) {
            setIsLoading(false);
            return;
        }

        const fetchRoomData = async () => {
            setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId]);

    return { roomInfo, isLoading };
};