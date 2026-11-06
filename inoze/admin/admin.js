const { createClient } = supabase;

const db = createClient(
  INOZE_CONFIG.SUPABASE_URL,
  INOZE_CONFIG.SUPABASE_ANON_KEY
);

const $ = s => document.querySelector(s);

const money = n =>
  new Intl.NumberFormat("vi-VN").format(n) + "đ";

let editing = null;
let currentAudioUrl = "";
let currentCoverUrl = "";
const BEATS_PER_PAGE = 8;

let beatPage = 1;

let allBeats = [];

let beatSearch = "";

/* =========================
   LOGIN
========================= */

$("#loginForm").onsubmit = async e => {
  e.preventDefault();

  const { error } = await db.auth.signInWithPassword({
    email: $("#email").value,
    password: $("#password").value
  });

  if (error) {
    $("#loginError").textContent = error.message;
  } else {
    init();
  }
};


/* =========================
   LOGOUT
========================= */

$("#logout").onclick = async () => {
  await db.auth.signOut();
  location.reload();
};


/* =========================
   SESSION
========================= */

db.auth.getSession().then(({ data }) => {
  if (data.session) init();
});


async function init() {
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");

  loadAll();
}


/* =========================
   PAGE NAVIGATION
========================= */

document
  .querySelectorAll("aside button[data-page]")
  .forEach(b => {

    b.onclick = () => {

      document
        .querySelectorAll(".page")
        .forEach(x => x.classList.add("hidden"));

      $("#" + b.dataset.page).classList.remove("hidden");

      $("#title").textContent = {
        dash: "Tổng quan",
        beats: "Beats",
        orders: "Đơn hàng",
        messages: "Yêu cầu"
      }[b.dataset.page];

      loadAll();
    };

  });


/* =========================
   LOAD DATA
========================= */

async function loadAll() {

  const [
    { data: beats },
    orders,
    messages
  ] = await Promise.all([

    db
      .from("beats")
      .select("*")
      .order("created_at", {
        ascending: false
      }),

    db
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false
      }),

    db
      .from("messages")
      .select("*")
      .order("created_at", {
        ascending: false
      })

  ]);

  render(
    beats || [],
    orders.data || [],
    messages.data || []
  );
}


/* =========================
   RENDER
========================= */

function render(bs, os, ms) {

  $("#sBeats").textContent =
    bs.length;

  $("#sOrders").textContent =
    os.length;

  $("#sMessages").textContent =
    ms.length;

  $("#sActive").textContent =
    bs.filter(
      x => x.status === "active"
    ).length;


  /*
     lưu toàn bộ beat
  */
  allBeats = bs;

  window.beatsCache = bs;


  /*
     5 beat mới nhất dashboard
  */
  $("#recent").innerHTML =
    tableBeats(
      bs.slice(0, 5)
    );


  /*
     bảng Beats có pagination
  */
  renderBeatPage();


  $("#orderTable").innerHTML =
    tableOrders(os);

  $("#messageTable").innerHTML =
    tableMessages(ms);

}


/* =========================
   BEAT TABLE
========================= */

