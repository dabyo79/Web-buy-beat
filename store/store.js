/*
  INOZE STORE CONNECTOR

  Add before </body>:
  <script src="config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="store/store.js"></script>
*/

(async function () {
  "use strict";

  /* =========================
     CONFIG
  ========================= */

  const cfg = window.INOZE_CONFIG || {};

  if (
    !cfg.SUPABASE_URL ||
    cfg.SUPABASE_URL.includes("YOUR_") ||
    !cfg.SUPABASE_ANON_KEY
  ) {
    console.warn("INOZE: config.js chưa được cấu hình.");
    return;
  }

  if (!window.supabase) {
    console.error("INOZE: Supabase JS chưa được load.");
    return;
  }

  const { createClient } = supabase;

  const db = createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  const money = n => {
    return new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + "đ";
  };

  const esc = s =>
    String(s ?? "").replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return "0:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);

    return `${min}:${String(sec).padStart(2, "0")}`;
  };


  /* =========================
     STATE
  ========================= */

  let beats = [];
  let filteredBeats = [];
  let selectedIndex = 0;

  const audio = $("#audioPlayer");
  const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  media: audio,

  height: 30,

  waveColor: "#7c7a7ac9",
  progressColor: "#d5f560",

  cursorColor: "#ff453a",
  cursorWidth: 2,

  barWidth: 1.5,
  barGap: 1.5,
  barRadius: 2,

  normalize: true,
  interact: true,

  /* QUAN TRỌNG */
  autoScroll: false,
  autoCenter: false,
  fillParent: true,
  minPxPerSec: 0,

  hideScrollbar: true
});
  let isPlaying = false;

  
  /* =========================
     LOAD BEATS
  ========================= */

  async function loadBeats() {
    const { data, error } = await db
      .from("beats")
      .select("*")
      .eq("status", "active")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("INOZE beats:", error);
      return;
    }

    beats = data || [];
    filteredBeats = [...beats];
    const beatCount = $("#beatCount");
    if (beatCount) {
  beatCount.textContent = filteredBeats.length;
}
    renderTracks();

    if (filteredBeats.length > 0) {
      selectedIndex = 0;
      selectBeat(0, false);
    } else {
      clearPanel();
    }
  }


  /* =========================
     TRACKLIST
  ========================= */

  function renderTracks() {

    const tracks = $("#tracks");

    if (!tracks) return;


    if (!filteredBeats.length) {

        tracks.innerHTML = `
            <div class="empty">
                Chưa có beat.
            </div>
        `;

        return;
    }


    tracks.innerHTML = filteredBeats
        .map((b, i) => {

            const meta = [
                b.bpm ? `${b.bpm} BPM` : null,
                b.key || null
            ]
            .filter(Boolean)
            .join(" · ");


            return `
                <article
                    class="beat-card ${
                        i === selectedIndex
                            ? "is-active"
                            : ""
                    }"
                    data-index="${i}"
                    data-id="${esc(b.id)}"
                >

                    <div class="beat-card-cover">

                        <img
                            src="${
                                b.cover_url ||
                                "images/project1.jpg"
                            }"
                            alt="${esc(b.title)}"
                        >

                        ${
                            i === selectedIndex && isPlaying
                                ? `
                                    <div class="beat-playing">
                                        ❚❚ ĐANG PHÁT
                                    </div>
                                  `
                                : ""
                        }

                    </div>


                    <div class="beat-card-body">

                        <div class="beat-card-title">
                            ${esc(b.title)}
                        </div>

                        
                        


                        <div class="beat-card-meta">

                            <span>
                                ${esc(b.genre || " ")}
                            </span>

                            <span class="beat-clicks">
                                ▶
                                <span id="click-${b.id}">
                                    ${Number(b.clicks || 0).toLocaleString("vi-VN")}
                                </span>
                            </span>

                        </div>


                        
                        <div class="beat-card-bottom">

        

        <button
            class="beat-card-buy"
            type="button"
            data-buy-index="${i}"
        >
           🛒 ${money(b.price)}
        </button>

        <button
    class="beat-details-btn"
    type="button"
    data-details-index="${i}"
    aria-label="Xem chi tiết"
    title="Xem chi tiết"
>
    <i class="fa fa-eye"></i>
</button>

    </div>

                    </div>

                </article>
            `;

        })
        .join("");
}


  /* =========================
     SELECT BEAT
  ========================= */

  function selectBeat(index, autoplay = false) {

    if (!filteredBeats.length) return;

    if (index < 0) {
      index = filteredBeats.length - 1;
    }

    if (index >= filteredBeats.length) {
      index = 0;
    }
    
    selectedIndex = index;

    const beat = filteredBeats[selectedIndex];

    updatePanel(beat);
    updatePlayer(beat);
    renderTracks();

    if (audio) {
      audio.pause();
      isPlaying = false;

      audio.currentTime = 0;
      updatePlayButtons();

      if (beat.audio_url) {

  audio.src = beat.audio_url;
  audio.load();

  // tạo waveform của beat mới
  wavesurfer.load(beat.audio_url);

} else {

  audio.removeAttribute("src");
  audio.load();

  wavesurfer.empty();
}
    }

    if (autoplay && beat.audio_url) {
      playAudio();
    }
  }


  /* =========================
     PANEL
  ========================= */

  function updatePanel(beat) {

    const cover = $("#panelCover");
    const title = $("#panelTitle");
    const meta = $("#panelMeta");
    const price = $("#panelPrice");

    if (cover) {
      cover.src = beat.cover_url || "images/project1.jpg";
      cover.alt = beat.title || "";
    }

    if (title) {
      title.textContent = beat.title || "";
    }

    if (meta) {

      const parts = [];

      if (beat.artist) {
        parts.push(beat.artist);
      } else {
        parts.push("INOZE");
      }

      if (beat.bpm) {
        parts.push(`${beat.bpm} BPM`);
      }

      if (beat.key) {
        parts.push(beat.key);
      }

      meta.textContent = parts.join(" · ");
    }

    if (price) {
      price.textContent = money(beat.price);
    }
  }


  /* =========================
     STICKY PLAYER
  ========================= */

  function updatePlayer(beat) {

    const cover = $("#pCover");
    const title = $("#pTitle");
    const meta = $("#pMeta");

    if (cover) {
      cover.src = beat.cover_url || "images/project1.jpg";
      cover.alt = beat.title || "";
    }

    if (title) {
      title.textContent = beat.title || "";
    }

    if (meta) {

      const parts = [];

      parts.push(beat.artist || "INOZE");

      if (beat.bpm) {
        parts.push(`${beat.bpm} BPM`);
      }

      if (beat.key) {
        parts.push(beat.key);
      }

      meta.textContent = parts.join(" · ");
    }

    updateTime();
  }


  /* =========================
     CLEAR PANEL
  ========================= */

  function clearPanel() {

    const cover = $("#panelCover");
    const title = $("#panelTitle");
    const meta = $("#panelMeta");
    const price = $("#panelPrice");

    const pCover = $("#pCover");
    const pTitle = $("#pTitle");
    const pMeta = $("#pMeta");

    if (cover) {
      cover.src = "images/project1.jpg";
    }

    if (title) {
      title.textContent = "Chưa có beat";
    }

    if (meta) {
      meta.textContent = "INOZE";
    }

    if (price) {
      price.textContent = "0đ";
    }

    if (pCover) {
      pCover.src = "images/project1.jpg";
    }

    if (pTitle) {
      pTitle.textContent = "Chưa có beat";
    }

    if (pMeta) {
      pMeta.textContent = "INOZE";
    }
  }


  /* =========================
     PLAY
  ========================= */

  async function playAudio() {

  const beat = filteredBeats[selectedIndex];

  if (!beat || !beat.audio_url) {
    alert("Beat này chưa có file MP3.");
    return;
  }

  try {

    await wavesurfer.play();

    isPlaying = true;

    updatePlayButtons();
    renderTracks();

  } catch (error) {

    console.error("INOZE audio:", error);

  }
}


