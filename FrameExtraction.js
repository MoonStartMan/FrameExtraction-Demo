const frameTotal = 30;

let seeked;
function selectVideo() {
  const videoPlayer = document.getElementById("video-player");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "video/mp4";
  fileInput.style.display = "none";
  seeked = undefined;
  // 监听设置视频播放位置动作结束
  videoPlayer.addEventListener("seeked", async function () {
    if (seeked) seeked();
  });

  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];

    // 检查文件类型是否为MP4
    if (file.type === "video/mp4") {
      const fileURL = URL.createObjectURL(file);
      videoPlayer.src = fileURL;

      // 在视频元数据加载完毕后开始抽帧
      videoPlayer.addEventListener("loadedmetadata", async function () {
        await videoPlayer.play();
        extractFrames(videoPlayer);
        URL.revokeObjectURL(fileURL);
      });
    } else {
      alert("请上传MP4类型的文件格式");
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
}

async function extractFrames(videoPlayer) {
  const frameGallery = document.getElementById("image-container");
  frameGallery.innerHTML = ""
  const numFrames = 6; // 设置要抽取的帧数
  const videoWidth = videoPlayer.videoWidth;
  const videoHeight = videoPlayer.videoHeight;
  const canvas = document.createElement("canvas");
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const context = canvas.getContext("2d");
  let interval = 1 / frameTotal; // 计算每帧时长
  let fps = 0;
  let currentTime = 0;
  let frames = [];

  while (fps < numFrames) {
    console.log('currentTime: ', currentTime);
    videoPlayer.currentTime = currentTime;
    await new Promise((r) => (seeked = r));
    context.drawImage(videoPlayer, 0, 0, videoWidth, videoHeight);
    // 将canvas转为base64的图片格式
    const image = canvas.toDataURL("image/png");
    // 存入结果数组
    frames.push(image);
    // 移动视频进度
    currentTime += interval;
    fps++;
  }

  frames.forEach((frame) => {
    const frameContainer = document.createElement("div");
    frameContainer.classList.add("frame-container");
    const frameImage = document.createElement("img");
    frameImage.src = frame;
    frameImage.classList.add("frame-image");
    frameContainer.appendChild(frameImage);
    frameGallery.appendChild(frameContainer);
  });
}

function downloadSelectedFrames() {
  const frameGallery = document.getElementById("image-container");
  const frameImages = frameGallery.getElementsByClassName("frame-image");
  const numFrames = frameImages.length;

  if (numFrames === 0) {
    alert("No frames to download");
    return;
  }

  for (let i = 0; i < numFrames; i++) {
    const frameImage = frameImages[i];
    const imageSrc = frameImage.src;
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `frame_${i + 1}.png`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