function tableBeats(bs){
  

  return `<table class="table">
    <tr>
      <th>BEAT</th>
      <th>BPM/KEY</th>
      <th>GIÁ</th>
      <th>STATUS</th>
      <th>PREVIEW</th>
      <th></th>
    </tr>

    ${bs.map(b => `
      <tr>
        <td>
  <div class="beat-admin-info">

    ${
      b.cover_url
        ? `<img
            src="${b.cover_url}"
            class="beat-admin-avatar"
            alt=""
          >`
        : `<div class="beat-admin-avatar no-cover">♪</div>`
    }

    <div>
      <b>${b.title}</b><br>
      <span class="muted">
        ${b.artist || "INOZE"}
      </span>
    </div>

  </div>
</td>

        <td>
          ${[
            b.bpm ? `${b.bpm} BPM` : null,
            b.key || null
          ].filter(Boolean).join(" · ") || "—"}
        </td>

        <td>${money(b.price)}</td>

        <td>
          <span class="tag">${b.status}</span>
        </td>

        <td>
          ${
            b.audio_url
              ? `
                <div class="audio-preview">
                  <button
                    class="play-btn"
                    id="play-${b.id}"
                    onclick="playBeat('${b.id}')"
                  >
                    ▶
                  </button>

                  <div class="audio-info">
                    <div class="audio-time">
                      <span id="current-${b.id}">00:00</span>
                      /
                      <span class="beat-duration" data-duration-id="${b.id}">--:--</span>
                    </div>

                    <input
  type="range"
  id="progress-${b.id}"
  data-progress-id="${b.id}"
  min="0"
  max="100"
  value="0"
  step="0.1"
  oninput="seekBeat('${b.id}', this.value)"
>
                  </div>
                </div>
              `
              : `<span class="muted">Chưa có MP3</span>`
          }
        </td>

        <td class="actions">

  <button onclick="editBeat('${b.id}')">
    Sửa
  </button>

  <button onclick="toggleBeat('${b.id}')">
    ${b.status === "active" ? "Ẩn" : "Hiện"}
  </button>

  <button
    class="danger"
    onclick="deleteBeat('${b.id}')"
  >
    Xóa
  </button>

</td>
      </tr>
    `).join("")}
  </table>`;
}
/* =========================================================
   BEAT LIST - SEARCH + PAGINATION
========================================================= */

function renderBeatPage() {

  const keyword =
    beatSearch
      .trim()
      .toLowerCase();


  /* =========================
     FILTER SEARCH
  ========================= */

  const filtered =
    allBeats.filter(beat => {

      if (!keyword) {
        return true;
      }


      const searchable = [

        beat.title,
        beat.artist,
        beat.genre,
        beat.key,
        beat.bpm

      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


      return searchable.includes(
        keyword
      );

    });


  /* =========================
     PAGE COUNT
  ========================= */

  const totalItems =
    filtered.length;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
        BEATS_PER_PAGE
      )
    );


  /*
     nếu xóa/search làm page hiện tại
     lớn hơn total page
  */
  if (beatPage > totalPages) {
    beatPage = totalPages;
  }


  if (beatPage < 1) {
    beatPage = 1;
  }


  /* =========================
     SLICE CURRENT PAGE
  ========================= */

  const start =
    (beatPage - 1) *
    BEATS_PER_PAGE;


  const end =
    start +
    BEATS_PER_PAGE;


  const pageBeats =
    filtered.slice(
      start,
      end
    );


  /* =========================
     EMPTY
  ========================= */

  if (!pageBeats.length) {

    $("#beatTable").innerHTML = `
      <div class="beats-empty">
        <span>♪</span>
        <p>Không tìm thấy beat phù hợp.</p>
      </div>
    `;

    return;

  }


  /* =========================
     RENDER TABLE
  ========================= */

  $("#beatTable").innerHTML = `

    <div class="beat-table-wrap">

      ${tableBeats(pageBeats)}

    </div>


    <div class="beat-pagination">

      <div class="beat-pagination-info">

        ${start + 1}–${Math.min(end, totalItems)}
        / ${totalItems} beats

      </div>


      <div class="beat-pagination-controls">

        <button
          class="beat-page-arrow"
          onclick="changeBeatPage(${beatPage - 1})"
          ${beatPage === 1 ? "disabled" : ""}
          aria-label="Trang trước"
        >
          ‹
        </button>


        ${renderBeatPageNumbers(
          beatPage,
          totalPages
        )}


        <button
          class="beat-page-arrow"
          onclick="changeBeatPage(${beatPage + 1})"
          ${beatPage === totalPages ? "disabled" : ""}
          aria-label="Trang tiếp"
        >
          ›
        </button>

      </div>

    </div>

  `;


  /*
     chỉ đọc duration của những beat
     đang thực sự được render.

     + thêm 5 beat dashboard.
  */

  const durationBeats =
    [
      ...allBeats.slice(0, 5),
      ...pageBeats
    ];


  const uniqueDurationBeats =
    Array.from(
      new Map(
        durationBeats.map(
          beat => [
            beat.id,
            beat
          ]
        )
      ).values()
    );


  loadBeatDurations(
    uniqueDurationBeats
  );

}