function pauseAudio() {

  wavesurfer.pause();

  isPlaying = false;

  updatePlayButtons();
  renderTracks();

}


function togglePlay() {

  if (!wavesurfer) return;

  if (wavesurfer.isPlaying()) {

    pauseAudio();

  } else {

    playAudio();

  }

}


  /* =========================
     PAUSE
  ========================= */

  function pauseAudio() {

    if (!audio) return;

    audio.pause();

    isPlaying = false;

    updatePlayButtons();
    renderTracks();
  }


  /* =========================
     TOGGLE PLAY
  ========================= */

  function togglePlay() {

    if (!audio) return;

    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }


  /* =========================
     PLAY BUTTON UI
  ========================= */

  function updatePlayButtons() {

    const playBtn = $("#playBtn");
    const panelPlay = $("#panelPlay");

    if (playBtn) {
      playBtn.textContent = isPlaying
        ? "❚❚"
        : "▶";
    }

    if (panelPlay) {
      panelPlay.textContent = isPlaying
        ? "❚❚ Pause"
        : "▶ Play";
    }
  }


  /* =========================
     AUDIO EVENTS
  ========================= */

  if (audio) {

    audio.addEventListener("loadedmetadata", () => {
      updateTime();
    });

    audio.addEventListener("timeupdate", () => {
      updateTime();
      
    });

    audio.addEventListener("play", () => {

      isPlaying = true;

      updatePlayButtons();
      renderTracks();
    });

    audio.addEventListener("pause", () => {

      isPlaying = false;

      updatePlayButtons();
      renderTracks();
    });

    audio.addEventListener("ended", () => {

      isPlaying = false;

      updatePlayButtons();

      if (filteredBeats.length > 1) {
        selectBeat(selectedIndex + 1, true);
      } else {
        
        renderTracks();
      }
    });

    audio.addEventListener("error", e => {
      console.error("INOZE audio error:", e);
    });
  }


  /* =========================
     TIME
  ========================= */

  function updateTime() {

    const timeTxt = $("#timeTxt");

    if (!timeTxt || !audio) return;

    const current = formatTime(audio.currentTime);
    const duration = formatTime(audio.duration);

    timeTxt.textContent =
      `${current} / ${duration}`;
  }


  /* =========================
     PROGRESS
  ========================= */

  


  /* =========================
     SEEK
  ========================= */

  


  /* =========================
     VOLUME
  ========================= */

  const volume = $("#volume");

  if (volume && audio) {

    audio.volume = Number(volume.value);

    volume.addEventListener("input", () => {

      audio.volume =
        Number(volume.value);

    });
  }

