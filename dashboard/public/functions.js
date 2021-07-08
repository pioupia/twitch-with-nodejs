const options = {
    maxSizeMB: 1,
    useWebWorker: true
}

const getFrame = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async function (blob) {
        const compress = await imageCompression(blob, options);
        return compress;
    }, "image/png", 0.01);

    return canvas.toDataURL();
}

const getAudio = (video) => {
    var ctx = new AudioContext();
      var source = ctx.createMediaElementSource(video);
      var stream_dest = ctx.createMediaStreamDestination();
      source.connect(stream_dest);

      var tampon = new ArrayBuffer(stream_dest.stream);
      return tampon;
}

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
