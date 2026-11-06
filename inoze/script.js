
let analyser;
let dataArray;
let bufferLength;
let isInit = false;
let isPlaying = false;
let idleRotation = 0;
document.addEventListener('DOMContentLoaded', () => {




    // --- HIỆU ỨNG XUẤT HIỆN KHI CUỘN ---
    // --- HIỆU ỨNG XUẤT HIỆN KHI CUỘN, LÊN/XUỐNG ĐỀU CHẠY LẠI ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    }, {
        threshold: 0.22
    });

    const hiddenElements = document.querySelectorAll(
        '.reveal-left, .reveal-right, .about-content, .about-v2, .reveal-bottom, .projects,  .contact, .project-card, .skills h3, .skills-track'
    );

    hiddenElements.forEach((el) => observer.observe(el));

    // --- ẨN LOADING SCREEN ---
    const loaderWrapper = document.querySelector('.loader-wrapper');
    const hideLoader = () => {
        loaderWrapper.classList.add('hidden');
    };

    window.addEventListener('load', hideLoader);
    if (document.readyState === 'complete') {
        hideLoader();
        
    }

    // --- NHÂN ĐÔI ICON SKILLS ---
    const tracks = document.querySelectorAll('.skills-track');
    tracks.forEach(track => {
        const content = Array.from(track.children);
        content.forEach(item => {
            track.appendChild(item.cloneNode(true));
        });
    });
    const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".hud-nav a");

const navObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const id = entry.target.id;

            navLinks.forEach(link => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === `#${id}`
                );
            });
        });
    },
    {
        threshold: 0.45
    }
);

