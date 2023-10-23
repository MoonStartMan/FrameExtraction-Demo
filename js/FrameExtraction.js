
function menuChange() {
    const menu1 = document.getElementById("change-menu1")
    const menu2 = document.getElementById("change-menu2")
    menu1.addEventListener('click', function() {
        changeOption(0)
    })
    menu2.addEventListener('click', function() {
        changeOption(1)
    })
}

function changeOption(index) {
    const menus = document.getElementsByClassName("change-menu-item")
    const contents = document.getElementsByClassName("content-box-item")

    for (let i = 0; i < menus.length; i++) {
        if (i === index) {
            menus[i].classList.add('active')
            contents[i].classList.add('active')
        } else {
            menus[i].classList.remove('active')
            contents[i].classList.remove('active')
        }
    }
}

window.onload = function() {
    menuChange()
    init()
}

const CONFIG = {
    mode: "around", // start around
    count: 6, // 抽帧数量
    column: 3, // 每列数量
    row: 3, // 每行数量
    fileURL: "", // 预览文件地址
    fps: 30, // 帧率
    ratio: 0.5, // 压缩比例
    row2: 1,
    column2: 1,
    fps2: 3,
    resultImageURL: "", // 抽帧图片
    resultVideoURL: "", //抽帧视频
    imageFileName: "",
    videoFileName: "",
};
let seeked;

const ELEMENTS = {
    videoPlayer: document.getElementById("video-player"),
    frameGallery: document.getElementById("image-container"),
    columnNumberForm: document.getElementById("video-column-number"),
    rowNumberForm: document.getElementById("video-row-number"),
    FPSNumberForm: document.getElementById("video-fps-number"),
    videoResultWrap: document.getElementById("video_result"),
    imagePreviewWrap: document.getElementById("image_preview"),
    columnNumberForm2: document.getElementById("image-column-number"),
    rowNumberForm2: document.getElementById("image-row-number"),
    FPSNumberForm2: document.getElementById("videmo-num"),
};

function init() {
    const {
      videoPlayer,
      rowNumberForm,
      columnNumberForm,
      FPSNumberForm,
      rowNumberForm2,
      columnNumberForm2,
      FPSNumberForm2,
    } = ELEMENTS;
    // 监听设置视频播放位置动作结束
    videoPlayer.addEventListener("seeked", async function () {
      if (seeked) seeked();
    });
    // 在视频元数据加载完毕后开始抽帧
    videoPlayer.addEventListener("loadedmetadata", async function () {
      window._videoLoaded = true;
      // await videoPlayer.play();
      // URL.revokeObjectURL(CONFIG.fileURL);
    });
  
    [
      rowNumberForm,
      columnNumberForm,
      FPSNumberForm,
      rowNumberForm2,
      columnNumberForm2,
      FPSNumberForm2,
    ].forEach((ele, index) => {
      const input = ele.children[0];
      input.addEventListener("input", (ev) => {
        const value = parseInt(ev.target.value);
        switch (index) {
          case 0: {
            CONFIG.row = value;
            break;
          }
          case 1: {
            CONFIG.column = value;
            break;
          }
          case 2: {
            CONFIG.fps = value;
            break;
          }
          case 3: {
            CONFIG.row2 = value;
            break;
          }
          case 4: {
            CONFIG.column2 = value;
            break;
          }
          case 5: {
            CONFIG.fps2 = value;
            break;
          }
        }
      });
    });
  
    rowNumberForm.children[0].value = CONFIG.row;
    columnNumberForm.children[0].value = CONFIG.column;
    FPSNumberForm.children[0].value = CONFIG.fps;
    rowNumberForm2.children[0].value = CONFIG.row2;
    columnNumberForm2.children[0].value = CONFIG.column2;
    FPSNumberForm2.children[0].value = CONFIG.fps2;
  }

