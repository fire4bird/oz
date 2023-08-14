import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GameModal from "../GameModal/GameModal";
import CustomAlert from "../Alert/alert";
import style from "./DrawingReady.module.css";
const DrawingReady = ({
  myRole,
  onHandleStart,
  client,
  sessionId,
  R1,
  R2,
  R3,
  R4,
}) => {
  const stageval = 4;
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const host = params.get("host");

  const [amIHost, setAmIHost] = useState(host);
  const [amIReady, setAmIReady] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  useEffect(() => {
    if (myRole === 1) {
      if (R1 === 4) {
        setAmIReady(true);
      } else if (R1 === 0) {
        setAmIReady(false);
      }
    } else if (myRole === 2) {
      if (R2 === 4) {
        setAmIReady(true);
      } else if (R2 === 0) {
        setAmIReady(false);
      }
    } else if (myRole === 3) {
      if (R3 === 4) {
        setAmIReady(true);
      } else if (R3 === 0) {
        setAmIReady(false);
      }
    } else if (myRole === 4) {
      if (R4 === 4) {
        setAmIReady(true);
      } else if (R4 === 0) {
        setAmIReady(false);
      }
    }
  }, [myRole, R1, R2, R3, R4]);

  const handleStartAfterReady = () => {
    console.log(host);
    if (amIHost === "1") {
      if (R1 === 4 && R2 === 4 && R3 === 4 && R4 === 4) {
        onHandleStart(true);
      } else {
        setAlertMessage("4명이 준비 완료 상태가 아닙니다");
      }
    } else {
      setAlertMessage("내가 방장이 아니다.");
    }
  };

  const ReadyPublisher = async (readyOrCancel) => {
    console.log(sessionId);
    try {
      if (!client) {
        console.log("웹소켓이 연결중이 아닙니다. 메시지 보내기 실패");
        return;
      }

      const message = {
        type: "ready",
        rtcSession: `${sessionId}`,
        role: myRole,
        stage: 4,
        state: readyOrCancel,
        message: `${myRole}님이 ${readyOrCancel} (1준비 0취소)하셨습니다`,
      };

      client.send("/pub/socket/ready", {}, JSON.stringify(message));
      console.log("메시지 보냈음");
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const onHandleExplain = () => {
    setShowModal(true);
  };

  return (
    <div className={style.compStyle}>
      <div className={style.background_G2}>
        <div className={style.charStyle}>
          <div className={style.firstDiv}>
            <img
              src="image/character/dorothy_light.png"
              className={style.checkMain}
            ></img>
            {R1 === 4 && (
              <img
                src="image/tools/checkmarker.png"
                className={style.checkMarkExtra}
              ></img>
            )}
          </div>
          <div className={style.otherDiv}>
            <img
              src="image/character/dorothy.png"
              className={style.checkExtra}
            ></img>
            {R4 === 4 && (
              <img
                src="image/tools/checkmarker.png"
                className={style.checkMarkExtra}
              ></img>
            )}
          </div>
          <div className={style.otherDiv}>
            <img
              src="image/character/liona.png"
              className={style.checkExtra}
            ></img>
            {R2 === 4 && (
              <img
                src="image/tools/checkmarker.png"
                className={style.checkMarkExtra}
              ></img>
            )}
          </div>
          <div className={style.otherDiv}>
            <img
              src="image/character/heosua.png"
              className={style.checkExtra}
            ></img>
            {R3 === 4 && (
              <img
                src="image/tools/checkmarker.png"
                className={style.checkMarkExtra}
              ></img>
            )}
          </div>
        </div>
        <div className={style.guideStyle}>
          <div className={style.topDivStyle}>
            <div className={style.howToPlayImg}>게임 방법 넣을 part</div>
          </div>
          <div className={style.bottomDivStyle}>
            <div className={style.howToPlayBtn} onClick={onHandleExplain}>
              게임 방법
            </div>

            <div
              className={style.readyBtn}
              onClick={() => {
                const readyOrCancel = amIReady ? 0 : 1;
                ReadyPublisher(readyOrCancel);
              }}
            >
              {amIReady ? "준비 취소" : "준비 완료"}
            </div>

            {amIHost === "1" && (
              <div className={style.startBtn} onClick={handleStartAfterReady}>
                게임 시작
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <GameModal isStage={stageval} closeModal={() => setShowModal(false)} />
      )}
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      )}
    </div>
  );
};

export default DrawingReady;