/* =========================================================
   PAGE NUMBERS
========================================================= */

function renderBeatPageNumbers(
  current,
  total
) {

  /*
     ít hơn 7 trang:
     hiện toàn bộ
  */
  if (total <= 7) {

    return Array
      .from(
        {
          length: total
        },
        (_, index) => {

          const page =
            index + 1;


          return `
            <button
              class="beat-page-number
              ${page === current ? "active" : ""}"
              onclick="changeBeatPage(${page})"
            >
              ${page}
            </button>
          `;

        }
      )
      .join("");

  }


  /*
     nhiều trang:
     1 ... 4 5 6 ... 20
  */

  const pages = [];


  pages.push(1);


  if (current > 4) {
    pages.push("...");
  }


  const from =
    Math.max(
      2,
      current - 1
    );


  const to =
    Math.min(
      total - 1,
      current + 1
    );


  for (
    let page = from;
    page <= to;
    page++
  ) {

    pages.push(page);

  }


  if (current < total - 3) {
    pages.push("...");
  }


  pages.push(total);


  return pages
    .map(item => {

      if (item === "...") {

        return `
          <span class="beat-page-dots">
            …
          </span>
        `;

      }


      return `
        <button
          class="beat-page-number
          ${item === current ? "active" : ""}"
          onclick="changeBeatPage(${item})"
        >
          ${item}
        </button>
      `;

    })
    .join("");

}



/* =========================================================
   CHANGE PAGE
========================================================= */

