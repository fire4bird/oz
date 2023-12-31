import React, { useState, useEffect } from "react";
import { GameComp } from "./GameComps/GameComps";
import { useDispatch } from "react-redux";
import { setGameUserInfo } from "../../../_actions/game_actions";
const PlayGame = ({
  middleCon,
  onHandleMiddleCondition,
  client,
  sessionId,
  myRole,
  userId,
  roundId,
  onHandleMike,
  onHandleCamera,
  onHandleSpeaker
}) => {

  const [isStage, setIsStage] = useState(0);
  const [isIndex, setIsIndex] = useState(0);
  const stageLimits = [16, 4, 12, 11, 7, 14];
  const dispatch = useDispatch(); // 디스패치 정의
  let body = {
    //isStage 값 담아줄 객체
    isStage: isStage,
    isIndex: isIndex,
  };

  const handleMiddleCondition = () => {
    const newStatus = middleCon - 1;
    onHandleMiddleCondition(newStatus);
  };

   // 소켓 연결 유지를 위한 요청
   useEffect(() => {
    const subscribeToInfinityRequest = () => {
      const trySubscribe = () => {
        if (!client) {
          console.log("연결유지sub 구독실패")
        }
        console.log("연결유지sub 연결중")
        client.subscribe(`/sub/socket/infinity/${sessionId}`, (message) => {
          console.log('Received message:', message.body);
          try {

          } catch (error) {
            console.error('Error parsing message body:', error);
          }
    
        });
      };
      trySubscribe();
    };
    subscribeToInfinityRequest();
  }, [client, sessionId]);

useEffect(() => {
    const sendMessageInfinity = async () => {
      try {
        if (!client) {
          console.log('웹소켓이 연결중이 아닙니다. 메시지 보내기 실패');
          return;
        }
        const message = {
          "type":"infinity",
          "rtcSession":`${sessionId}`,
          "message":`on socket`,
          "data":{
          }
        };
        console.log("나살아있는지보냈음");
    
        client.send('/pub/socket/infinity', {}, JSON.stringify(message));
      } catch (error) {
        console.log('Error sending message:', error);
      }
    };
    
    sendMessageInfinity();

    // 5초마다 함수 실행
    const intervalId = setInterval(sendMessageInfinity, 5000);

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => {
      clearInterval(intervalId);
    };
  }, [client, sessionId]);

  // flow 상의 Next 버튼
  const handleNext = () => {
    console.log(isIndex);
    console.log(isStage);
    dispatch(setGameUserInfo(body)); //DisPatch 통해서 리듀서에 전달

    if (isIndex < stageLimits[isStage]) {
      setIsIndex(isIndex + 1);
    } else if (isIndex === 21) {
      setIsIndex(0);
      setIsStage(isStage + 1);
    } else {
      setIsIndex(0);
      setIsStage(isStage + 1);
    }
  };
  const isButtonActive =
    (isStage >= 1 && isStage <= 4 && isIndex >= 10 && isIndex <= 20) || // 기존 조건
    (isStage === 1 && isIndex === 3) || // isStage가 1이고 isIndex가 3인 조건
    (isStage === 2 && isIndex === 3) ||
    (isStage === 3 && isIndex === 3) ||
    (isStage === 4 && isIndex === 2) ||
    (isStage === 5 && isIndex === 13); // isStage가 2이고 isIndex가 2인 조건

  // index만 증가 따로
  const indexNext = () => {
    setIsIndex(isIndex + 1);
  };

  // 하위컴포넌트에서 index 값을 지정하는 콜백함수
  const indexSet = (newIndex) => {
    setIsIndex(newIndex);
  };

  // stage별 이동 따로
  const stageNext = () => {
    setIsIndex(0);
    setIsStage(isStage + 1);
  };

  // 게임 시작 (준비완료 됐을때)
  const readyNext = () => {
    setIsIndex(11);
  };

  // 게임 클리어 (마지막 일러스트 보러가자)
  const stageLast = () => {
    if (isStage === 4) {
      setIsIndex(0);
      setIsStage(isStage + 1);
    } else {
      setIsIndex(21);
    }
  };

  // 게임 종료 (팀구성 화면)
  const resetNext = () => {
    setIsIndex(0);
    setIsStage(0);
  };

  useEffect(() => {
    // 10초 후에 숫자판 (일단 3초)
    if (isStage === 1 && isIndex === 11) {
      const timeoutId = setTimeout(() => {
        setIsIndex(isIndex + 1);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [isStage, isIndex]);

  useEffect(() => {
    // subscribeToSessionID();
    console.log(sessionId);
  }, []);

  const gamedivStyle = {
    margin: "0",
    padding: "0",
    height: "70%",
    overflow: "hidden",
  };

  const bodyStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: "#DDE5B6",
  };

  const BtnStyle = {
    position: "absolute",
    display: isButtonActive ? "none" : "block",
  };
  // console.log("stage: " + isStage + " index: " + isIndex);
  return (
    <div style={gamedivStyle}>
      <div style={bodyStyle}>
        {/* <button style={BtnStyle} onClick={handleNext}>
          Next
        </button> */}
        <GameComp
          isStage={isStage}
          isIndex={isIndex}
          changeNextPage={handleNext}
          changeIsIndex={indexNext}
          changeIsStage={stageNext}
          changeIsReady={readyNext}
          changeIsClear={stageLast}
          middleCon={middleCon}
          onHandleMiddleCondition={handleMiddleCondition}
          client={client}
          sessionId={sessionId}
          userId={userId}
          myRole={myRole}
          indexSet={indexSet}
          roundId={roundId}
          onHandleMike={onHandleMike}
          onHandleCamera={onHandleCamera}
          onHandleSpeaker={onHandleSpeaker}
        />
      </div>
    </div>
  );
};

export default PlayGame;