// 上传视频
function selectVideo() {
    const { videoPlayer, frameGallery, videoResultWrap } = ELEMENTS;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/mp4";
    fileInput.style.display = "none";
    seeked = undefined;
  
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
  
      // 检查文件类型是否为MP4
      if (file.type === "video/mp4") {
        window._videoLoaded = false;
        CONFIG.fileURL = URL.createObjectURL(file);
        videoPlayer.src = CONFIG.fileURL;
        frameGallery.innerHTML = "";
        videoResultWrap.innerHTML = "";
        CONFIG.resultImageURL = "";
        CONFIG.imageFileName = getFileName(file);
        searchElements("video-player")
      } else {
        alert("请上传MP4类型的文件格式");
      }
      document.body.removeChild(fileInput);
    });
  
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  // 抽帧
async function extractFrames() {
    if (!window._videoLoaded) {
      showToast({
        title: "视频未准备好！",
      });
      return;
    }
    const { videoPlayer, frameGallery } = ELEMENTS;
    const { mode, row, column, fps: frameTotal, ratio } = CONFIG;
    frameGallery.innerHTML = "";
    let numFrames = row * column; // 设置要抽取的帧数
    const videoWidth = videoPlayer.videoWidth * ratio;
    const videoHeight = videoPlayer.videoHeight * ratio;
  
    // 计算画布大小 以及每张图片画布的大小
    let maxSize = videoWidth > videoHeight ? videoWidth : videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = maxSize * column;
    canvas.height = maxSize * row;
  
    const context = canvas.getContext("2d");
    let interval = 1 / frameTotal; // 计算每帧时长
    let curFps = 0;
    let currentTime = interval / 2;
    let step = 1;
  
    // 这里生成的canvas用于输出视频流
    const videoCanvas = document.createElement("canvas");
    videoCanvas.width = videoWidth;
    videoCanvas.height = videoHeight;
    const videoContext = videoCanvas.getContext("2d");
  
    const frameImageUrls = [];
  
    switch (mode) {
      case "around": {
        step = Math.floor((videoPlayer.duration * frameTotal - 1) / (numFrames - 1));
        break;
      }
    }
    while (curFps < numFrames) {
      videoPlayer.currentTime = currentTime;
      await new Promise((r) => (seeked = r));
      //计算绘制图案在画布中的偏移量
      let x = (curFps % column) * maxSize;
      let y = Math.floor(curFps / column) * maxSize;
      if (videoWidth === maxSize && videoHeight !== maxSize) {
        y += (maxSize - videoHeight) / 2;
      }
      if (videoWidth !== maxSize && videoHeight === maxSize) {
        x += (maxSize - videoWidth) / 2;
      }
      context.drawImage(videoPlayer, x, y, videoWidth, videoHeight);
      videoContext.clearRect(0, 0, videoWidth, videoHeight);
      videoContext.drawImage(videoPlayer, 0, 0, videoWidth, videoHeight);
      frameImageUrls.push(videoCanvas.toDataURL("image/png"));
      // 移动视频进度
      currentTime = currentTime + interval * step;
      curFps++;
    }
    // 将canvas转为base64的图片格式
    const imageURL = canvas.toDataURL("image/png");
    CONFIG.resultImageURL = imageURL;
  
    const frameImage = document.createElement("img");
    frameImage.src = imageURL;
    searchElements("image-container")
    frameImage.classList.add("frame-image");
    frameGallery.appendChild(frameImage);
  
    videoPlayer.play();
  }
  
//   // 生成视频
  async function generateVideo(frameImageUrls) {
    return new Promise(async (resolve, reject) => {
      const frameImages = await getLoadedImage(frameImageUrls);
      if (frameImages.length <= 0) {
        return reject();
      }
      let { videoResultWrap } = ELEMENTS;
  
      const { fps2 } = CONFIG; // 这个改成了时长
      const videoWidth = frameImages[0].naturalWidth;
      const videoHeight = frameImages[0].naturalHeight;
  
      // 这里生成的canvas用于输出视频流
      const videoCanvas = document.createElement("canvas");
      videoCanvas.width = videoWidth;
      videoCanvas.height = videoHeight;
      const videoContext = videoCanvas.getContext("2d");
  
      const mediaRecorder = new MediaRecorder(videoCanvas.captureStream(), {
        mimeType: "video/webm;codecs=vp9",
      });
      const chunks = [];
  
      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
      };
  
      mediaRecorder.onstop = function () {
        const videoBlob = new Blob(chunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(videoBlob);
  
        // 创建视频元素
        const video = document.createElement("video");
        video.src = videoUrl;
        video.controls = true;
        video.autoplay = true;
        CONFIG.resultVideoURL = videoUrl;
        searchElements("video_result")
        // 添加视频元素到页面
        videoResultWrap.appendChild(video);
        showToast({ title: "视频处理完成！" });
        resolve();
      };
      mediaRecorder.start();
  
      appendToVideoCanvas([...frameImages], {
        mediaRecorder,
        ctx: videoContext,
        width: videoWidth,
        height: videoHeight,
        timeout: (fps2 / frameImageUrls.length) * 1000,
      });
    });
  }
  
  function appendToVideoCanvas(frames, { mediaRecorder, ctx, width, height, timeout }) {
    setTimeout(() => {
      if (!frames?.length) {
        mediaRecorder.stop();
        return;
      }
      const image = frames.shift();
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      mediaRecorder.requestData();
      appendToVideoCanvas(frames, { mediaRecorder, ctx, width, height, timeout });
    }, timeout);
  }
  
  function getLoadedImage(imageUrls) {
    return new Promise((resolve) => {
      let loadedNum = 0;
      const frameImages = [];
      imageUrls.forEach((url) => {
        img = document.createElement("img");
        frameImages.push(img);
        img.onload = () => {
          loadedNum++;
          if (loadedNum === imageUrls.length) {
            resolve(frameImages);
          }
        };
        img.src = url;
        return img;
      });
    });
  }
  