window.changeBeatPage =
  function(page) {

    const filteredCount =
      allBeats.filter(beat => {

        if (!beatSearch.trim()) {
          return true;
        }


        const text = [

          beat.title,
          beat.artist,
          beat.genre,
          beat.key,
          beat.bpm

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        return text.includes(
          beatSearch
            .trim()
            .toLowerCase()
        );

      }).length;


    const totalPages =
      Math.max(
        1,
        Math.ceil(
          filteredCount /
          BEATS_PER_PAGE
        )
      );


    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }


    beatPage = page;


    /*
       đang phát beat thì pause khi chuyển page
       để tránh UI progress nằm ở page cũ
    */
    if (!previewAudio.paused) {
      previewAudio.pause();
    }


    renderBeatPage();


    /*
       cuộn nhẹ về đầu bảng
    */
    const table =
      document.getElementById(
        "beatTable"
      );


    if (table) {

      table.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  };



/* =========================================================
   SEARCH
========================================================= */

const beatSearchInput =
  document.getElementById(
    "search"
  );


if (beatSearchInput) {

  beatSearchInput.addEventListener(
    "input",
    e => {

      beatSearch =
        e.target.value;

      /*
         search mới luôn về page 1
      */
      beatPage = 1;

      renderBeatPage();

    }
  );

}
// =====================================
// LOAD THỜI LƯỢNG MP3 NGAY KHI HIỆN LIST
// =====================================

function loadBeatDurations(beats) {

  beats.forEach(beat => {

    if (!beat.audio_url) return;

    const audio = new Audio();

    audio.preload = "metadata";

    audio.addEventListener("loadedmetadata", () => {

      const duration = formatTime(audio.duration);

      // Có thể có beat xuất hiện ở cả "Beat mới nhất"
      // và bảng Beats nên update tất cả
      document
        .querySelectorAll(
          `[data-duration-id="${beat.id}"]`
        )
        .forEach(el => {
          el.textContent = duration;
        });

      audio.remove();

    });

    audio.addEventListener("error", () => {

      document
        .querySelectorAll(
          `[data-duration-id="${beat.id}"]`
        )
        .forEach(el => {
          el.textContent = "--:--";
        });

      audio.remove();

    });

    audio.src = beat.audio_url;
    audio.load();

  });
}

/* =========================
   ORDERS
========================= */

function tableOrders(a) {

  return a.length
    ? `
      <table class="table">

        <tr>
          <th>KHÁCH</th>
          <th>BEAT</th>
          <th>LICENSE</th>
          <th>GIÁ</th>
          <th>STATUS</th>
        </tr>

        ${a.map(x => `

          <tr>

            <td>
              ${x.customer_name}
              <br>
              <span class="muted">
                ${x.customer_email}
              </span>
            </td>

            <td>${x.beat_title}</td>

            <td>${x.license}</td>

            <td>${money(x.price)}</td>

            <td>
              <span class="tag">
                ${x.status}
              </span>
            </td>

          </tr>

        `).join("")}

      </table>
    `
    : "<p class='muted'>Chưa có đơn.</p>";
}


/* =========================
   MESSAGES
========================= */

function tableMessages(a) {

  return a.length
    ? `
      <table class="table">

        <tr>
          <th>KHÁCH</th>
          <th>LOẠI</th>
          <th>NỘI DUNG</th>
          <th>STATUS</th>
        </tr>

        ${a.map(x => `

          <tr>

            <td>
              ${x.name}
              <br>
              <span class="muted">
                ${x.email}
              </span>
            </td>

            <td>${x.project_type}</td>

            <td>${x.message}</td>

            <td>
              <span class="tag">
                ${x.status}
              </span>
            </td>

          </tr>

        `).join("")}

      </table>
    `
    : "<p class='muted'>Chưa có yêu cầu.</p>";
}


/* =========================
   OPEN MODAL
========================= */

function openModal(b = {}) {

  editing = b.id || null;

  currentAudioUrl = b.audio_url || "";
currentCoverUrl = b.cover_url || "";

  $("#modal").classList.remove("hidden");

  $("#mTitle").textContent =
    editing ? "Sửa beat" : "Thêm beat";

  $("#id").value = b.id || "";

  $("#fTitle").value = b.title || "";

  $("#fArtist").value =
    b.artist || "INOZE";

  $("#fBpm").value =
    b.bpm || "";

  $("#fKey").value =
    b.key || "";

  $("#fGenre").value =
    b.genre || "";

  $("#fPrice").value =
    b.price || "";

 

  $("#fAudioFile").value = "";

  $("#audioName").textContent =
    b.audio_url
      ? "Đã có file MP3 — chọn file mới nếu muốn thay"
      : "Chưa chọn file";

  $("#fDesc").value =
    b.description || "";

  
}


/* =========================
   MODAL BUTTONS
========================= */

$("#newBeat").onclick = () =>
  openModal();

$("#newBeat2").onclick = () =>
  openModal();

$("#close").onclick =
$("#cancel").onclick = () => {

  $("#modal").classList.add("hidden");

};


/* =========================
   FILE NAME PREVIEW
========================= */

$("#fAudioFile").addEventListener(
  "change",
  e => {

    const file = e.target.files[0];

    if (!file) {

      $("#audioName").textContent =
        currentAudioUrl
          ? "Đã có file MP3 — chọn file mới nếu muốn thay"
          : "Chưa chọn file";

      return;
    }

    if (file.type !== "audio/mpeg" &&
        !file.name.toLowerCase().endsWith(".mp3")) {

      alert("Vui lòng chọn file MP3.");

      e.target.value = "";

      return;
    }

    $("#audioName").textContent =
      `File đã chọn: ${file.name}`;

  }
);


/* =========================
   UPLOAD MP3
========================= */

async function uploadMP3(file) {

  if (!file) {
    return currentAudioUrl;
  }

  if (
    file.type !== "audio/mpeg" &&
    !file.name.toLowerCase().endsWith(".mp3")
  ) {

    throw new Error(
      "Chỉ được phép upload file MP3."
    );

  }

  /*
    Tạo tên file riêng để không bị trùng.
  */

  const safeName =
    file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

  const fileName =
    `${crypto.randomUUID()}-${safeName}`;

  const filePath =
    `beats/${fileName}`;


  /*
    Upload lên Supabase Storage
  */

  const { error: uploadError } =
    await db.storage
      .from("beat-previews")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: "audio/mpeg"
        }
      );

  if (uploadError) {
    throw uploadError;
  }


  /*
    Lấy Public URL
  */

  const { data } =
    db.storage
      .from("beat-previews")
      .getPublicUrl(filePath);


  return data.publicUrl;
}


