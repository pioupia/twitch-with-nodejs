const getFrame = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/png');
    return data;
}

const getAudio = (video) => {
    var ctx = new AudioContext();
      // create an source node from the <video>
      var source = ctx.createMediaElementSource(video);
      // now a MediaStream destination node
      var stream_dest = ctx.createMediaStreamDestination();
      // connect the source to the MediaStream
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