sections.forEach(section => {
    navObserver.observe(section);
});
    // --- PROJECTS CAROUSEL (SAFE) ---
    const items = document.querySelectorAll('.slider .item');
    const next = document.getElementById('next');
    const prev = document.getElementById('prev');
    const slider = document.querySelector('.slider');

    let active = 0; // để 0 cho chắc
    let startX = 0;

    function loadShow() {
        if (!items.length) return; // không có item thì thôi
        if (active < 0) active = 0;
        if (active >= items.length) active = items.length - 1;

        let stt = 0;
        items[active].style.transform = `none`;
        items[active].style.zIndex = 10;
        items[active].style.filter = 'none';
        items[active].style.opacity = 1;

        for (let i = active + 1; i < items.length; i++) {
            stt++;
            items[i].style.transform = `translateX(${75 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`;
            items[i].style.zIndex = 10 - stt;
            items[i].style.filter = 'blur(5px)';
            items[i].style.opacity = 0.6;
        }

        stt = 0;
        for (let i = active - 1; i >= 0; i--) {
            stt++;
            items[i].style.transform = `translateX(${-75 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`;
            items[i].style.zIndex = 10 - stt;
            items[i].style.filter = 'blur(5px)';
            items[i].style.opacity = 0.6;
        }
    }

    if (items.length && next && prev) {
        loadShow();
        
        next.onclick = () => {
            active = active + 1 < items.length ? active + 1 : active;
            loadShow();
        };

        prev.onclick = () => {
            active = active - 1 >= 0 ? active - 1 : active;
            loadShow();
        };

        if (slider) {
            slider.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            slider.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diffX = endX - startX;
                const swipeThreshold = 50;

                if (diffX > swipeThreshold) prev.onclick();
                else if (diffX < -swipeThreshold) next.onclick();
            });
        }
    }


    // --- HIỆU ỨNG CHỮ CHẠY CHO FRONT-END DEVELOPER ---
    var typedRole = new Typed('.typed-role', {
        strings: [
            'Music Producer',
            'Beatmaker',
            'Sound Designer',
            'Artist'
        ],
        typeSpeed: 60,
        backSpeed: 40,
        backDelay: 1200,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
    const vinyl = document.getElementById("vinyl");
    const vinylPlayBtn = document.getElementById("vinyl-play-btn");
    const toneArm = document.getElementById("toneArm");
    const vinylAudio = document.getElementById("audio");
    /* =========================================
   3D VINYL TILT
========================================= */

const vinylPlayer =
    document.querySelector(".vinyl-player");

const turntable3D =
    document.querySelector(".turntable");


if (vinylPlayer && turntable3D) {

    vinylPlayer.addEventListener(
        "mousemove",
        (e) => {

            const rect =
                vinylPlayer
                    .getBoundingClientRect();


            const x =
                (
                    e.clientX -
                    rect.left
                ) /
                rect.width;


            const y =
                (
                    e.clientY -
                    rect.top
                ) /
                rect.height;


            /*
              -1 -> 1
            */

            const normalizedX =
                (x - 0.5) * 2;

            const normalizedY =
                (y - 0.5) * 2;


            /*
              góc nghiêng
              cố tình nhẹ để không bị game-like
            */

            const rotateY =
                normalizedX * 20;

            const rotateX =
                normalizedY * -16;


            turntable3D.style.setProperty(
                "--rx",
                `${rotateX}deg`
            );


            turntable3D.style.setProperty(
                "--ry",
                `${rotateY}deg`
            );


            /*
              điểm sáng đi theo mouse
            */

            turntable3D.style.setProperty(
                "--mx",
                `${x * 100}%`
            );


            turntable3D.style.setProperty(
                "--my",
                `${y * 100}%`
            );

        }
    );


    vinylPlayer.addEventListener(
        "mouseleave",
        () => {

            turntable3D.style.setProperty(
                "--rx",
                "0deg"
            );

            turntable3D.style.setProperty(
                "--ry",
                "0deg"
            );

            turntable3D.style.setProperty(
                "--mx",
                "50%"
            );

            turntable3D.style.setProperty(
                "--my",
                "50%"
            );

        }
    );

}
    // đảm bảo audio không autoplay
    vinylAudio.autoplay = false;
    vinylAudio.loop = false;
    function createBlobPath(cx, cy, baseRadius, amp, time, detail = 96, variance = 1) {
    const points = [];

    for (let i = 0; i < detail; i++) {
        const angle = (Math.PI * 2 * i) / detail;

        const wave1 = Math.sin(angle * 3 + time * 1.8) * amp * 0.55;
        const wave2 = Math.sin(angle * 5 - time * 2.1) * amp * 0.28;
        const wave3 = Math.cos(angle * 7 + time * 1.2) * amp * 0.18;

        const radius = baseRadius + (wave1 + wave2 + wave3) * variance;

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        points.push([x, y]);
    }

    let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;

    for (let i = 0; i < points.length; i++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % points.length];
        const mx = ((p0[0] + p1[0]) / 2).toFixed(2);
        const my = ((p0[1] + p1[1]) / 2).toFixed(2);

        d += ` Q ${p0[0].toFixed(2)} ${p0[1].toFixed(2)} ${mx} ${my}`;
    }

    d += " Z";
    return d;
}

let blobAnimId = null;
let blobStartTime = null;

function renderBlobFrame(ts) {
    if (!blobPathOuter || !blobPathInner || !blobVisualizer?.classList.contains("playing")) return;

    if (!blobStartTime) blobStartTime = ts;
    const t = (ts - blobStartTime) / 1000;

    const outerPath = createBlobPath(260, 260, 202, 16, t, 120, 1.0);
    const innerPath = createBlobPath(260, 260, 198, 12, t + 0.6, 120, 0.92);

    blobPathOuter.setAttribute("d", outerPath);
    blobPathInner.setAttribute("d", innerPath);

    blobAnimId = requestAnimationFrame(renderBlobFrame);
}

function startBlobVisualizer() {
    if (!blobVisualizer || !blobPathOuter || !blobPathInner) return;
    blobVisualizer.classList.add("playing");

    if (blobAnimId) cancelAnimationFrame(blobAnimId);
    blobStartTime = null;
    blobAnimId = requestAnimationFrame(renderBlobFrame);
}

function stopBlobVisualizer() {
    blobVisualizer?.classList.remove("playing");

    if (blobAnimId) {
        cancelAnimationFrame(blobAnimId);
        blobAnimId = null;
    }
}
    vinylPlayBtn.addEventListener("click", async () => {

    // 👉 INIT ANALYSER LẦN ĐẦU
    if (!isInit) {
        await playMusic(vinylAudio);
        isInit = true;
    }

    // nếu đang phát → pause
    if (!vinylAudio.paused) {
        vinylAudio.pause();
        isPlaying = false;
        vinyl.classList.remove("playing");
        toneArm.classList.remove("playing");
        vinylPlayBtn.textContent = "▶ Play Music";
        stopBlobVisualizer();

        if (heroMiniPlay) heroMiniPlay.textContent = "▶";
        return;
    }

    // nếu đang dừng → play
    try {
        await vinylAudio.play();
        isPlaying = true;
        
        vinyl.classList.add("playing");
        toneArm.classList.add("playing");
        vinylPlayBtn.textContent = "⏸ Pause";

        startBlobVisualizer();

        if (heroMiniPlay) heroMiniPlay.textContent = "⏸";
    } catch (err) {
        console.log("Play error:", err);
    }
});

    // khi nhạc hết
    vinylAudio.addEventListener("ended", () => {
        vinyl.classList.remove("playing");
        toneArm.classList.remove("playing");
        vinylPlayBtn.textContent = "▶ Play Music";
        stopBlobVisualizer();
if (heroMiniPlay) heroMiniPlay.textContent = "▶";
    });

    const needleSound = document.getElementById("needleSound");

    vinylPlayBtn.addEventListener("click", () => {

        needleSound.currentTime = 0;
        needleSound.play();

    });
    
/* =========================================
   VINYL -> ABOUT IMAGE SCROLL MORPH
========================================= */
/* =========================================================
   ABOUT CINEMATIC TWO-STAGE SCROLL
========================================================= */

const aboutCinematic =
    document.getElementById("about");

if (aboutCinematic) {

    let aboutTicking = false;


    function clamp01(value) {

        return Math.max(
            0,
            Math.min(
                1,
                value
            )
        );

    }


    function updateAboutCinematic() {

    const rect =
        aboutCinematic
            .getBoundingClientRect();


    const total =
        aboutCinematic
            .offsetHeight -
        window.innerHeight;


    if (total <= 0) {
        return;
    }


    /*
       progress tổng của toàn section About

       0 = bắt đầu section
       1 = đi hết section
    */
    const rawProgress =
        clamp01(
            -rect.top /
            total
        );


    /* =========================================
       PHASE 1
       ẢNH FADE IN TỪ DƯỚI LÊN
    ========================================= */
/* =========================================================
   INOZE GLITCH
   mode = slices
========================================================= */

const glitchRoot =
    document.getElementById("inozeGlitch");


if (glitchRoot) {

    const SLICE_STOPS = [
        [20, 50],
        [10, 60],
        [15, 55],
        [25, 35],
        [30, 40],
        [40, 20],
        [10, 60],
        [15, 55],
        [25, 35],
        [30, 40],
        [20, 50],
        [10, 60],
        [15, 55],
        [25, 35],
        [30, 40],
        [40, 20],
        [20, 50],
        [10, 60],
        [15, 55],
        [25, 35],
        [30, 40]
    ];


    const clampGlitch = (
        value,
        min,
        max
    ) => {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    };


    const bandAt = (u) => {

        const x =
            clampGlitch(
                u,
                0,
                1
            )
            *
            (
                SLICE_STOPS.length -
                1
            );


        const i =
            Math.min(
                SLICE_STOPS.length - 2,
                Math.floor(x)
            );


        const f =
            x - i;


        const current =
            SLICE_STOPS[i];

        const next =
            SLICE_STOPS[i + 1];


        return [

            current[0] +
            (
                next[0] -
                current[0]
            )
            * f,

            current[1] +
            (
                next[1] -
                current[1]
            )
            * f

        ];

    };


    const pingPong = (
        time,
        period
    ) => {

        const p =
            (
                time /
                period
            )
            % 2;


        return p < 1
            ? 1 - p
            : p - 1;

    };


    const fitBand = (
        top,
        bottom
    ) => {

        const t =
            clampGlitch(
                top,
                0,
                100
            );

        const b =
            clampGlitch(
                bottom,
                0,
                100
            );


        return (
            t + b >= 100
        )
            ? [0, 100]
            : [t, b];

    };


    /* =========================
       SETTINGS
    ========================= */

    const speed = 1;

    const intensity = 0.5;

    const offset = 10;

    const shadowColorA =
        "#00e6ff";

    const shadowColorB =
        "#00ffff";


    let last = 0;

    let clock = 0;

    let nextStep = 0;

    let event = null;


    function makeEvent(
        now,
        ms
    ) {

        const sign = () =>
            Math.random() < .5
                ? -1
                : 1;


        return {

            until:
                now +
                ms *
                (
                    1 +
                    Math.floor(
                        Math.random() *
                        3
                    )
                ),

            aTop:
                Math.random() *
                80,

            aHeight:
                5 +
                Math.random() *
                22,

            bTop:
                Math.random() *
                85,

            bHeight:
                3 +
                Math.random() *
                14,

            ax:
                sign() *
                (
                    1.3 +
                    Math.random() *
                    1.5
                ),

            bx:
                sign() *
                (
                    1.1 +
                    Math.random() *
                    1.2
                ),

            ay:
                (
                    Math.random() -
                    .5
                )
                * .5,

            by:
                (
                    Math.random() -
                    .5
                )
                * .5,

            skew:
                sign() *
                (
                    .4 +
                    Math.random() *
                    .6
                )

        };

    }


    function glitchStep(
        now,
        power
    ) {

        const ms =
            70 *
            Math.sqrt(
                Math.max(
                    .05,
                    speed
                )
                /
                .5
            );


        if (
            event &&
            now >= event.until
        ) {

            event = null;

        }


        if (
            !event &&
            Math.random() <
                power *
                power *
                .35
        ) {

            event =
                makeEvent(
                    now,
                    ms
                );

        }


        nextStep =
            now +
            ms *
            (
                .7 +
                Math.random() *
                .6
            );

    }


    function frameGlitch(now) {

        const dt =
            last
                ? Math.min(
                    .1,
                    (
                        now -
                        last
                    )
                    /
                    1000
                )
                : 0;


        last = now;

        clock += dt;


        const power =
            clampGlitch(
                intensity,
                0,
                1
            );


        if (
            now >=
            nextStep
        ) {

            glitchStep(
                now,
                power
            );

        }


        const scale =
            .4 +
            1.2 *
            power;


        const off =
            Math.max(
                0,
                offset
            );


        const pace =
            Math.max(
                .05,
                speed
            );


        let a =
            bandAt(
                pingPong(
                    clock,
                    3 * pace
                )
            );


        let b =
            bandAt(
                pingPong(
                    clock,
                    2 * pace
                )
            );


        let ax =
            off *
            scale;

        let bx =
            -off *
            scale;

        let ay = 0;
        let by = 0;

        let skew = 0;


        /* random glitch burst */
        if (
            event &&
            now <
            event.until
        ) {

            a = [
                event.aTop,

                100 -
                event.aTop -
                event.aHeight
            ];


            b = [
                event.bTop,

                100 -
                event.bTop -
                event.bHeight
            ];


            ax =
                off *
                scale *
                event.ax;

            bx =
                off *
                scale *
                event.bx;

            ay =
                off *
                event.ay;

            by =
                off *
                event.by;

            skew =
                event.skew *
                2;

        }


        a =
            fitBand(
                a[0],
                a[1]
            );


        b =
            fitBand(
                b[0],
                b[1]
            );


        glitchRoot.style.setProperty(
            "--glitch-a-top",
            `${a[0].toFixed(2)}%`
        );


        glitchRoot.style.setProperty(
            "--glitch-a-bottom",
            `${a[1].toFixed(2)}%`
        );


        glitchRoot.style.setProperty(
            "--glitch-b-top",
            `${b[0].toFixed(2)}%`
        );


        glitchRoot.style.setProperty(
            "--glitch-b-bottom",
            `${b[1].toFixed(2)}%`
        );


        glitchRoot.style.setProperty(
            "--glitch-a-x",
            `${ax.toFixed(2)}px`
        );


        glitchRoot.style.setProperty(
            "--glitch-a-y",
            `${ay.toFixed(2)}px`
        );


        glitchRoot.style.setProperty(
            "--glitch-b-x",
            `${bx.toFixed(2)}px`
        );


        glitchRoot.style.setProperty(
            "--glitch-b-y",
            `${by.toFixed(2)}px`
        );


        glitchRoot.style.setProperty(
            "--glitch-a-shadow",
            `${(-ax / 2).toFixed(2)}px 0 ${shadowColorA}`
        );


        glitchRoot.style.setProperty(
            "--glitch-b-shadow",
            `${(-bx / 2).toFixed(2)}px 0 ${shadowColorB}`
        );


        glitchRoot.style.setProperty(
            "--glitch-skew",
            `${skew.toFixed(2)}deg`
        );


        glitchRoot.style.setProperty(
            "--glitch-alpha",
            "1"
        );


        requestAnimationFrame(
            frameGlitch
        );

    }


    requestAnimationFrame(
        frameGlitch
    );

}
    /* =========================================
   PHASE 1
   ẢNH FADE IN SỚM KHI ABOUT
   VỪA ĐI VÀO VIEWPORT
========================================= */

const enterStart = -0.01;
    const enterEnd   = 0.28;


    const enterProgress =
        clamp01(
            (
                rawProgress -
                enterStart
            )
            /
            (
                enterEnd -
                enterStart
            )
        );


    /* =========================================
       PHASE 2
       SAU KHI FADE XONG
       MỚI BẮT ĐẦU SCROLL EFFECT
    ========================================= */

    const scrollStart = 0.28;
    const scrollEnd   = 1.00;  


    const scrollProgress =
        clamp01(
            (
                rawProgress -
                scrollStart
            )
            /
            (
                scrollEnd -
                scrollStart
            )
        );


    /* =========================================
       CHUYỂN TỪ PORTRAIT GIỮA
       SANG LAYOUT ABOUT CUỐI
    ========================================= */

    const moveStart = 0.32;
    const moveEnd   = 0.62;


    const moveProgress =
        clamp01(
            (
                scrollProgress -
                moveStart
            )
            /
            (
                moveEnd -
                moveStart
            )
        );


    /* =========================================
       GỬI PROGRESS SANG CSS
    ========================================= */

    aboutCinematic
        .style
        .setProperty(
            "--about-enter",
            enterProgress
        );


    aboutCinematic
        .style
        .setProperty(
            "--about-p",
            scrollProgress
        );


    aboutCinematic
        .style
        .setProperty(
            "--about-move",
            moveProgress
        );


    /* =========================================
       KÍCH HOẠT LAYOUT ABOUT CUỐI

       Chỉ xảy ra sau khi portrait
       đã fade in xong
    ========================================= */

    if (scrollProgress >= 0.56) {

        aboutCinematic
            .classList
            .add(
                "about-layout-active"
            );

    } else {

        aboutCinematic
            .classList
            .remove(
                "about-layout-active"
            );

    }

}


    function requestAboutUpdate() {

        if (aboutTicking) return;


        aboutTicking = true;


        requestAnimationFrame(
            () => {

                updateAboutCinematic();

                aboutTicking = false;

            }
        );

    }


    window.addEventListener(
        "scroll",
        requestAboutUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        requestAboutUpdate
    );


    updateAboutCinematic();

}
/* =========================================
   VINYL -> ABOUT FADE TRANSITION
========================================= */

const sourceVinyl = document.getElementById("vinyl");
const morphTarget = document.getElementById("morphTarget");
const aboutSection = document.getElementById("about");
const waveCanvas = document.getElementById("waveCanvas");

let flyingWave = null;
let waveRect = null;
if (sourceVinyl && morphTarget && aboutSection) {

    
    let morphActive = false;

    
}
/* =========================================
   ABOUT -> PROJECTS
   SOUND PARTICLE HANDOFF
========================================= */

const aboutNotes =
    document.querySelectorAll(
        ".about-v2__notes.chaos span"
    );

const aboutNotesBox =
    document.querySelector(
        ".about-v2__notes.chaos"
    );

const projectsSection =
    document.getElementById("projects");

const productImage =
    document.getElementById("shopMainImage");


if (
    aboutNotes.length &&
    aboutNotesBox &&
    projectsSection &&
    productImage
) {

    /* =========================
       TẠO LAYER
    ========================= */

    const handoffLayer =
        document.createElement("div");

    handoffLayer.className =
        "sound-handoff-layer";

    document.body.appendChild(
        handoffLayer
    );


    /* =========================
       TẠO CLONE PARTICLES
    ========================= */

    const particles = [];

    const colors = [
        "#7b6cff",
        "#3ed0ff",
        "#6dffb0",
        "#9f7cff",
        "#38bdf8",
        "#4ade80",
        "#a78bfa",
        "#22d3ee",
        "#86efac",
        "#8b5cf6"
    ];


    aboutNotes.forEach(
        (note, index) => {

            const clone =
                document.createElement("span");

            clone.className =
                "sound-handoff-particle";

            clone.textContent =
                note.textContent;

            clone.style.color =
                colors[
                    index %
                    colors.length
                ];

            clone.style.opacity = "0";

            handoffLayer.appendChild(
                clone
            );

            particles.push(clone);

        }
    );


    /* =========================
       ARRIVAL PULSE
    ========================= */

    const arrivalPulse =
        document.createElement("div");

    arrivalPulse.className =
        "product-arrival-pulse";

    document.body.appendChild(
        arrivalPulse
    );


    let arrived = false;


    function updateSoundHandoff() {

        const projectRect =
            projectsSection
                .getBoundingClientRect();


        /*
          animation bắt đầu khi Projects
          đi vào từ dưới
        */

        const start =
            window.innerHeight * 1.25;

        const end =
            window.innerHeight * 0.20;


        let progress =
            (
                start -
                projectRect.top
            ) /
            (
                start -
                end
            );


        progress =
            Math.max(
                0,
                Math.min(
                    1,
                    progress
                )
            );


        /* =========================
           RESET
        ========================= */

        if (progress <= 0) {

            particles.forEach(
                particle => {

                    particle.style.opacity =
                        "0";

                }
            );

            aboutNotesBox.classList.remove(
                "is-handoff-source"
            );

            productImage.classList.remove(
                "sound-arrive"
            );

            arrived = false;

            return;
        }


        aboutNotesBox.classList.add(
            "is-handoff-source"
        );


        /* =========================
           TARGET
        ========================= */

        const targetRect =
            productImage
                .getBoundingClientRect();


        const targetX =
            targetRect.left +
            targetRect.width * 0.5;

        const targetY =
            targetRect.top +
            targetRect.height * 0.5;


        /* =========================
           SOURCE
        ========================= */

        const sourceRect =
            aboutNotesBox
                .getBoundingClientRect();


        const sourceX =
            sourceRect.left +
            sourceRect.width * 0.5;

        const sourceY =
            sourceRect.top +
            sourceRect.height * 0.65;


        particles.forEach(
            (particle, index) => {

                /*
                  mỗi particle bắt đầu
                  hơi lệch thời gian
                */

                const delay =
                    index * 0.035;


                let p =
                    (
                        progress -
                        delay
                    ) /
                    (
                        1 -
                        delay
                    );


                p =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            p
                        )
                    );


                /*
                  easing
                */

                const ease =
                    1 -
                    Math.pow(
                        1 - p,
                        3
                    );


                /*
                  particle xuất phát
                  rải quanh notes box
                */

                const spreadX =
                    (
                        index -
                        particles.length / 2
                    ) * 28;

                const spreadY =
                    Math.sin(
                        index * 1.7
                    ) * 35;


                const sx =
                    sourceX +
                    spreadX;

                const sy =
                    sourceY +
                    spreadY;


                /*
                  đường bay cong
                */

                const curve =
                    Math.sin(
                        p * Math.PI
                    );


                const curveX =
                    curve *
                    (
                        100 +
                        index * 5
                    );

                const curveY =
                    -curve *
                    (
                        80 +
                        index * 4
                    );


                const x =
                    sx +
                    (
                        targetX -
                        sx
                    ) * ease +
                    curveX;


                const y =
                    sy +
                    (
                        targetY -
                        sy
                    ) * ease +
                    curveY;


                /*
                  xoay particle
                */

                const rotate =
                    (
                        index % 2
                        ? 1
                        : -1
                    ) *
                    p *
                    (
                        180 +
                        index * 34
                    );


                /*
                  lúc đầu nhỏ
                  giữa đường lớn hơn
                  tới target thu lại
                */

                const scale =
                    0.75 +
                    Math.sin(
                        p *
                        Math.PI
                    ) * 0.9;


                /*
                  fade
                */

                let opacity = 1;

                if (p < .08) {

                    opacity =
                        p / .08;

                }

                else if (p > .82) {

                    opacity =
                        1 -
                        (
                            p - .82
                        ) / .18;

                }


                particle.style.opacity =
                    Math.max(
                        0,
                        opacity
                    );


                particle.style.transform = `
                    translate3d(
                        ${x}px,
                        ${y}px,
                        0
                    )

                    translate(
                        -50%,
                        -50%
                    )

                    rotate(
                        ${rotate}deg
                    )

                    scale(
                        ${scale}
                    )
                `;


                /*
                  giữa đường glow mạnh hơn
                */

                const blur =
                    Math.sin(
                        p *
                        Math.PI
                    ) * 2;

                particle.style.filter =
                    `blur(${blur}px)`;

            }
        );


        /* =========================
           ARRIVE
        ========================= */

        if (
            progress > .84 &&
            !arrived
        ) {

            arrived = true;


            productImage.classList.add(
                "sound-arrive"
            );


            const targetRectNow =
                productImage
                    .getBoundingClientRect();


            arrivalPulse.style.left =
                (
                    targetRectNow.left +
                    targetRectNow.width / 2
                ) + "px";


            arrivalPulse.style.top =
                (
                    targetRectNow.top +
                    targetRectNow.height / 2
                ) + "px";


            arrivalPulse.classList.remove(
                "fire"
            );


            void arrivalPulse.offsetWidth;


            arrivalPulse.classList.add(
                "fire"
            );


            setTimeout(
                () => {

                    productImage
                        .classList
                        .remove(
                            "sound-arrive"
                        );

                },
                550
            );

        }


        if (progress < .75) {

            arrived = false;

        }

    }


    window.addEventListener(
        "scroll",
        updateSoundHandoff,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        updateSoundHandoff
    );


    updateSoundHandoff();
}
});