/* =========================
   SAVE BEAT
========================= */

$("#beatForm").onsubmit = async e => {

  e.preventDefault();

  const saveButton = $("#saveBeat");

  saveButton.disabled = true;
  saveButton.textContent = "ĐANG LƯU...";

  try {

    // =========================
    // 1. LẤY FILE MP3
    // =========================

    const audioFile =
      $("#fAudioFile").files[0];

    // Upload MP3 nếu có file mới
    // Nếu sửa beat mà không chọn file mới
    // sẽ giữ lại audio cũ
    const audioUrl =
      await uploadMP3(audioFile);


    // =========================
    // 2. LẤY FILE COVER
    // =========================

    const coverFile =
      $("#fCoverFile").files[0];

    // Upload cover nếu có file mới
    // Nếu sửa beat mà không chọn ảnh mới
    // sẽ giữ lại cover cũ
    const coverUrl =
      await uploadCover(coverFile);


    // =========================
    // 3. TẠO DATA LƯU SUPABASE
    // =========================

    const x = {

      title:
        $("#fTitle").value.trim(),

      artist:
        $("#fArtist").value.trim() || "INOZE",

      bpm:
        $("#fBpm").value
          ? Number($("#fBpm").value)
          : null,

      key:
        $("#fKey").value.trim() || null,

      genre:
        $("#fGenre").value.trim() || null,

      price:
        Number($("#fPrice").value),

      cover_url:
        coverUrl || null,

      audio_url:
        audioUrl || null,

      description:
        $("#fDesc").value.trim() || null,

      status:
        editing
          ? undefined
          : "active"

    };


    // =========================
    // 4. EDIT / ADD
    // =========================

    let r;


    if (editing) {

      // Khi EDIT không gửi status
      // để giữ nguyên active / hidden
      delete x.status;

      r = await db
        .from("beats")
        .update(x)
        .eq("id", editing);

    } else {

      r = await db
        .from("beats")
        .insert(x);

    }


    // =========================
    // 5. CHECK ERROR
    // =========================

    if (r.error) {
      throw r.error;
    }


    // =========================
    // 6. ĐÓNG MODAL + LOAD LẠI
    // =========================

    $("#modal").classList.add("hidden");

    await loadAll();


  } catch (error) {

    console.error(error);

    alert(
      "Không lưu được beat:\n" +
      error.message
    );


  } finally {

    saveButton.disabled = false;
    saveButton.textContent = "Lưu";

  }

};


/* =========================
   EDIT
========================= */

window.editBeat = async id => {

  const { data, error } =
    await db
      .from("beats")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {

    alert(error.message);

    return;

  }

  openModal(data);

};


/* =========================
   TOGGLE STATUS
========================= */

window.toggleBeat = async id => {

  const { data, error } =
    await db
      .from("beats")
      .select("status")
      .eq("id", id)
      .single();

  if (error) {

    alert(error.message);

    return;

  }

  await db
    .from("beats")
    .update({
      status:
        data.status === "active"
          ? "hidden"
          : "active"
    })
    .eq("id", id);

  loadAll();

};
/* =========================
   DELETE BEAT
========================= */

window.deleteBeat = async id => {

  const beat =
    window.beatsCache?.find(
      b => b.id === id
    );

  if (!beat) {
    alert("Không tìm thấy beat.");
    return;
  }


  const ok = confirm(
    `Bạn có chắc muốn xóa beat "${beat.title}" không?\n\n` +
    `Hành động này sẽ xóa beat khỏi danh sách.`
  );

  if (!ok) return;


  try {

    const { error } =
      await db
        .from("beats")
        .delete()
        .eq("id", id);


    if (error) {
      throw error;
    }


    alert("Đã xóa beat.");


    // Load lại danh sách
    await loadAll();


  } catch (error) {

    console.error(error);

    alert(
      "Không xóa được beat:\n" +
      error.message
    );

  }

};
// =====================================
// AUDIO PREVIEW PLAYER
// =====================================

