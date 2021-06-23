import React, { useRef } from "react";
import liff from "@line/liff"; // 追加
import logo from "./logo.svg";
import "./App.css";

import { sakeDB } from "./DB";

import AyatalaImg from "./assets/images/ayataka.png";
import AbeImg from "./assets/images/abe.jpg";

import { NeuButton } from "neumorphism-react";
import { NeuDiv } from "neumorphism-react";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import DeleteIcon from "@material-ui/icons/Delete";

import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

function App() {
  console.log("start");
  /* 追加: メッセージ送信 */

  const classes = useStyles();

  const [sakeList, setSakeList] = React.useState([]);
  const [sakeListNum, setSakeListNum] = React.useState<number[]>([]);

  const intervalRef: any = useRef(null);

  React.useEffect(() => {
    setSakeList(sliceByNumber(sakeDB, 2));
    setSakeListNum(Array(sakeDB.length).fill(0));
  }, []);

  const sendMessage = () => {
    let messageText = "";
    sakeListNum.forEach((sakeNum, index) => {
      if (sakeNum != 0) {
        messageText +=
          sakeList[index / 2][index % 2] + " " + sakeNum.toString() + "本\n";
      }
    });
    messageText += "買います。";

    liff
      .init({ liffId: process.env.REACT_APP_LIFF_ID as string }) // LIFF IDをセットする
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login({}); // ログインしていなければ最初にログインする
        } else if (liff.isInClient()) {
          // LIFFので動いているのであれば
          liff
            .sendMessages([
              {
                // メッセージを送信する
                type: "text",
                text: messageText
              }
            ])
            .then(function() {
              window.alert("Message sent");
            })
            .catch(function(error) {
              window.alert("Error sending message: " + error);
            });
        }
      });
  };

  /* 追加: UserProfileをAlertで表示 */
  const getUserInfo = () => {
    liff.init({ liffId: process.env.REACT_APP_LIFF_ID as string }).then(() => {
      if (!liff.isLoggedIn()) {
        liff.login({}); // ログインしていなければ最初にログインする
      } else if (liff.isInClient()) {
        liff
          .getProfile() // ユーザ情報を取得する
          .then(profile => {
            const userId: string = profile.userId;
            const displayName: string = profile.displayName;
            alert(`Name: ${displayName}, userId: ${userId}`);
          })
          .catch(function(error) {
            window.alert("Error sending message: " + error);
          });
      }
    });
  };

  const sliceByNumber = (array, n) => {
    return array.reduce(
      (a, c, i) =>
        i % n == 0 ? [...a, [c]] : [...a.slice(0, -1), [...a[a.length - 1], c]],
      []
    );
  };

  const CountChange = (changeNum, sakeID) => {
    let tmpSakeListNum = sakeListNum.concat();
    if (tmpSakeListNum[sakeID] + changeNum >= 0) {
      tmpSakeListNum[sakeID] += changeNum;
    }
    setSakeListNum(tmpSakeListNum);
  };

  const StartCountChange = (changeNum, sakeID) => {
    const LONGPRESS = 1000;
    setTimeout(function() {
      /// 長押し時（Longpress）のコード
      if (intervalRef.current == null) {
        console.log("long start");
        intervalRef.current = setInterval(function() {
          CountChange(changeNum, sakeID);
        }, 100);
      }
    }, LONGPRESS);
  };

  const CancelCountChange = () => {
    console.log("end");
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (
    <div className="App">
      <body>
        <div
          style={{
            backgroundColor: "#808080"
          }}
        >
          <p style={{ textAlign: "left", padding: "10px", margin: "0px" }}>
            前回購入したお酒
          </p>
          <p style={{ textAlign: "left", padding: "10px", margin: "0px" }}>
            お酒一覧
          </p>
          {sakeList.length > 0 &&
            sakeList.map((sakeLine: any, index_i: number) => {
              return (
                <div
                  style={{ display: "flex", marginTop: "7px" }}
                  key={"i-" + index_i.toString()}
                >
                  {sakeLine.map((sake: string, index_j: number) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          height: "50%"
                        }}
                        key={index_i.toString() + "-" + index_j.toString()}
                      >
                        <SakeCard
                          sake={sake}
                          sakeNum={sakeListNum[index_i * 2 + index_j]}
                          sakeID={index_i * 2 + index_j}
                          CountChange={CountChange}
                          StartCountChange={StartCountChange}
                          CancelCountChange={CancelCountChange}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </body>
      <footer>
        <NeuButton
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            marginRight: "auto",
            marginLeft: "5px",
            marginBottom: "5px",
            width: "100px",
            height: "auto"
          }}
          color="#80C080"
          onClick={() => sendMessage()}
        >
          確認
        </NeuButton>
      </footer>
    </div>
  );
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <div style={{ backgroundColor: "#808080" }}>
  //         <img src={logo} className="App-logo" alt="logo" />
  //         <p>
  //           Edit <code>src/App.tsx</code> and save to reload.
  //         </p>
  //         <button className="button" onClick={sendMessage}>
  //           send message
  //         </button>{" "}
  //         // 追加
  //         <button className="button" onClick={getUserInfo}>
  //           show user info
  //         </button>{" "}
  //         // 追加
  //         <a
  //           className="App-link"
  //           href="https://reactjs.org"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           Learn React
  //         </a>
  //       </div>
  //     </header>
  //   </div>
  // );
}

export default App;

const SakeCard = ({
  sake,
  sakeNum,
  sakeID,
  CountChange,
  StartCountChange,
  CancelCountChange
}) => {
  return (
    <NeuDiv
      key={"SakeCard-" + sakeID.toString()}
      width="100%"
      height="90%"
      style={{
        margin: "2%",
        display: "flex"
      }}
    >
      <div style={{ display: "flex", width: "100%" }}>
        <img
          src={AbeImg}
          style={{
            height: "auto",
            margin: "10px",
            marginRight: "3px",
            width: "25%"
          }}
        />
        <div
          style={{
            flexDirection: "column",
            alignItems: "center",
            width: "85%"
          }}
        >
          <div style={{ fontSize: "12px", marginTop: "5px" }}>{sake}</div>
          <div
            style={{
              marginTop: "10%",
              display: "flex",
              width: "100%"
            }}
          >
            <NeuDiv
              style={{
                height: "30px",
                width: "30px"
              }}
              color="#C0C0C0"
              radius={10}
              revert
            >
              <p
                style={{
                  margin: "auto",
                  padding: "0px",
                  fontSize: "15px"
                }}
                key={"id-" + sakeID.toString()}
              >
                {sakeNum}
              </p>
            </NeuDiv>
            <NeuButton
              marginTop="0px"
              marginBottom="0px"
              marginLeft="10px"
              marginRight="10px"
              padding="0px"
              width="38px"
              height="38px"
              onClick={() => CountChange(-1, sakeID)}
              color="#8080C0"
              radius={360}
              textAlign="center"
            >
              <RemoveIcon
                style={{
                  position: "absolute",
                  fontSize: "20px",
                  verticalAlign: "center",
                  margin: "auto",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0
                }}
              />
            </NeuButton>
            <NeuButton
              marginTop="0px"
              marginBottom="0px"
              marginLeft="10px"
              marginRight="10px"
              padding="0px"
              width="38px"
              height="38px"
              onClick={() => CountChange(1, sakeID)}
              color="#C08080"
              radius={360}
              textAlign="center"
            >
              <AddIcon
                style={{
                  position: "absolute",
                  fontSize: "20px",
                  verticalAlign: "center",
                  margin: "auto",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0
                }}
              />
            </NeuButton>
          </div>
        </div>
      </div>
    </NeuDiv>
  );
};
// const SakeCard = ({ sake, sakeNum, sakeID, CountChange }) => {
//   return (
//     <NeuDiv
//       width="180px"
//       height="80px"
//       style={{
//         margin: "5px",
//         display: "flex"
//       }}
//     >
//       <div style={{ display: "flex" }}>
//         <img
//           src={AbeImg}
//           style={{ height: "40px", width: "40px", margin: "25px" }}
//         />
//         <div
//           style={{
//             flexDirection: "column",
//             alignItems: "center",
//             width: "80px"
//           }}
//         >
//           <div style={{ marginTop: "5px" }}>{sake}</div>
//           <div
//             style={{
//               display: "flex"
//             }}
//           >
//             <NeuButton
//               marginTop="0px"
//               marginBottom="0px"
//               padding="0px"
//               width="30px"
//               height="30px"
//               onClick={() => CountChange(-1, sakeID)}
//               onmousedown={() => console.log("aaa")}
//               color="#8080C0"
//               radius={180}
//             >
//               -
//             </NeuButton>
//             <p style={{ padding: "0px" }}>{sakeNum}</p>
//             <NeuButton
//               marginTop="0px"
//               marginBottom="0px"
//               padding="0px"
//               width="30px"
//               height="30px"
//               onClick={() => CountChange(1, sakeID)}
//               color="#C08080"
//               radius={180}
//             >
//               +
//             </NeuButton>
//           </div>
//         </div>
//       </div>
//     </NeuDiv>
//   );
// };
