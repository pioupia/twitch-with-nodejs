let active = true;
let inListenTouche = false;
let focus;
let paramsToConfig;
const isCookie = getCookie('data');

let parameters = isCookie ?? {
    displayParams: 'e',
    retour: 'r',
    audioRetour: 'a',
    enDisStream: 's',
    videoFlux: 'v',
    audioFlux: 'f',
    isVideoFlux: true,
    isAudioFlux: true,
    isAudioRetour: true,
    isStreamEnable: true,
    isRetour: true,
    front: true,
    height: 720,
    width: 1280,
    audio: true,
    video: true,
    volume: 100,
    fps: {
        ideal: 1,
        max: 30
    },
    defaultAwait: "Appuyez sur n'importe quelle touche pour quelle soit configuré pour cette action.",
    defaultAwait2: "Appuyez ici pour configurer une touche.",
    translator: {
        'confPanelToucheApp': 'displayParams',
        'confStreamOnToucheApp': 'retour',
        'confAudioRetourOnToucheApp': 'audioRetour',
        'confShutDownOnToucheApp': 'enDisStream',
        'audioFluxToucheApp': 'audioFlux',
        'videoFluxToucheApp': 'videoFlux'
    },
    codec: {
        sampleRate: 24e3,
        channels: 1,
        app: 2048,
        frameDuration: 20,
        bufferSize: 4096
    }
}

if (!isCookie) {
    document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;
} else {
    parameters = JSON.parse(parameters)
}

const media = new mediaSharing(parameters);

for (const name in parameters.translator) {
    const theName = document.getElementById(name.replaceAll('App', ''));
    theName.innerHTML = `${theName.innerHTML}<br> Touche actuelle : ${parameters[parameters.translator[name]]}`
}

document.querySelectorAll('.configStream').forEach(name => {
    parameters[name.id] == true ? name.checked = true : name.checked = false;

    name.onclick = (e) =>  {
        switch (e.srcElement.id) {
            case 'isVideoFlux':
                if (parameters.isVideoFlux) {
                    media.stopVideo();
                    parameters.isVideoFlux = false;
                } else {
                    media.allowVideo();
                    parameters.isVideoFlux = true;
                }
                break;
            case 'isRetour':
                if (parameters.isRetour) {
                    media.disableRetour();
                    parameters.isRetour = false;
                } else {
                    media.enableRetour();
                    parameters.isRetour = true;
                }
                break;
            case 'isAudioRetour':
                media.retourAdio();
                parameters.isAudioRetour = !parameters.isAudioRetour;
                break;
            case 'isVideoFlux':
                if (parameters.isVideoFlux) {
                    media.stopVideo();
                    parameters.isVideoFlux = false;
                } else {
                    media.allowVideo()
                    parameters.isVideoFlux = true;
                }
                break;
            case 'isAudioFlux':
                if (parameters.isAudioFlux) {
                    media.stopAudio();
                    parameters.isAudioFlux = false;
                } else {
                    media.allowAudio()
                    parameters.isAudioFlux = true;
                }
                break;
        }

        document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;
    }
});

document.querySelectorAll('.configTxtStream').forEach(name => {

    switch (name.id) {
        case 'fpsNumber':
            name.value = parameters.fps.ideal;
            name.onchange = (e) => {
                const res = e.srcElement;
                parameters.fps.ideal = parseInt(res.value);
                media.changeFPS(parameters.fps);
                document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;
            }
            break;
        case 'MaxFpsNumber':
            name.value = parameters.fps.max;
            name.onchange = (e) => {
                const res = e.srcElement;
                parameters.fps.max = parseInt(res.value);
                media.changeFPS(parameters.fps);
                document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;
            }
            break;
        case 'quality':
            const optionsCanSelected = parameters.width;
            if (optionsCanSelected == 720) {
                name.children[4].selected = true;
            }
            if (optionsCanSelected == 1280) {
                name.children[3].selected = true;
            }
            if (optionsCanSelected == 1920) {
                name.children[2].selected = true;
            }
            if (optionsCanSelected == 3840) {
                name.children[1].selected = true;
            }
            break;
        case 'audioVolume':
            name.value = parameters.audioVolume;

            name.onchange = (e) => {
                const res = e.srcElement;
                parameters.audioVolume = parseInt(res.value);
                media.setGain(parseInt(res.value));
                document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;
            }
            break;
    }
});

save.onclick = () => {
    const child = quality.children;
    for (let i = 0; i < child.length; i++) {
        const name = child[i];
        if (name.selected == true) {
            const split = parseInt(name.innerHTML.split('x')[0]);
            parameters.width = split;
            if (split == 720) {
                parameters.height = 480;
            }
            if (split == 1280) {
                parameters.height = 720;
            }
            if (split == 1920) {
                parameters.height = 1080;
            }
            if (split == 3840) {
                parameters.height = 2160;
            }
        }
    }

    document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;

    window.location.reload();
}



window.onkeypress = (e) => {
    if (!active && !focus) return;
    if (!active && focus) {
        let non = false;
        for (const dont in parameters) {
            if (parameters[dont] == e.key) {
                non = !non;
                break;
            }
        }

        if (non) return;

        parameters[paramsToConfig] = e.key;

        document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;

        const focusEl = document.getElementById(focus)
        focusEl.innerHTML = parameters.defaultAwait2;

        const el = document.getElementById(focus.replace(/App/g, ''));
        el.innerHTML = `${el.innerHTML.split('Touche actuelle :')[0]}Touche actuelle : ${parameters[paramsToConfig]}`;

        paramsToConfig = 0;
        focus = 0;
        active = true;
        inListenTouche = !inListenTouche;

        return;
    }
    switch (e.key) {
        case parameters.displayParams:
            params.style.display == '' ? params.style.display = 'none' : params.style.display = '';
            break;
        case parameters.retour:
            if (parameters.isRetour) {
                media.disableRetour();
                parameters.isRetour = false;
            } else {
                media.enableRetour();

                parameters.isRetour = true;
            }
            break;
        case parameters.audioRetour:
            media.retourAdio();
            break;
        case parameters.videoFlux:
            if (parameters.isVideoFlux) {
                media.stopVideo();
                parameters.isVideoFlux = false;
            } else {
                media.allowVideo()
                parameters.isVideoFlux = true;
            }
            break;
        case parameters.audioFlux:
            if (parameters.isAudioFlux) {
                media.stopAudio();
                parameters.isAudioFlux = false;
            } else {
                media.allowAudio()
                parameters.isAudioFlux = true;
            }
            break;
    }

    document.cookie = `data=${JSON.stringify(parameters)}; domain=${window.location.hostname}; secure; samesite=strict`;
}

const allAwaited = document.getElementsByClassName("awaitClickListener");
for (let e of allAwaited) {
    e.onclick = () => {
        if (inListenTouche) return;
        active = false;
        focus = e.id;
        paramsToConfig = parameters.translator[e.id];
        inListenTouche = !inListenTouche;

        e.innerHTML = parameters.defaultAwait;
    }
}

ecran.onclick = () => {
    media.createMedia(true);
}

cam.onclick = () => {
    media.createMedia(false);
}