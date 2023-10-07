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
        } else {
            alert('Please select a video file in MP4 format.');
        }
    });
    document.body.appendChild(fileInput);
    fileInput.click();
    videoPlayer.addEventListener('loadedmetadata', extractFrames);
}

function extractFrames() {
    const videoPlayer = document.getElementById('video-player');
    const frameGallery = document.getElementById('image-container');
    const frameRate = 1; // 设置帧率，这里是每秒1帧
    const numFrames = 6; // 设置要抽取的帧数

    const videoWidth = videoPlayer.videoWidth;
    const videoHeight = videoPlayer.videoHeight;

    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext('2d');

    for (let i = 0; i < numFrames; i++) {
        const frameTime = i / frameRate;
        videoPlayer.currentTime = frameTime;
        context.drawImage(videoPlayer, 0, 0, videoWidth, videoHeight);
        const image = canvas.toDataURL('image/png');
        const frameContainer = document.createElement('div');
        frameContainer.classList.add('frame-container');
        const frameImage = document.createElement('img');
        frameImage.src = image;
        frameImage.classList.add('frame-image');
        frameContainer.appendChild(frameImage);
        frameGallery.appendChild(frameContainer);
    }
}