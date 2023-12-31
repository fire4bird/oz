import React, { useRef, useEffect, useState } from "react";
import Canvas from "./canvas";
// style
import style from "./DrawingDorothy.module.css";
import GameModal from "../GameModal/GameModal";


export default function DrawingDorothy({client, sessionId, myUserId, myRole, currentRole}) {
    const [showDiv, setShowDiv] = useState(true);
    const [role, setRole] = useState("");
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        switch(currentRole){
            case 2:
                setRole("사자");
                break;
            case 3:
                setRole("허수아비");
                break;
            case 4:
                setRole("양철 나무꾼");
                break;
            case 5:
                setRole("도로시");
                break;
        }

        if (currentRole === 5) {
          setShowDiv(false);
        }else{
            setShowDiv(true);
        }
    }, [currentRole]);

    const onAnswerHandler = (event) => setAnswer(event.currentTarget.value);

    const drawingGameAnswerPublisher = async () => {
        if(answer === ""){
            alert("답을 입력해 주세요");
            return;
        }
        try {
          if (!client) {
            console.log('웹소켓이 연결중이 아닙니다. 메시지 보내기 실패');
            return;
          }
              
          const message = {
            "rtcSession": sessionId,
            "userId": myUserId,
            "userAnswer": answer
          };

          console.log(message);
          client.send('/pub/draw/data', {}, JSON.stringify(message));
        } catch (error) {
          console.log('Error sending message:', error);
        }
    };

    const enterKeyPress = (event) => {
        if (event.key === "Enter") {
          drawingGameAnswerPublisher();
        }
      };
  const stageval = 4;
  const [showModal, setShowModal] = useState(false);
  const onHandleExplain = () => {
    setShowModal(true);
  };

    return (
      <div className={style.compStyle}>
        <div className={style.background_G4}>
          <div className={style.answerZone}>
            <input className={style.answerInput}
            type="text"
            value={answer}
            placeholder="정답을 입력하세요"
            onChange={onAnswerHandler}
            onKeyDown={enterKeyPress}
            disabled={currentRole !== 5}/>
            {!showDiv &&
            <button className={style.answerButton}
            onClick={drawingGameAnswerPublisher}>
                제출
            </button>}
            <img
            src="image/tools/questionMark.png"
            alt="questionMark"
            className={style.iconStyle}
            onClick={onHandleExplain}
          />
          </div>
          {showModal && (
          <GameModal
            isStage={stageval}
            closeModal={() => setShowModal(false)}
          />
        )}
          <Canvas client={client} sessionId={sessionId} myUserId={myUserId} myRole={myRole} currentRole={currentRole}></Canvas>
          {showDiv && <div className={style.hideZone}>{role} 님이 그리는 중입니다</div>}
        </div>
      </div>
    )
}