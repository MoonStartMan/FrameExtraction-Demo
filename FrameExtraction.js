function selectVideo() {
    const videoPlayer = document.getElementById('video-player');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/mp4';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];

        // 检查文件类型是否为MP4
        if (file.type === 'video/mp4') {
            const fileURL = URL.createObjectURL(file);
            videoPlayer.src = fileURL;
            videoPlayer.addEventListener('loadedmetadata', function() {
                extractFrames(videoPlayer);
                URL.revokeObjectURL(fileURL);
            });
        } else {
            alert('请上传MP4类型的文件格式');
        }
    });
    document.body.appendChild(fileInput);
    fileInput.click();
}

function extractFrames(videoPlayer) {
    const frameGallery = document.getElementById('image-container');
    const numFrames = 6; // 设置要抽取的帧数

    const videoWidth = videoPlayer.videoWidth;
    const videoHeight = videoPlayer.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let lastTime = 0;
    let fps = 0;
    function captureFrame(time) {
        if (!lastTime) {
            lastTime = time;
        }
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        fps += 1 / delta;
        context.drawImage(videoPlayer, 0, 0, videoWidth, videoHeight);
        const image = canvas.toDataURL('image/png');
        const frameContainer = document.createElement('div');
        frameContainer.classList.add('frame-container');
        const frameImage = document.createElement('img');
        frameImage.src = image;
        frameImage.classList.add('frame-image');
        frameContainer.appendChild(frameImage);
        frameGallery.appendChild(frameContainer);
        frameCount++;
        if (frameCount < numFrames) {
            requestAnimationFrame(captureFrame);
        } else {
            fps /= numFrames;
            console.log('Average FPS:', fps);
        }
    }
    requestAnimationFrame(captureFrame);

    const downloadButton = document.getElementById('container-download-button')
    downloadButton.style.display = 'inline-block'
}
