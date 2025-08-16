import { useState, useEffect } from 'react';
import { getRequest } from '@/api/requests';

export interface RoomInfo {
    roomId: string;
    creatorId: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    missionDays: string[];
}

export const useRoomInfo = (roomId: string | number | undefined | null) => { 
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); 

    useEffect(() => {
        if (!roomId) {
            setRoomInfo(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        const fetchRoomData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const data = await getRequest<any>(`/room/${roomId}`);
                const transformedData: RoomInfo = {
                    ...data,
                    creatorId: String(data.creatorId),
                    roomId: String(data.roomId),
                };
                setRoomInfo(transformedData);
            } catch (error) {
                setRoomInfo(null);
                setError(error instanceof Error ? error.message : '방 정보를 불러올 수 없습니다.'); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId]);

    return { roomInfo, isLoading, error };
};