function openBeatDetails(beat) {

    const old =
        document.querySelector("#beatDetailsModal");

    if (old) old.remove();


    const formatDate = value => {

        if (!value) return "Không có";

        const d = new Date(value);

        if (Number.isNaN(d.getTime())) {
            return "Không có";
        }

        return d.toLocaleDateString(
            "vi-VN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    };


    const modal =
        document.createElement("div");

    modal.id = "beatDetailsModal";


    modal.innerHTML = `

        <div class="beat-details-overlay">

            <div class="beat-details-modal">

                <button
                    class="beat-details-close"
                    type="button"
                >
                    ×
                </button>


                <div class="beat-details-layout">

                    <div class="beat-details-cover">

                        <img
                            src="${
                                beat.cover_url ||
                                "images/project1.jpg"
                            }"
                            alt="${esc(beat.title)}"
                        >

                    </div>


                    <div class="beat-details-content">

                        <div class="beat-details-label">
                            BEAT DETAILS
                        </div>

                        <h2>
                            ${esc(beat.title)}
                        </h2>

                        <div class="beat-details-artist">
                            ${esc(beat.artist || "INOZE")}
                        </div>


                        <div class="beat-details-grid">

                            <div>
                                <span>BPM</span>
                                <strong>
                                    ${beat.bpm || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>KEY</span>
                                <strong>
                                    ${esc(beat.key || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>GENRE</span>
                                <strong>
                                    ${esc(beat.genre || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>FORMAT</span>
                                <strong>MP3</strong>
                            </div>

                            <div>
                                <span>GIÁ</span>
                                <strong>
                                    ${money(beat.price)}
                                </strong>
                            </div>

                            <div>
                                <span>LƯỢT CLICK</span>
                                <strong>
                                    ${Number(
                                        beat.clicks || 0
                                    ).toLocaleString("vi-VN")}
                                </strong>
                            </div>

                            <div>
                                <span>NGÀY ĐĂNG</span>
                                <strong>
                                    ${formatDate(beat.created_at)}
                                </strong>
                            </div>

                        </div>


                        ${
                            beat.description
                                ? `
                                    <div class="beat-details-description">

                                        <span>MÔ TẢ</span>

                                        <p>
                                            ${esc(beat.description)}
                                        </p>

                                    </div>
                                  `
                                : ""
                        }


                        <div class="beat-details-actions">

                            <button
                                class="details-play"
                                type="button"
                            >
                                ▶ Nghe beat
                            </button>

                            <button
                                class="details-buy"
                                type="button"
                            >
                                🛒 Mua — ${money(beat.price)}
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    /* CLOSE */

    modal
        .querySelector(".beat-details-close")
        .onclick = () => {

            modal.remove();

        };


    modal
        .querySelector(".beat-details-overlay")
        .addEventListener("click", e => {

            if (
                e.target.classList.contains(
                    "beat-details-overlay"
                )
            ) {
                modal.remove();
            }

        });


    /* PLAY */

    modal
        .querySelector(".details-play")
        .onclick = () => {

            const index =
                filteredBeats.findIndex(
                    b => b.id === beat.id
                );

            if (index !== -1) {

                if (index === selectedIndex) {
                    togglePlay();
                } else {
                    selectBeat(index, true);
                }

                countBeatClick(beat);

            }

        };


    /* BUY */

    modal
        .querySelector(".details-buy")
        .onclick = () => {

            modal.remove();
            openBuy(beat);

        };
}
  /* =========================
     TRACK CLICK
  ========================= */

  const tracks = $("#tracks");

if (tracks) {

    tracks.addEventListener("click", e => {

        /* =========================
           VIEW DETAILS
        ========================= */

        const detailsBtn =
            e.target.closest(".beat-details-btn");

        if (detailsBtn) {

            e.stopPropagation();

            const index =
                Number(detailsBtn.dataset.detailsIndex);

            const beat =
                filteredBeats[index];

            if (beat) {
                openBeatDetails(beat);
            }

            return;
        }


        /* =========================
           BUY
        ========================= */

        const buyBtn =
            e.target.closest(".beat-card-buy");

        if (buyBtn) {

            e.stopPropagation();

            const index =
                Number(buyBtn.dataset.buyIndex);

            const beat =
                filteredBeats[index];

            if (beat) {
                openBuy(beat);
            }

            return;
        }


        /* =========================
           CLICK CARD = PLAY
        ========================= */

        // CLICK CARD = PLAY / PAUSE
const card =
    e.target.closest(".beat-card");

if (!card) return;

const index =
    Number(card.dataset.index);

const beat =
    filteredBeats[index];

if (!beat) return;


// CARD HIỆN TẠI
if (index === selectedIndex) {

    // đang pause -> phát -> tính 1 click
    if (audio.paused) {
        playAudio();
        countBeatClick(beat);
    }

    // đang phát -> pause -> KHÔNG tính click
    else {
        pauseAudio();
    }

}

// CARD KHÁC
else {

    // chọn beat khác + phát luôn
    selectBeat(index, true);

    // vì có phát -> tính 1 click
    countBeatClick(beat);
}

    });

}


  /* =========================
     SEARCH
  ========================= */
  let activeTag = "all";

const trackSearch = $("#trackSearch");

function applyBeatFilter() {

  const keyword =
    trackSearch
      ? trackSearch.value.trim().toLowerCase()
      : "";

  filteredBeats = beats.filter(b => {

    const title =
      String(b.title || "").toLowerCase();

    const artist =
      String(b.artist || "").toLowerCase();

    const genre =
      String(b.genre || "").toLowerCase();

    const bpm =
      String(b.bpm || "").toLowerCase();

    const key =
      String(b.key || "").toLowerCase();


    // SEARCH
    const matchSearch =
      !keyword ||
      title.includes(keyword) ||
      artist.includes(keyword) ||
      genre.includes(keyword) ||
      bpm.includes(keyword) ||
      key.includes(keyword);


    // TAG
    const matchTag =
      activeTag === "all" ||
      genre.includes(activeTag);


    return matchSearch && matchTag;
  });

  const beatCount = $("#beatCount");
    if (beatCount) {
  beatCount.textContent = filteredBeats.length;
}
  selectedIndex = 0;


  if (audio) {
    audio.pause();
    isPlaying = false;
  }


  renderTracks();


  if (filteredBeats.length) {

    selectBeat(0, false);

  } else {

    clearPanel();

  }
}


if (trackSearch) {

  trackSearch.addEventListener(
    "input",
    applyBeatFilter
  );

}

document.addEventListener("click", e => {

  const tagBtn =
    e.target.closest(".beat-tag");

  if (!tagBtn) return;


  activeTag =
    tagBtn.dataset.tag.toLowerCase();


  document
    .querySelectorAll(".beat-tag")
    .forEach(btn => {
      btn.classList.remove("active");
    });


  tagBtn.classList.add("active");


  applyBeatFilter();

});
  /* =========================
     PREVIOUS
  ========================= */

  const prevBtn = $("#prevBtn");

  if (prevBtn) {

    prevBtn.addEventListener("click", () => {

      if (!filteredBeats.length) return;

      selectBeat(selectedIndex - 1, true);

    });
  }


  /* =========================
     NEXT
  ========================= */

  const nextBtn = $("#nextBtn");

  if (nextBtn) {

    nextBtn.addEventListener("click", () => {

      if (!filteredBeats.length) return;

      selectBeat(selectedIndex + 1, true);

    });
  }


  /* =========================
     MAIN PLAY BUTTON
  ========================= */

  const playBtn = $("#playBtn");

  if (playBtn) {

    playBtn.addEventListener("click", () => {

      togglePlay();

    });
  }


  /* =========================
     PANEL PLAY
  ========================= */

  const panelPlay = $("#panelPlay");

  if (panelPlay) {

    panelPlay.addEventListener("click", () => {

      togglePlay();

    });
  }


  /* =========================
     BUY MODAL
  ========================= */

  function openBuy(beat) {

    if (!beat) return;

    const old =
      $("#inozeBuyModal");

    if (old) {
      old.remove();
    }

    const wrap =
      document.createElement("div");

    wrap.id =
      "inozeBuyModal";

    wrap.style.cssText = `
      position:fixed;
      inset:0;
      background:#000b;
      z-index:99999;
      display:grid;
      place-items:center;
      padding:20px;
    `;

    wrap.innerHTML = `

      <div style="
        width:min(520px,100%);
        max-height:90vh;
        overflow:auto;
        background:#0d1118;
        color:#fff;
        border:1px solid #263142;
        border-radius:18px;
        padding:24px;
        font-family:Arial,sans-serif;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
        ">

          <h2 style="margin:0">
            Mua beat — ${esc(beat.title)}
          </h2>

          <button
            id="buyClose"
            type="button"
            style="
              background:none;
              border:0;
              color:#fff;
              font-size:26px;
              cursor:pointer;
            "
          >
            ×
          </button>

        </div>


        <p style="
          color:#9aa5b5;
          margin-top:10px;
        ">
          ${esc(beat.artist || "INOZE")}
          ${beat.bpm ? ` · ${beat.bpm} BPM` : ""}
          ${beat.key ? ` · ${esc(beat.key)}` : ""}
          ${beat.genre ? ` · ${esc(beat.genre)}` : ""}
        </p>


        <form id="buyForm">

          <label>
            License

            <select
              name="license"
              required
              style="width:100%;margin:6px 0 14px;padding:10px;"
            >

              <option
                value="MP3"
                data-price="${Number(beat.price || 0)}"
              >
                MP3 — ${money(beat.price)}
              </option>

            </select>

          </label>


          <label>
            Họ tên

            <input
              name="name"
              required
              style="width:100%;margin:6px 0 14px;padding:10px;"
            >

          </label>


          <label>
            Email

            <input
              name="email"
              type="email"
              required
              style="width:100%;margin:6px 0 14px;padding:10px;"
            >

          </label>


          <label>
            Số điện thoại

            <input
              name="phone"
              style="width:100%;margin:6px 0 14px;padding:10px;"
            >

          </label>


          <label>
            Ghi chú

            <textarea
              name="note"
              rows="4"
              style="width:100%;margin:6px 0 14px;padding:10px;"
            ></textarea>

          </label>


          <button
            type="submit"
            style="
              width:100%;
              padding:13px;
              border:0;
              border-radius:10px;
              background:#d7ff3f;
              font-weight:800;
              cursor:pointer;
            "
          >
            GỬI YÊU CẦU MUA
          </button>

        </form>

      </div>
    `;

    document.body.appendChild(wrap);


    /* CLOSE */

    const closeBtn =
      $("#buyClose");

    if (closeBtn) {

      closeBtn.addEventListener(
        "click",
        () => wrap.remove()
      );

    }


    /* CLICK OUTSIDE */

    wrap.addEventListener("click", e => {

      if (e.target === wrap) {
        wrap.remove();
      }

    });


    /* SUBMIT */

    const form =
      $("#buyForm");

    if (form) {

      form.addEventListener(
        "submit",
        async e => {

          e.preventDefault();

          const f =
            new FormData(form);

          const opt =
            form.license.selectedOptions[0];

          const submitBtn =
            form.querySelector(
              'button[type="submit"]'
            );

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent =
              "ĐANG GỬI...";
          }


          const payload = {

            beat_id:
              beat.id,

            beat_title:
              beat.title,

            license:
              f.get("license"),

            price:
              Number(
                opt.dataset.price
              ),

            customer_name:
              f.get("name"),

            customer_email:
              f.get("email"),

            customer_phone:
              f.get("phone"),

            note:
              f.get("note")

          };


          const { error } =
            await db
              .from("orders")
              .insert(payload);


          if (error) {

            console.error(
              "INOZE order:",
              error
            );

            alert(
              "Không gửi được yêu cầu. Vui lòng thử lại."
            );

            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent =
                "GỬI YÊU CẦU MUA";
            }

            return;
          }


          alert(
            "Đã gửi yêu cầu. Mình sẽ liên hệ bạn sớm."
          );

          wrap.remove();

        }
      );
    }
  }


  /* =========================
     BUY BUTTONS
  ========================= */

  $$(".btn-buy, #buyBtn").forEach(btn => {

    btn.addEventListener("click", () => {

      const beat =
        filteredBeats[selectedIndex];

      if (beat) {
        openBuy(beat);
      }

    });

  });


  /* =========================
     CONTACT FORM
  ========================= */

  const contact =
    document.querySelector(
      ".form-box form"
    );

  if (contact) {

    contact.addEventListener(
      "submit",
      async e => {

        e.preventDefault();

        const inputs =
          contact.querySelectorAll(
            "input,select,textarea"
          );

        const payload = {

          name:
            inputs[0]?.value || "",

          email:
            inputs[1]?.value || "",

          project_type:
            inputs[2]?.value || "",

          genre:
            inputs[3]?.value || "",

          bpm:
            inputs[4]?.value
              ? Number(inputs[4].value)
              : null,

          message:
            inputs[5]?.value || ""

        };


        const { error } =
          await db
            .from("messages")
            .insert(payload);


        if (error) {

          console.error(
            "INOZE message:",
            error
          );

          alert(
            "Không gửi được yêu cầu. Vui lòng thử lại."
          );

          return;
        }


        contact.reset();

        alert(
          "Đã gửi yêu cầu thành công."
        );

      }
    );
  }

  async function countBeatClick(beat) {

    if (!beat?.id) return;

    const { data, error } = await db.rpc(
        "increment_beat_click",
        {
            beat_uuid: beat.id
        }
    );

    if (error) {

        console.error(
            "Không lưu được lượt click:",
            error
        );

        return;
    }

    // data chính là số click mới lấy từ database
    beat.clicks = Number(data || 0);

    document
        .querySelectorAll(
            `[id="click-${beat.id}"]`
        )
        .forEach(el => {

            el.textContent =
                beat.clicks.toLocaleString("vi-VN");

        });
}

  /* =========================
     START
  ========================= */

  await loadBeats();

})();

const licenseTerms = {
    "MP3": {
        title: "MP3 License Terms",
        items: [
            "Unlimited usage.",
            "Non-exclusive license.",
            "Được sử dụng beat cho sản phẩm âm nhạc của bạn.",
            "Được phát hành trên YouTube, Spotify, TikTok và các nền tảng khác.",
            "Không được phép kiếm tiền từ sản phẩm âm nhạc.",
            "Không được bán lại hoặc phân phối riêng file beat.",
            "Không được tuyên bố độc quyền quyền sở hữu beat."
        ]
    }
};
function openTerms(license) {

  const old = document.querySelector("#inozeTermsModal");
  if (old) old.remove();

  const data = licenseTerms[license];

  if (!data) return;

  const modal = document.createElement("div");

  modal.id = "inozeTermsModal";

  modal.innerHTML = `
    <div class="terms-overlay">

      <div class="terms-modal">

        <button class="terms-close" type="button">
          ×
        </button>

        <div class="terms-header">
          <div class="terms-label">LICENSE</div>
          <h2>${data.title}</h2>
        </div>

        <div class="terms-list">

          ${data.items.map(item => `
            <div class="terms-item">
              <span class="terms-check">✓</span>
              <span>${item}</span>
            </div>
          `).join("")}

        </div>

        <button class="terms-done" type="button">
          Đã hiểu
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".terms-close").onclick = () => {
    modal.remove();
  };

  modal.querySelector(".terms-done").onclick = () => {
    modal.remove();
  };

  modal.querySelector(".terms-overlay").addEventListener("click", e => {
    if (e.target.classList.contains("terms-overlay")) {
      modal.remove();
    }
  });
}


// Gắn sự kiện cho View Terms
document.addEventListener("click", e => {

  const btn = e.target.closest(".terms-btn");

  if (!btn) return;

  const license = btn.dataset.license;

  openTerms(license);
});

