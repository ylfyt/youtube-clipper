export type SetYtVolumeArgs = number[];
export const setYtVolume = (...deltas: SetYtVolumeArgs): number => {
    const video: any = document.getElementById("movie_player");
    video.setVolume(video.getVolume() + deltas[0]);
    return video.getVolume();
};

export type DispatchYtEventArgs = Event[];
export const dispatchYtEvent = (...events: DispatchYtEventArgs): void => {
    document.dispatchEvent(events[0]);
};

export const YtEvents = {
    next: () => new KeyboardEvent("keydown", {
        key: "N",
        keyCode: 78,
        which: 78,
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
    }),
    prev: () => new KeyboardEvent("keydown", {
        key: "P",
        keyCode: 80,
        which: 80,
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
    }),
    playToggleMusic: () => new KeyboardEvent("keydown", {
        key: " ",
        keyCode: 32,
        which: 32,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
    }),
    playToggle: () => new KeyboardEvent("keydown", {
        key: "k",
        keyCode: 75,
        code: "KeyK",
        which: 75,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
    }),
    shuffleMusic: () => new KeyboardEvent("keydown", {
        key: "s",
        keyCode: 83,
        which: 83,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
    })
} as const;

