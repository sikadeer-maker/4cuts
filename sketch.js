let img_frame;
let sfx_shutter, sfx_focus;
let cx, cy;
let is_back_mode = true;
let photo;

let now_status;
const STATUS_ENUM = {
  Ready: 0,
  TakeShot: 1,
  Developed: 5,
};
Object.freeze(STATUS_ENUM);

let CAM_FRAME_COLOR;
let BG_COLOR;
let capture;
let shot_num = 0;
function preload() {
  img_frame = loadImage("assets/frame.png");
  now_status = STATUS_ENUM.Ready;
}

const FRAME_Y_POSITION = [25, 230, 435, 640, 845];

function setup() {
  photo = createCanvas(400, 1000);

  cx = width * 0.5;
  cy = height * 0.5;
  CAM_FRAME_COLOR = color(0, 200);

  // init camera
  if (isMobile()) {
    const backCamera = {
      audio: false,
      video: {
        facingMode: {
          exact: "environment",
        },
      },
    };
    capture = createCapture(backCamera);
    capture.hide();
  } else {
    photo.hide();
    alert(
      "현재 디바이스에서는 환경모드 실행이 어렵습니다. 셀카모드로 이동합니다."
    );
    document.location.href = "./self4cut.html";
    noLoop();
  }
  BG_COLOR = color(200);
  background(BG_COLOR);
}

function draw() {
  // 사진 현상이 완료된 상태면 이미지를 더 이상 갱신하지 않습니다.
  if (now_status === STATUS_ENUM.Developed) return;

  imageMode(CORNER);
  image(
    capture,
    0,
    FRAME_Y_POSITION[shot_num],
    width,
    (capture.height * width) / capture.width
  );

  // 현재 컷 아래로는 가리기
  fill(0);
  noStroke();
  rect(0, FRAME_Y_POSITION[shot_num + 1], width, height);

  imageMode(CENTER);
  image(img_frame, cx, cy);

  if (now_status == STATUS_ENUM.Ready) {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    text(
      isMobile() ? "터치" : "클릭" + "할 때마다 한 칸씩 사진이 촬영됩니다.",
      cx,
      FRAME_Y_POSITION[0] + FRAME_Y_POSITION[1] * 0.5
    );
  }
}

function touchEnded() {
  switch (now_status) {
    // 준비 모드
    case STATUS_ENUM.Ready:
      now_status = STATUS_ENUM.TakeShot;
      break;
    // 촬영 모드
    case STATUS_ENUM.TakeShot:
      if (shot_num < 3) {
        shot_num += 1;
      } else {
        now_status = STATUS_ENUM.Developed;

        const today = new Date();
        is_cam_on = false;
        if (!isMobile()) {
          // 데스크탑
          let description =
            "아래 현상된 이미지를 오른쪽 클릭해서 저장할 수 있어요";
          drawPhotoInHtml(description, today);
        } else {
          const device_name = checkDevice();
          if (device_name === "android") {
            // 안드로이드 : 자동 저장
            let description = "아래 현상된 이미지를 자동으로 저장합니다.";
            drawPhotoInHtml(description, today);
            setTimeout(() => {
              saveCanvas(photo, "sikadeer-" + today, "png");
            }, 100);
          } else if (device_name === "ios") {
            // 아이폰 : 꾹 눌러서 저장
            let description = "아래 현상된 이미지를 꾹 눌러서 저장할 수 있어요";
            drawPhotoInHtml(description, today);
          }
        }
      }
      break;
    // 현상모드
    case STATUS_ENUM.Developed:
      break;
  }
  // prevent default
  return false;
}

function drawPhotoInHtml(description, today) {
  let alt_text = createP(description);
  alt_text.class("animate__animated animate__fadeIn animate__delay-1s");
  alt_text.parent("main");

  let canvas_data = canvas.toDataURL();
  let img_element = createImg(canvas_data, "sikadeer-photo-" + today);
  img_element.class("animate__animated animate__backInDown");
  img_element.parent("main");

  const fileName = "아현4컷" + toStringByFormatting(today);
  downloadImg(canvas_data, fileName);
  photo.hide();
  noLoop();
}

function leftPad(value) {
  if (value >= 10) {
    return value;
  }
  return `0${value}`;
}

function toStringByFormatting(source) {
  const year = source.getFullYear();
  const month = leftPad(source.getMonth() + 1);
  const day = leftPad(source.getDate());
  const date = [year, month, day].join("");
  const hour = leftPad(source.getHours());
  const minute = leftPad(source.getMinutes());
  const second = leftPad(source.getSeconds());
  const time = [hour, minute, second].join("");
  return [date, time].join("-");
}

function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime,
  });
}

function downloadImg(imgSrc, fileName) {
  var image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imgSrc;
  image.onload = function () {
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.getContext("2d").drawImage(this, 0, 0);
    if (typeof window.navigator.msSaveBlob !== "undefined") {
      window.navigator.msSaveBlob(dataURLtoBlob(canvas.toDataURL()), fileName);
    } else {
      var link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = fileName;
      link.click();
    }
  };
}

const isMobile = () => {
  const pcDevice = "win16|wind32|win64|mac|macintel";
  if (navigator.platform) {
    if (pcDevice.indexOf(navigator.platform.toLowerCase()) < 0) {
      return true; //mobile
    }
  }
  return false; //desktop
};
