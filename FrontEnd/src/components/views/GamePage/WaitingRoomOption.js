import React, { useState, useEffect } from "react";
import style from "./WaitingRoomOption.module.css";
import axios from "axios";
import {useNavigate} from "react-router-dom"
import {
  OPENVIDU_SERVER_SECRET,
  OPENVIDU_SERVER_URL,
  SERVER_URL,
} from "../../../_actions/urls";
import CustomAlert from "./GameComps/Alert/alert";
import axiosInstance from "../../../_actions/axiosInstance";


const WaitingRoomOption = ({
  isWaiting,
  onGamingStart,
  userId,
  sessionId,
  amIHost,
  client,
  handleToggle,
  isMike,
  isCamera,
  isSpeaker,
  onHandleMike,
  onHandleCamera,
  onHandleSpeaker
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // 구독
  const handleWaiting = () => {
    const newState = !isWaiting;
    onGamingStart(newState);
  };

  useEffect(() => {
    const subscribeToWaiting = (maxRetries = 3, retryInterval = 2000) => {
      let retries = 0;

      const trySubscribe = () => {
        if (!client) {
          if (retries < maxRetries) {
            retries++;
            setTimeout(trySubscribe, retryInterval);
          }
          return;
        }

        const subscription = client.subscribe(
          `/sub/socket/waiting/${sessionId}`,
          (message) => {
            console.log("Received message:", message.body);
            try {
              handleWaiting();
              onHandleCamera(true);
              onHandleMike(true);
              onHandleSpeaker(true);
            } catch (error) {
              console.error("Error parsing message body:", error);
            }
          }
        );
      };

      trySubscribe();
    };

    setTimeout(() => {
      subscribeToWaiting();
    }, 500);
  }, [client, sessionId]);

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard
        .writeText(sessionId)
        .then(() => {
          setAlertMessage("초대코드 복사 완료");
        })
        .catch((error) => {
          console.error("에러! session ID:", error);
        });
    }
  };

  //alert

  const [alertMessage, setAlertMessage] = useState("");
  const [showTeamNameInput, setShowTeamNameInput] = useState(false);
const [teamNameInput, setTeamNameInput] = useState("");
  // 유효성 검증 & 팀 등록
  const handleGamingStartState = () => {
    // 방장인지
    if (amIHost == 1) {
      // 세션에 연결된 유저 4명인지
      axios
        .get(
          `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`,
          {
            headers: {
              Authorization: `Basic ${btoa(
                `OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`
              )}`,
            },
          }
        )
        .then((response) => {
          const participantCount = response.data.numberOfElements;
          if (participantCount < 4) {
            setAlertMessage(
              "참가 인원(4명)이 충족되지 않았습니다. 시작이 불가능합니다."
            );
          } else {
            // 현재 방에 들어온 사용자들의 userId를 가져오기 위함
            axios
              .post(`${SERVER_URL}/socket/user?rtcSession=${sessionId}`, {})
              .then((response) => {
                const userIdArray = response.data.data.map((obj) => obj.userId);
                // 4명의 사용자들이 등록한 적이 있는 팀인지?
                axios
                  .post(`${SERVER_URL}/teams/checkteam`, {
                    users: userIdArray,
                  })
                  .then((response) => {
                    const teamNameDefault = response.data.data;
                    var teamName;
                    if (response.data.data == null) {
                      teamName = prompt("사용할 팀 이름을 정하세요");
                      // setAlertMessage("사용할 팀 이름을 정하세요");
                    }  else {
                      teamName = prompt(
                        `기존에 사용하던 팀 명이 있습니다. ${teamNameDefault.teamName} 새로운 팀명을 사용하려면 입력하세요`,
                        teamNameDefault.teamName
                      );
                    }
                    console.log(
                      teamName +
                        "이름으로 팀만들었고 다음페이지로 넘어가는거 만드는중"
                    );

                    // 입력한 이름으로 팀 등록
                    axios
                      .post(`${SERVER_URL}/teams/registteam`, {
                        users: userIdArray,
                        teamName: `${teamName}`,
                      })
                      .then((response) => {
                        localStorage.setItem(
                          "TeamName",
                          response.data.data.teamName
                        );

                        // 팀 등록 완료 후 data code에 의해 RoleSelect 상태로
                        // 유효성 검증 코드 필요
                        waitingToRoleSelect();
                      })
                      .catch((error) => {
                        console.error(error);
                      });
                  });
              });
          }
        })
        .catch((error) => {
          console.log("방 정보를 가져오는데 실패하였습니다.", error);
        });
    } else {
      setAlertMessage("방장 권한이 없어 시작할 수 없습니다.");
    }
  };

  // 검증 완료 후 상태 변경 -> 역할 선택으로
  const waitingToRoleSelect = async () => {
    try {
      if (!client) {
        console.log("웹소켓이 연결중이 아닙니다. 메시지 보내기 실패");
        return;
      }
      const message = {
        type: "waiting",
        rtcSession: `${sessionId}`,
        userId: `${userId}`,
        message: "",
        data: {},
      };

      client.send("/pub/socket/waiting", {}, JSON.stringify(message));
      console.log("메시지 보냈음");
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const navigate = useNavigate();
  const sessionExit = () => {
    axios
      .delete(SERVER_URL + "/socket/user", {
        data: {
          rtcSession: { sessionId },
          userId: userId,
        },
      })
      .then((response) => {
        console.log("잘나감.");
      })
      .catch((error) => {
        console.log(error);
      });
    navigate(`/`);
  };

  const WROStyle = {
    // backgroundColor: "rgb(221, 229, 182)",
    height: "22%",
    display: "flex",
  };

  return (
    <div style={WROStyle}>
      <iframe
        style={{display: "none"}}
        src="/audio/Good Morning_full.mp3?autoplay=true"
        frameborder="0"
        allowfullscreen
        allow="autoplay"
      ></iframe>
      <div className={style.optionBox}>
        {/* Left Pane Content */}
        <button 
          className={`${style.optionButton}  ${isCamera ? style.active : ""}`} 
          onClick={() => handleToggle("camera")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <i className={`fi fi-rr-video-camera-alt`} ></i>
        </button>
        <button className={`${style.optionButton} ${isMike ? style.active : ""}` }onClick={() => handleToggle("mike")} >
          <i className={`fi fi-rr-microphone`} ></i>
        </button>
        <button className={`${style.optionButton} ${isSpeaker ? style.active : ""}`} onClick={() => handleToggle("speaker")}>
          <i className={`fi fi-rr-volume`} ></i>
        </button>
        <button className={style.optionButton}
        onClick={copySessionId}><i class="fi fi-rr-envelope-plus"></i></button>
      </div>
      <div className={style.nextBox}>
        {/* Right Pane Content */}
        {/* <button className={style.nextButton} onClick={handleGamingStartState}> */}
        <button className={style.nextButton} onClick={handleGamingStartState}>
          모험시작
        </button>
        <button className={style.nextButton} onClick={sessionExit}>
          나가기
        </button>
      </div>
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      )}
    </div>
  );
};

export default WaitingRoomOption;