const previewAudio = new Audio();
previewAudio.preload = "metadata";

let currentBeatId = null;


// Format giây → 00:00
function formatTime(seconds) {
  if (!isFinite(seconds)) return "00:00";

  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}


// Phát / Pause
window.playBeat = async function(id) {

  const beat = window.beatsCache?.find(b => b.id === id);

  if (!beat || !beat.audio_url) {
    alert("Beat này chưa có file MP3.");
    return;
  }


  // Nếu đang bấm lại beat hiện tại
  if (currentBeatId === id) {

    if (previewAudio.paused) {

      try {
        await previewAudio.play();
      } catch (err) {
        console.error(err);
      }

    } else {

      previewAudio.pause();

    }

    updatePlayButton();

    return;
  }


  // Beat mới
  currentBeatId = id;

  previewAudio.src = beat.audio_url;
  previewAudio.currentTime = 0;


  // Reset UI
  document.querySelectorAll('[id^="progress-"]').forEach(x => {
    x.value = 0;
  });

  document.querySelectorAll('[id^="current-"]').forEach(x => {
    x.textContent = "00:00";
  });


  try {

    await previewAudio.play();

    updatePlayButton();

  } catch (err) {

    console.error("Không thể phát MP3:", err);

    alert("Không thể phát file MP3.");

  }
};


// Update nút Play/Pause
function updatePlayButton() {

  if (!currentBeatId) return;

  const btn = document.getElementById(`play-${currentBeatId}`);

  if (!btn) return;

  btn.textContent = previewAudio.paused ? "▶" : "⏸";
}


// Khi load được thời lượng
previewAudio.addEventListener("loadedmetadata", () => {

  if (!currentBeatId) return;

  const duration = document.getElementById(
    `duration-${currentBeatId}`
  );

  if (duration) {
    duration.textContent = formatTime(previewAudio.duration);
  }

});


// Khi đang phát
previewAudio.addEventListener("timeupdate", () => {

  if (!currentBeatId) return;


  const current = document.getElementById(
    `current-${currentBeatId}`
  );

  const progress = document.getElementById(
    `progress-${currentBeatId}`
  );


  if (current) {
    current.textContent = formatTime(
      previewAudio.currentTime
    );
  }


  if (progress && previewAudio.duration) {

    progress.value =
      (previewAudio.currentTime / previewAudio.duration) * 100;

  }

});


// Bấm Pause
previewAudio.addEventListener("pause", () => {
  updatePlayButton();
});


// Bấm Play
previewAudio.addEventListener("play", () => {
  updatePlayButton();
});


// Hết bài
previewAudio.addEventListener("ended", () => {

  if (!currentBeatId) return;


  const progress = document.getElementById(
    `progress-${currentBeatId}`
  );

  const current = document.getElementById(
    `current-${currentBeatId}`
  );


  if (progress) {
    progress.value = 0;
  }


  if (current) {
    current.textContent = "00:00";
  }


  updatePlayButton();

});


// Tua bài
window.seekBeat = function(id, value) {

  if (currentBeatId !== id) return;

  if (!previewAudio.duration) return;


  previewAudio.currentTime =
    (Number(value) / 100) * previewAudio.duration;
};
async function uploadCover(file) {
  if (!file) return currentCoverUrl || "";

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowed.includes(file.type)) {
    throw new Error("Chỉ hỗ trợ JPG, PNG hoặc WEBP.");
  }

  const ext = file.name.split(".").pop().toLowerCase();

  const fileName =
    `${crypto.randomUUID()}.${ext}`;

  const filePath =
    `covers/${fileName}`;

  const { error } =
    await db.storage
      .from("beat-covers")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        }
      );

  if (error) throw error;

  const { data } =
    db.storage
      .from("beat-covers")
      .getPublicUrl(filePath);

  return data.publicUrl;
}