//   /**
//    * ----------------------------------------------------------------
//    * 视频合成图片的处理
//    * ----------------------------------------------------------------
//    */
  function selectImage() {
    const { imagePreviewWrap, videoResultWrap } = ELEMENTS;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    const onImageLoaded = async (image) => {
      window._image = image;
    };
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
  
      imagePreviewWrap.innerHTML = "";
      videoResultWrap.innerHTML = "";
      CONFIG.resultVideoURL = "";
      CONFIG.videoFileName = getFileName(file);
  
      CONFIG.imagePreviewURL = URL.createObjectURL(file);
      const image = document.createElement("img");
      image.onload = onImageLoaded.bind(this, image);
      image.src = CONFIG.imagePreviewURL;
      searchElements("image_preview")
      imagePreviewWrap.appendChild(image);
      document.body.removeChild(fileInput);
    });
    document.body.appendChild(fileInput);
    fileInput.click();
  }
  
  async function startImage() {
    const image = window._image;
    if (!image) {
      showToast({
        title: "图片未准备好！",
      });
      return;
    }
    const closeToast = showToast({
      id: "image-to-video",
      title: "正在处理，请耐心等待...",
    });
    const { videoResultWrap } = ELEMENTS;
    videoResultWrap.innerHTML = "";
    CONFIG.resultVideoURL = "";
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const boxWidth = imageWidth / CONFIG.column2;
    const boxHeight = imageHeight / CONFIG.row2;
    const canvas = document.createElement("canvas");
    canvas.width = boxWidth;
    canvas.height = boxHeight;
    const ctx = canvas.getContext("2d");
    const frameURLList = [];
    for (let row = 0; row < CONFIG.row2; row++) {
      // 遍历每一行
      for (let column = 0; column < CONFIG.column2; column++) {
        ctx.drawImage(
          image,
          column * boxHeight,
          row * boxWidth,
          boxWidth,
          boxHeight,
          0,
          0,
          boxWidth,
          boxHeight
        );
        var newImage = new Image();
        newImage.classList.add("test-image");
        const imageURL = canvas.toDataURL();
        frameURLList.push(imageURL);
      }
    }
    await generateVideo(frameURLList);
    closeToast && closeToast();
  }
  
  function downloadImage() {
    if (!CONFIG.resultImageURL) return;
    const link = document.createElement("a");
    link.href = CONFIG.resultImageURL;
    link.download = `${CONFIG.imageFileName || ""}_${new Date().toLocaleString()}.png`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  function downloadVideo() {
    if (!CONFIG.resultVideoURL) return;
    const link = document.createElement("a");
    link.href = CONFIG.resultVideoURL;
    link.download = `${CONFIG.videoFileName || ""}_${new Date().toLocaleString()}.webm`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  function showToast({ title, duration, id } = {}) {
    if (!title) {
      return;
    }
    let toast = document.createElement("div");
    toast.innerHTML = title;
    toast.classList.add("my-toast");
    document.body.append(toast);
    const closeFn = () => {
      document.body.removeChild(toast);
      toast = null;
    };
    if (id) {
      return closeFn;
    } else {
      setTimeout(() => {
        closeFn();
      }, duration || 3000);
    }
  }
  
  function getFileName(file) {
    return file.name.split(".").slice(0, -1).join(".");
  }

  function searchElements(id) {
    const contaierCcreateItemBox = document.getElementsByClassName("contaier-create-item-box")
    const positionItemCover = document.getElementsByClassName("position-item-cover")
    for (let i=0; i<contaierCcreateItemBox.length; i++) {
        for (let j=0; j<contaierCcreateItemBox[i].children.length; j++) {
            if (contaierCcreateItemBox[i].children[j].id == id) {
                positionItemCover[i].classList.remove('active')
                contaierCcreateItemBox[i].classList.add('active')
            } else {
                // positionItemCover[i].classList.add('active')
                // contaierCcreateItemBox[i].classList.remove('active')
            }
        }
    }
  }