/* =========================================================
   CONTACT - SHINY TEXT
   "THÔNG TIN"
========================================================= */

const infoShinyText =
    document.getElementById(
        "infoShinyText"
    );


if (infoShinyText) {

    const shinyGlow =
        infoShinyText.querySelector(
            ".shiny-text__glow"
        );


    /* =========================
       SETTINGS
    ========================= */

    const baseColor =
        "#dfe7eb";

    const shineColor =
        "#ffffff";

    const glowColor =
        "#9fe1f7";

    const speed =
        2.8;

    const shineWidth =
        34;

    const angle =
        120;


    let startTime = null;


    function renderInfoShine(time) {

        if (!startTime) {
            startTime = time;
        }


        const elapsed =
            (
                time -
                startTime
            )
            /
            1000;


        /*
           -shineWidth -> 100 + shineWidth
        */
        const range =
            100 +
            shineWidth * 2;


        const progress =
            (
                elapsed /
                speed
            )
            % 1;


        const position =
            -shineWidth +
            range *
            progress;


        const left =
            position -
            shineWidth;


        const center =
            position;


        const right =
            position +
            shineWidth;


        /* =========================
           MAIN SHINE
        ========================= */

        const mainGradient =
            `
            linear-gradient(
                ${angle}deg,

                ${baseColor} 0%,

                ${baseColor} ${left}%,

                rgba(210, 248, 255, .9)
                ${center - 8}%,

                ${shineColor}
                ${center}%,

                rgba(173, 232, 247, 0.9)
                ${center + 8}%,

                ${baseColor}
                ${right}%,

                ${baseColor} 100%
            )
            `;


        infoShinyText.style.backgroundImage =
            mainGradient;


        /* =========================
           GLOW LAYER
        ========================= */

        if (shinyGlow) {

            const glowGradient =
                `
                linear-gradient(
                    ${angle}deg,

                    transparent 0%,

                    transparent
                    ${left}%,

                    transparent
                    ${center - 14}%,

                    ${glowColor}
                    ${center}%,

                    transparent
                    ${center + 14}%,

                    transparent
                    100%
                )
                `;


            shinyGlow.style.backgroundImage =
                glowGradient;

        }


        requestAnimationFrame(
            renderInfoShine
        );

    }


    requestAnimationFrame(
        renderInfoShine
    );

}
// đảm bảo wave nằm trong vinyl


