// src/pages/Room/WaitingRoomPage.tsx
import { Box, Text, Button, VStack, Spinner, Icon, Flex, useClipboard, CloseButton } from '@chakra-ui/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, postRequest, deleteRequest } from '@/api/requests';

import { useRoomInfo,} from '@/hooks/useRoomInfo';
import RoomInfoCard from '@/components/cards/RoomInfoCard';
import ProfileList from '@/components/lists/ProfileList';
import { useWaitingRoomSocket, type Participant } from '@/utils/useWaitingRoomSocket';
import { useAuth } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import MessageInputBody from '@/components/modal/MessageInputBody';
import { FaCrown } from "react-icons/fa";
import DoubleButton from '@/components/buttons/DoubleButton'

const WaitingRoomPage = () => {
    // 1. 모든 Hook들을 최상단에 배치
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const myUserId = useAuth((s) => s.user?.id);
    const { connected, participants, lastMessage, connect, disconnect} = useWaitingRoomSocket();
    const { openModal, closeModal } = useModalStore();
    const [isLoading, setIsLoading] = useState(true);
    const [initialParticipants, setInitialParticipants] = useState<Participant[]>([]);
    const connectingRef = useRef(false);
    const { roomInfo } = useRoomInfo(roomId);
    const isCreator = myUserId === roomInfo?.creatorId;
    const inviteUrl = `${window.location.origin}/room/${roomId}`;
    const clipboard = useClipboard({ value: inviteUrl });

    // 2. useMemo 먼저 배치 (useEffect에서 사용하기 때문)
    const hasMe = useMemo(() => {
        if (!myUserId) return false;
        return initialParticipants.some((p) => String(p.userId) === String(myUserId));
    }, [initialParticipants, myUserId]);

    // 3. 모든 useEffect를 함께 배치
    // --- 페이지 진입 시 실행되는 메인 로직 ---
    useEffect(() => {
        const initialize = async () => {
            if (!roomId || !myUserId) {
                navigate('/main');
                return;
            }
            setIsLoading(true);

            try {
                // --- 0단계: 내가 이미 참여 중인지 먼저 확인! ---
                const currentParticipants = await getRequest<Participant[]>(`/room/${roomId}/participants`);
                const isAlreadyParticipant = currentParticipants.some(p => String(p.userId) === String(myUserId));

                if (isAlreadyParticipant) {
                    // ✅ 이미 참여 중인 경우: 모든 검증을 건너뛰고 바로 연결 준비
                    console.log('이미 참여 중인 사용자입니다. 바로 연결합니다.');
                    setInitialParticipants(currentParticipants);
                } else {
                    // ❌ 참여 중이 아닌 신규 유저인 경우: 자격 검증 시작
                    console.log('신규 사용자입니다. 자격 검증을 시작합니다.');

                    // 1단계: 내 상태 확인
                    const userStatus = await getRequest<string>('/room/check');
                    if (userStatus !== 'IN_NONE') {
                        openModal({
                            title: '입장 불가', body: <Text>이미 다른 방에 참여 중입니다.</Text>,
                            footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
                        });
                        return; // 여기서 로직 종료
                    }

                    // 2단계: 방 상태 확인
                    const roomInfo = await getRequest<{ status: string }>(`/room/${roomId}`);
                    if (roomInfo.status !== 'NOT_STARTED') {
                        openModal({
                            title: '입장 불가', body: <Text>이미 시작했거나 종료된 방입니다.</Text>,
                            footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
                        });
                        return; // 여기서 로직 종료
                    }
                    
                    // 모든 검증 통과! '참여하기' 버튼을 누를 수 있도록 참가자 목록을 설정합니다.
                    setInitialParticipants(currentParticipants);
                }
            } catch (error) {
                console.error("대기방 진입 검증 실패:", error);
                openModal({
                    title: '오류 발생', body: <Text>방 정보를 확인하는 중 오류가 발생했습니다.</Text>,
                    footer: <Button onClick={() => { closeModal(); navigate('/main'); }}>확인</Button>,
                });
            } finally {
                setIsLoading(false);
            }
        };

        initialize();

        return () => { void disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, myUserId]);

    // 내가 참가자 목록에 있을 때만 자동 연결
    useEffect(() => {
        if (!roomId) return;
        if (hasMe && !connected && !connectingRef.current) {
            connectingRef.current = true;
            connect(roomId, initialParticipants);
            setTimeout(() => (connectingRef.current = false), 0);
        }
    }, [roomId, hasMe, connected, initialParticipants, connect]);

    // 3. 킥/방 닫기 메시지 처리 useEffect 추가
    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case 'KICK':
                const messageUserId = String(lastMessage.userId);
                const isMe = messageUserId === String(myUserId);
                
                if (isMe) {
                    alert('방장에 의해 대기방에서 내보내졌습니다.');
                    disconnect();
                    navigate('/');
                }
                break;
                
            case 'CLOSE':
                alert('방장이 대기방을 닫았습니다.');
                disconnect();
                navigate('/');
                break;
        }
    }, [lastMessage, myUserId, disconnect, navigate]);

    // 5. 모든 함수들
    const handleJoin = () => {
        if (!roomId || !myUserId) return;
        
        // 입력받은 메시지로 참가 요청을 보내는 실제 로직
        const joinWithMessage = async (message: string) => {
            try {
                await postRequest(`/room/${roomId}/message`, { message });
                closeModal();
                const newList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
                setInitialParticipants(newList);
                connect(roomId, newList);
            } catch (e) {
                console.error('참여 실패:', e);
                alert('참여 요청에 실패했습니다.');
            }
        };

        openModal({
            title: '대기방 참여',
            // 👇 body에 분리된 컴포넌트를 렌더링합니다.
            caption: '상태 메세지를 적어주세요!',
            body: (
                <MessageInputBody
                    onSubmit={joinWithMessage}
                    onClose={closeModal}
                />
            ),
            footer: '',
        });
    };

    const handleLeave = async () => {
        if (!roomId || !myUserId) return;
        try {
            await deleteRequest(`/room/${roomId}/exit`);
            // 내 연결만 종료합니다.
            setInitialParticipants(prev =>
                prev.filter(p => String(p.userId) !== String(myUserId))
            );
            if (connected) {
                await disconnect();
            }
            const updatedList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
            setInitialParticipants(updatedList);

        } catch (e) {
            console.error('나가기 실패:', e);
            alert('나가기 요청에 실패했습니다.');
        }
    };

    const confirmKickUser = async (userId: string | number) => {
        try {
            await deleteRequest(`/room/${roomId}/participants/${userId}`);
            closeModal();
            
            // 소켓 연결되어 있으면 실시간 업데이트, 아니면 API로 다시 조회
            if (!connected) {
                const updatedList = await getRequest<Participant[]>(`/room/${roomId}/participants`);
                setInitialParticipants(updatedList);
            }
            
        } catch (error) {
            console.error('참가자 내보내기 실패:', error);
            closeModal();
            alert('참가자 내보내기에 실패했습니다.');
        }
    };

    const handleKickUser = (userId: string | number) => {
        openModal({
            title: "참가자 내보내기",
            body: `User ID: ${userId}를 대기방에서 내보내시겠습니까?`,
            footer: (
                <DoubleButton
                    leftLabel="취소"
                    rightLabel="내보내기"
                    onLeftClick={closeModal}
                    onRightClick={() => confirmKickUser(userId)}
                    rightProps={{ colorScheme: "red" }}
                />
            )
        });
    };

    // 초대하기 핸들러
    const handleInvite = () => {
        clipboard.copy();
        alert("초대 링크가 복사되었습니다!");
    };

    // 시작하기 핸들러
    const handleStart = async () => {
        try {
            await postRequest(`/room/${roomId}/start`);
            closeModal();
            navigate('/home'); // 메인으로 이동
        } catch (error) {
            console.error('게임 시작 실패:', error);
            alert('게임 시작에 실패했습니다.');
        }
    };

    const getRightButtonProps = () => {
        if (isCreator) {
            // 방장이면 시작하기
            return {
                label: '시작하기',
                onClick: handleStart,
                props: {
                    colorScheme: 'blue',
                    disabled: listForRender.length < 2,
                }
            };
        } else if (hasMe) {
            // 참여자면 나가기
            return {
                label: '나가기',
                onClick: handleLeave,
                props: {
                    colorScheme: 'red',
                }
            };
        } else {
            // 비참여자면 참여하기
            return {
                label: '참여하기',
                onClick: handleJoin,
                props: {
                    colorScheme: 'green',
                    disabled: !myUserId,
                }
            };
        }
    };

    // 실제 삭제 실행
    const confirmDeleteRoom = async () => {
        try {
            await postRequest(`/room/exit`);
            closeModal();
            navigate('/'); // 메인으로 이동
        } catch (error) {
            console.error('대기방 삭제 실패:', error);
            alert('대기방 삭제에 실패했습니다.');
        }
    };

    // 대기방 삭제 핸들러
    const handleDeleteRoom = () => {
        openModal({
            title: "대기방 삭제",
            body: "정말로 대기방을 삭제하시겠습니까?\n 복구할 수 없습니다.",
            footer: (
                <DoubleButton
                    leftLabel="취소"
                    rightLabel="삭제"
                    onLeftClick={closeModal}
                    onRightClick={confirmDeleteRoom}
                    rightProps={{ colorScheme: "red" }}
                />
            )
        });
    };

    // 6. 계산된 값들
    const listForRender = connected ? participants : initialParticipants;
    const rightButton = getRightButtonProps();

    const profileListData = listForRender.map((p) => {
        // 각 사용자별로 rightSideChild 결정
        let rightContent = null;
        
        // 방장이면 왕관
        if (String(p.userId) === String(roomInfo?.creatorId)) {
            rightContent = <Icon as={FaCrown} color="yellow.500" mx={2} w={5} h={5} />;
        }
        // 내가 방장이고, 상대방이 나가 아닌 경우 킥 버튼
        else if (isCreator && String(p.userId) !== String(myUserId)) {
            rightContent = (
                <CloseButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleKickUser(p.userId)}
                    aria-label={`User ${p.userId} 내보내기`}
                />
            );
        }

        return {
            name: `User ID: ${p.userId}`,
            statusMessage: p.statusMessage || '상태메세지를 설정해주세요!',
            rightSideChild: rightContent,
        };
    });

    const actionButton = (
        <DoubleButton
            leftLabel="초대하기"
            rightLabel={rightButton.label}
            onLeftClick={handleInvite}
            onRightClick={rightButton.onClick}
            rightProps={rightButton.props}
        />
    );

    // 7. 로딩 처리
    if (isLoading) {
        return (
            <Box p={4} display="flex" justifyContent="center" alignItems="center" height="100vh">
                <VStack>
                    <Spinner size="xl" />
                    <Text mt={4}>참가자 목록을 불러오는 중...</Text>
                </VStack>
            </Box>
        );
    }

    // 8. return문 - Box 구조 개선
    return (
        <Box height="100vh" display="flex" flexDirection="column" >
            <Box flex="1" overflowY="auto" p={4}>
                <RoomInfoCard roomInfo={roomInfo} />
                <VStack gap={4} align="stretch">
                    <Box>
                        {/* 제목과 삭제 버튼을 양쪽 끝에 배치 */}
                        <Flex justify="space-between" py={3}>
                            <Text fontSize="lg" fontWeight="semibold">
                                참가자 목록 ({listForRender.length}명)
                            </Text>
                            
                            {/* 방장에게만 보이는 삭제 버튼 */}
                            {isCreator && (
                                <Button
                                    variant="ghost"
                                    color="red.500"
                                    fontSize="sm"
                                    fontWeight="medium"
                                    onClick={handleDeleteRoom}
                                    _hover={{ bg: "red.50" }}
                                    px={2}
                                    py={1}
                                    h="auto"
                                    minH="auto"
                                >
                                    대기방 삭제하기
                                </Button>
                            )}
                        </Flex>
                        <Box bg="blackAlpha.400">삭제예정박스
                            <Text fontSize="2xl" fontWeight="bold">
                                대기실 (Room ID: {roomId})
                            </Text>
                            <Text>내 ID: {myUserId || '로그인 필요'}</Text>
                            <Text>연결 상태: {connected ? '✅ 연결됨' : '❌ 끊어짐'}</Text>
                        </Box>
                    </Box>

                    <Box>
                        <ProfileList data={profileListData} />
                    </Box>
                </VStack>
            </Box>
            
            {/* 고정된 하단 버튼 */}
            <Box
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                px={4}
                py={4}
                bg="white"
            >
                {actionButton}
            </Box>

        </Box>
    );
};

export default WaitingRoomPage;