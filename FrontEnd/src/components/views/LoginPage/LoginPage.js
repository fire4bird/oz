import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../_actions/user_action";
import { useNavigate } from "react-router-dom";
import style from "./LoginPage.module.css";
import MyButton from "../../tools/MyButton";
import { useCookies } from "react-cookie";
function LoginPage(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1.  로그인 데이터 부분
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  // usestate: const [state, setstate] = useState(initialState) 자동완성.
  // initialState : = placeholder

  // 2. 데이터 부분
  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value);
  };
  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value);
  };
  // cookies
  const [cookies, setCookies] = useCookies();

  //3. 데이터 리덕스 전달 순서 (body를 디스패치로 던진다. -> actions 에서 처리 -> userreducer에서 저장
  const onSubmitHandler = (event) => {
    event.preventDefault();

    console.log("Email", Email);
    console.log("Password", Password);

    let body = {
      email: Email,
      password: Password,
    };

    dispatch(loginUser(body)).then((response) => {
      // console.log(response.payload.headers.accesstoken);

      if (response.payload.data === "로그인 성공") {
        const Atoken = response.payload.headers.accesstoken;
        setCookies("Atoken", Atoken);

        console.log(cookies);

        alert(cookies.Atoken);
        // cookies.Atoken 이게 널아니면 로그인중이다 확인가능
        navigate("/authlanding");

        // 성공하면  root page(landing page)로 가라
      } else {
        alert("Error");
      }
    });

    // Axios.post("/api/users/login", body).then((response) => {});
  };

  return (
    <div className={style.loginpage}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
        }}
      >
        <form
          className="form"
          style={{ display: "flex", flexDirection: "column" }}
          onSubmit={onSubmitHandler}
        >
          <input type="email" value={Email} onChange={onEmailHandler} />

          {/* 안에서 value값을 바로 변경할 수 없으니 위에 미리 state로 값을 지정하고,
               그 지정한 값을 받아온다. */}
          <br />
          <input
            type="password"
            value={Password}
            onChange={onPasswordHandler}
          />
          <br />

          <button>Login</button>
          <br />
          <MyButton text={"회원가입"} onClick={() => navigate(`/register`)} />
        </form>
      </div>
    </div>
  );
}

export default LoginPage;