// tạo 144 thanh


const audioFile = document.getElementById("audioFile");
const vinylAudio = document.getElementById("audio");



 
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 600;

const cx = 300;
const cy = 300;


let audioCtx;

function playMusic() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioCtx.createMediaElementSource(vinylAudio);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    src.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    
}
let smooth = new Array(128).fill(0);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.0018;

    if (!isPlaying) {
        idleRotation += 0.004;
    }

    let bassEnergy = 0;

    if (isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray);

        // giảm smoothing để beat gãy rõ hơn
        for (let i = 0; i < bufferLength; i++) {
            smooth[i] = smooth[i] * 0.68 + dataArray[i] * 0.32;
        }

        // lấy năng lượng bass để tạo cú đập mạnh
        let bassSum = 0;
        const bassEnd = Math.max(4, Math.floor(bufferLength * 0.08));
        for (let i = 0; i < bassEnd; i++) {
            bassSum += smooth[i];
        }
        bassEnergy = bassSum / bassEnd / 255;
    }

    const layers = 30;
    const points = 220;
    const rings = [];
    const gradient = ctx.createRadialGradient(cx, cy, 120, cx, cy, 250);
    gradient.addColorStop(0, "rgba(0,255,220,0.08)");
    gradient.addColorStop(0.5, "rgba(0,255,180,0.16)");
    gradient.addColorStop(1, "rgba(0,120,255,0.25)");

    // boost cho nhịp bass
    const beatBoost = Math.pow(bassEnergy, 1.9) * 42;

    for (let l = 0; l < layers; l++) {
        const ring = [];
        const layerRatio = l / (layers - 1);
        const radiusBase = 140 + l * 2.45;

        for (let i = 0; i <= points; i++) {
            
            const t = i / points;
            const baseAngle = t * Math.PI * 2;
            const angle = baseAngle + idleRotation;

            let value = 0;

            if (isPlaying && analyser) {
                const idx1 = Math.floor(t * (bufferLength - 1));
                const idx2 = (idx1 + l * 2) % bufferLength;
                const idx3 = Math.floor((1 - t) * (bufferLength - 1));

                const v1 = smooth[idx1] / 255;
                const v2 = smooth[idx2] / 255;
                const v3 = smooth[idx3] / 255;

                value = v1 * 0.45 + v2 * 0.35 + v3 * 0.20;
            } else {
                value =
                    0.22 +
                    Math.sin(baseAngle * 3 + time * 1.2) * 0.08 +
                    Math.cos(baseAngle * 5 - time) * 0.05;
            }

            // giữ nguyên hệ wave cũ
            const wave1 = Math.sin(baseAngle * 3 + time * 1.5 + l * 0.17) * 10;
            const wave2 = Math.cos(baseAngle * 5 - time * 1.2 + l * 0.11) * 7;
            const wave3 = Math.sin(baseAngle * 9 + time * 2.0 - l * 0.07) * 5;
            const wave4 = Math.cos(baseAngle * 13 - time * 2.3 + l * 0.19) * 4.5;
            const wave5 = Math.sin(baseAngle * 19 + time * 1.7 + l * 0.09) * 3.2;

            const edgeBoost = 0.4 + layerRatio * 0.9;

            const chaos =
                Math.sin(baseAngle * (6 + layerRatio * 8) + time * 1.3 + l * 0.25) * 4 +
                Math.cos(baseAngle * (11 + layerRatio * 4) - time * 1.8 - l * 0.15) * 3;

            // audio cũ nhưng đẩy mạnh hơn chút
            const audioPush = value * 42 * edgeBoost;

            // spike để tạo cảm giác "gãy" theo nhạc
            const spike = isPlaying
                ? Math.pow(
                      Math.max(0, Math.sin(baseAngle * 14 + time * 0.35 + l * 0.25)),
                      7
                  ) *
                  beatBoost *
                  (0.35 + layerRatio * 1)
                : 0;

            const radius =
                radiusBase +
                (wave1 + wave2 + wave3 + wave4 + wave5) * edgeBoost +
                chaos +
                audioPush +
                spike;

            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            ring.push({ x, y, layerRatio });
        }

        rings.push(ring);
    }

    // Vẽ các vòng chính
    for (let l = 0; l < rings.length; l++) {
        const ring = rings[l];
        const layerRatio = l / (rings.length - 1);

        ctx.beginPath();
        for (let i = 0; i < ring.length; i++) {
            const p = ring[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();

        ctx.strokeStyle = gradient;
        ctx.lineWidth = layerRatio > 0.82 ? 1.1 : 0.55;
        ctx.stroke();
    }

    // Vẽ các đường nối giữa các lớp để tạo lưới
    for (let l = 0; l < rings.length - 1; l++) {
        const ringA = rings[l];
        const ringB = rings[l + 1];

        for (let i = 0; i < points; i += 2) {
            const p1 = ringA[i];
            const p2 = ringB[(i + (l % 3)) % ringB.length];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.45;
            ctx.stroke();
        }
    }

    // thêm một số đường chéo ngẫu nhiên có quy luật để trông rối hơn
    for (let l = 0; l < rings.length - 3; l += 2) {
        const ringA = rings[l];
        const ringB = rings[l + 3];

        for (let i = 0; i < points; i += 6) {
            const p1 = ringA[i];
            const p2 = ringB[(i + 8) % ringB.length];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.35;
            ctx.stroke();
        }
    }

    // chấm điểm nhẹ để giống particle mesh hơn
    for (let l = 0; l < rings.length; l++) {
        const ring = rings[l];
        const layerRatio = l / (rings.length - 1);

        for (let i = 0; i < ring.length; i += 3) {
            const p = ring[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, layerRatio > 0.85 ? 0.9 : 0.55, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    // viền ngoài sáng hơn
    const outer = rings[rings.length - 1];
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    for (let i = 0; i < outer.length; i++) {
        const p = outer[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }

    ctx.closePath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4.2;

    ctx.stroke();
    ctx.restore();

    requestAnimationFrame(animate);
}
const notes = ["♪", "♫","𝄞", "♭","♩","♮"];

let lastX = 0;
let lastY = 0;

document.addEventListener("mousemove", (e) => {
    
    const note = document.createElement("div");
    note.className = "note";

    // random nốt
    note.innerText = notes[Math.floor(Math.random() * notes.length)];

    // 👉 dùng vị trí CŨ (đuôi)
    note.style.left = lastX +50 + "px";
    note.style.top = lastY + 50 + "px";
    const value = dataArray ? dataArray[10] / 255 : Math.random();

note.style.color = `hsl(${190 + value * 20}, 100%, ${70 + value * 30}%)`;
    document.body.appendChild(note);

    // update vị trí mới
    lastX = e.clientX;
    lastY = e.clientY;

    setTimeout(() => {
        note.remove();
    }, 1000);
});
animate();



/* =========================================
   INOZE CONTACT — GRADIENT WAVES
   Vanilla JavaScript / Canvas 2D
   Màu tím - hồng - trắng
========================================= */
(() => {
    const container = document.getElementById("contactGradientWaves");
    const section = document.getElementById("contact");

    if (!container || !section) return;

    // Tạo canvas bên trong vùng nền
    const canvas = document.createElement("canvas");
    canvas.className = "contact-gradient-waves-canvas";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId = null;
    let lastTime = 0;
    let time = 0;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    // Tím, hồng và trắng
    
const waves = [
    {
        level: 0.58,
        amplitude: 0.075,
        frequency: 1.15,
        speed: 0.22,
        color: [0, 85, 125],
        opacity: 0.25
    },
    {
        level: 0.66,
        amplitude: 0.065,
        frequency: 1.65,
        speed: -0.18,
        color: [0, 155, 175],
        opacity: 0.22
    },
    {
        level: 0.75,
        amplitude: 0.055,
        frequency: 2.1,
        speed: 0.15,
        color: [0, 115, 90],
        opacity: 0.20
    },
    {
        level: 0.83,
        amplitude: 0.04,
        frequency: 2.7,
        speed: -0.12,
        color: [65, 190, 125],
        opacity: 0.10
    }
];

    function resize() {
        const rect = container.getBoundingClientRect();

        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        if (width <= 0 || height <= 0) return;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function getWaveY(x, wave, index) {
        const progress = x / Math.max(width, 1);

        const wave1 = Math.sin(
            progress * Math.PI * 2 * wave.frequency +
            time * wave.speed +
            index * 0.8
        );

        const wave2 = Math.sin(
            progress * Math.PI * 4 -
            time * wave.speed * 0.65 +
            index * 1.3
        ) * 0.3;

        const envelope = 0.45 + Math.sin(progress * Math.PI) * 0.55;

        return height * wave.level +
            (wave1 + wave2) * height * wave.amplitude * envelope;
    }

    function draw(timestamp) {
        animationId = null;

        if (document.hidden || width <= 0 || height <= 0) return;

        if (!lastTime) lastTime = timestamp;

        const delta = Math.min(timestamp - lastTime, 40);
        lastTime = timestamp;

        if (!reduceMotion.matches) {
            time += delta * 0.001;
        }

        // Nền xanh đen pha tím

// Nền đen gần như tuyệt đối
const background = ctx.createLinearGradient(
    0, 0, width, height
);

background.addColorStop(0, "#000000");
background.addColorStop(0.5, "#010303");
background.addColorStop(1, "#000000");

ctx.fillStyle = background;
ctx.fillRect(0, 0, width, height);

// Ánh sáng cyan, xanh dương và xanh lá thật nhẹ
const glow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.72,
    0,
    width * 0.5,
    height * 0.72,
    Math.max(width * 0.7, height * 0.85)
);

glow.addColorStop(0, "rgba(0, 100, 120, 0.10)");
glow.addColorStop(0.4, "rgba(0, 50, 100, 0.07)");
glow.addColorStop(0.7, "rgba(0, 65, 35, 0.04)");
glow.addColorStop(1, "rgba(0, 0, 0, 0)");

ctx.fillStyle = glow;
ctx.fillRect(0, 0, width, height);






        const step = Math.max(2, width / 300);

        waves.forEach((wave, index) => {
            const rgb = wave.color.join(", ");

            const fillGradient = ctx.createLinearGradient(
                0,
                height * (wave.level - wave.amplitude * 2),
                0,
                height
            );

            fillGradient.addColorStop(
                0,
                `rgba(${rgb}, 0)`
            );

            fillGradient.addColorStop(
                0.3,
                `rgba(${rgb}, ${wave.opacity * 0.6})`
            );

            fillGradient.addColorStop(
                1,
                `rgba(${rgb}, 0.015)`
            );

            // Vẽ mặt sóng
            ctx.beginPath();
            ctx.moveTo(0, height);

            for (let x = 0; x <= width + step; x += step) {
                const y = getWaveY(x, wave, index);
                ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.closePath();

            ctx.fillStyle = fillGradient;
            ctx.fill();

            // Đường sáng trên đỉnh sóng
            ctx.beginPath();

            for (let x = 0; x <= width + step; x += step) {
                const y = getWaveY(x, wave, index);

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            const lineGradient = ctx.createLinearGradient(
                0, 0, width, 0
            );

            lineGradient.addColorStop(
                0,
                `rgba(${rgb}, 0.03)`
            );

            lineGradient.addColorStop(
                0.35,
                `rgba(${rgb}, ${wave.opacity})`
            );

            lineGradient.addColorStop(
                0.7,
                `rgba(${rgb}, ${wave.opacity * 0.8})`
            );

            lineGradient.addColorStop(
                1,
                `rgba(${rgb}, 0.03)`
            );

            ctx.save();
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = index === 3 ? 1.2 : 1;
            ctx.shadowColor = `rgba(${rgb}, 0.7)`;
            ctx.shadowBlur = index === 3 ? 15 : 9;
            ctx.stroke();
            ctx.restore();
        });

        // Hạt sáng li ti tạo cảm giác không gian âm nhạc
        for (let i = 0; i < 32; i++) {
            const x = (i * 137.5 + time * 8) % Math.max(width, 1);
            const y = height * (0.43 + (i % 7) * 0.065);
            const alpha = 0.15 + (Math.sin(time * 1.5 + i) + 1) * 0.15;

            ctx.beginPath();
            ctx.arc(x, y, i % 4 === 0 ? 1.3 : 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(105, 205, 160, ${alpha})`;
            ctx.fill();
        }

        animationId = requestAnimationFrame(draw);
    }

    function start() {
        if (animationId !== null || document.hidden) return;

        lastTime = 0;
        animationId = requestAnimationFrame(draw);
    }

    function stop() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    resize();
    start();

    if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
    } else {
        window.addEventListener("resize", resize);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });
})();

/* =========================================
   HOME STATS — COUNT UP ANIMATION
   Load trang + Scroll vào section
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const statsContainer = document.querySelector(".home-stats");

    if (!statsContainer) return;

    const statNumbers = statsContainer.querySelectorAll(".stat-item strong");

    const duration = 2000;
    let isVisible = false;

    const counters = [...statNumbers].map(element => {
        const originalText = element.textContent.trim();
        const match = originalText.match(/^(\d+)(.*)$/);

        if (!match) return null;

        return {
            element,
            originalText,
            target: parseInt(match[1], 10),
            suffix: match[2],
            animationId: null,
            delayId: null
        };
    }).filter(Boolean);

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function animateCount(counter) {
        cancelAnimationFrame(counter.animationId);

        let startTime = null;

        function update(timestamp) {
            if (startTime === null) startTime = timestamp;

            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(
                counter.target * easeOutCubic(progress)
            );

            counter.element.textContent = current + counter.suffix;

            if (progress < 1) {
                counter.animationId = requestAnimationFrame(update);
            } else {
                counter.element.textContent = counter.originalText;
                counter.animationId = null;
            }
        }

        counter.animationId = requestAnimationFrame(update);
    }

    function startCountUp() {
        counters.forEach((counter, index) => {
            clearTimeout(counter.delayId);
            cancelAnimationFrame(counter.animationId);

            counter.element.textContent = "0" + counter.suffix;

            counter.delayId = setTimeout(() => {
                animateCount(counter);
            }, index * 200);
        });
    }

    function stopCountUp() {
        counters.forEach(counter => {
            clearTimeout(counter.delayId);
            cancelAnimationFrame(counter.animationId);

            counter.animationId = null;
            counter.element.textContent = counter.originalText;
        });
    }

    // Chạy ngay khi load trang
    startCountUp();

    // Chạy lại khi scroll vào section
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {

            if (entry.isIntersecting && !isVisible) {
                isVisible = true;
                startCountUp();
            }

            if (!entry.isIntersecting && isVisible) {
                isVisible = false;
                stopCountUp();
            }

        });
    }, {
        threshold: 0.4
    });

    observer.observe(statsContainer);
});
