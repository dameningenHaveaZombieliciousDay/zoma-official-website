const progress = document.querySelector(".page-progress");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${amount}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});



// ========================================
// VISUAL SLIDER
// ビジュアル作品の自動スライド機能
// 3枚ずつまとめて切り替える
// ========================================

// スライダーに必要なHTML要素を取得
const visualTrack = document.querySelector(".visual-track");
const visualSlides = document.querySelectorAll(".visual-slide");
const visualPrev = document.querySelector(".visual-prev");
const visualNext = document.querySelector(".visual-next");
const visualCounter = document.querySelector(".visual-counter");

// 現在表示しているページ番号
let visualIndex = 0;

// 作品の総数
const visualTotal = visualSlides.length;

// 一度に表示する枚数
const visualPerPage = 3;

// 全ページ数（6枚なら2ページ）
const visualPageTotal = Math.ceil(visualTotal / visualPerPage);


// スライドを切り替える関数
function moveVisual() {

  // 1枚分の幅と隙間を計算
  const slideWidth = visualSlides[0].getBoundingClientRect().width;
  const slideGap = parseFloat(getComputedStyle(visualTrack).gap) || 0;

  // 3枚分まとめて移動する距離を計算
  const moveDistance =
    visualIndex * visualPerPage * (slideWidth + slideGap);

  // 現在のページに合わせて横へ移動
  visualTrack.style.transform =
    `translateX(-${moveDistance}px)`;

  // 現在のページ番号を表示
  visualCounter.textContent =
    `${String(visualIndex + 1).padStart(2, "0")} / ${String(visualPageTotal).padStart(2, "0")}`;
}


// 次の3枚へ
function nextVisual() {
  visualIndex = (visualIndex + 1) % visualPageTotal;
  moveVisual();
}


// 前の3枚へ
function prevVisual() {
  visualIndex = (visualIndex - 1 + visualPageTotal) % visualPageTotal;
  moveVisual();
}


// ボタン操作
visualNext.addEventListener("click", nextVisual);
visualPrev.addEventListener("click", prevVisual);


// 5秒ごとに自動で次のページへ
let visualTimer = setInterval(nextVisual, 5000);


// 画面サイズが変わったら位置を再計算
window.addEventListener("resize", moveVisual);


// 初期表示
moveVisual();

/* ---------------------------------------------------------
   ENTRANCE COUNTER（入室耐久カウンター）
   --------------------------------------------------------- */

// 現在のカウント数を保存する変数
let entranceCount = Number(
  localStorage.getItem("zoma-entrance-count")
) || 0;

// HTMLから表示・操作用の要素を取得
const entranceDisplay = document.getElementById("entrance-count");
const entrancePlus = document.getElementById("entrance-plus");
const entranceMinus = document.getElementById("entrance-minus");
const entranceReset = document.getElementById("entrance-reset");

// 数字を画面に反映する関数
function updateEntranceCount() {

  // 数字を表示
  entranceDisplay.textContent = entranceCount;

  // ブラウザに数字を保存
  localStorage.setItem(
    "zoma-entrance-count",
    entranceCount
  );

}

// ＋1ボタン：人数を1人増やす
entrancePlus.addEventListener("click", function() {
  entranceCount++;
  updateEntranceCount();
});

// −1ボタン：人数を1人減らす（0未満にはしない）
entranceMinus.addEventListener("click", function() {
  entranceCount = Math.max(0, entranceCount - 1);
  updateEntranceCount();
});

// RESETボタン：人数を0人に戻す
entranceReset.addEventListener("click", function() {
  entranceCount = 0;
  updateEntranceCount();
});

// ページを開いたときに保存済みの数字を表示
updateEntranceCount();


/* =========================================================
   PREFECTURE COUNTER（都道府県耐久カウンター）
   47都道府県の回答人数・合計人数・進捗を管理する
========================================================= */

// ---------------------------------------------------------
// 1. 都道府県データ
// 47都道府県の名前を登録
// ---------------------------------------------------------

const prefectureNames = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県",
  "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県",
  "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県",
  "山梨県", "長野県", "岐阜県", "静岡県",
  "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県",
  "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県",
  "大分県", "宮崎県", "鹿児島県", "沖縄県"
];


// ---------------------------------------------------------
// 2. HTML要素の取得
// 画面上の入力欄・数字・一覧などを取得する
// ---------------------------------------------------------

const prefectureSelect =
  document.getElementById("prefecture-select");

const prefectureAddButton =
  document.getElementById("prefecture-add");

const prefectureCompleted =
  document.getElementById("prefecture-completed");

const prefectureTotal =
  document.getElementById("prefecture-total");

const prefectureList =
  document.getElementById("prefecture-list");

const prefectureReset =
  document.getElementById("prefecture-reset");


// ---------------------------------------------------------
// 3. 回答人数データの読み込み
// ブラウザに保存されている記録を読み込む
// ---------------------------------------------------------

const prefectureStorageKey = "zoma-prefecture-counts";

let prefectureCounts = {};

try {
  const savedPrefectureCounts =
    JSON.parse(localStorage.getItem(prefectureStorageKey));

  if (
    savedPrefectureCounts &&
    typeof savedPrefectureCounts === "object" &&
    !Array.isArray(savedPrefectureCounts)
  ) {
    prefectureNames.forEach(function(name) {
      const savedCount = savedPrefectureCounts[name];

      // 0以上の整数として読み込む
      prefectureCounts[name] =
        Number.isSafeInteger(savedCount) && savedCount >= 0
          ? savedCount
          : 0;
    });
  }

} catch (error) {

  // 保存データが壊れている場合は0人から開始
  console.warn("都道府県データを読み込めませんでした。");

}

// 初回起動時にデータが存在しない場合も0人にする
prefectureNames.forEach(function(name) {

  if (prefectureCounts[name] === undefined) {
    prefectureCounts[name] = 0;
  }

});


// ---------------------------------------------------------
// 4. データ保存
// 現在の47都道府県の人数をブラウザに保存する
// ---------------------------------------------------------

function savePrefectureCounts() {

  localStorage.setItem(
    prefectureStorageKey,
    JSON.stringify(prefectureCounts)
  );

}


// ---------------------------------------------------------
// 5. 合計人数の計算
// 47都道府県の回答人数をすべて足す
// ---------------------------------------------------------

function calculatePrefectureTotal() {

  return prefectureNames.reduce(function(total, name) {

    return total + prefectureCounts[name];

  }, 0);

}


// ---------------------------------------------------------
// 6. 回答済み都道府県数の計算
// 1人以上回答があった県だけを数える
// ---------------------------------------------------------

function calculatePrefectureCompleted() {

  return prefectureNames.filter(function(name) {

    return prefectureCounts[name] > 0;

  }).length;

}


// ---------------------------------------------------------
// 7. 都道府県一覧の表示
// 47都道府県と回答人数を画面に表示する
// ---------------------------------------------------------

function renderPrefectureList() {

  prefectureList.innerHTML = "";

  prefectureNames.forEach(function(name) {

    // 県ごとの表示カードを作成
    const item = document.createElement("div");

    item.className = "prefecture-item";

    // 県名
    const nameLabel = document.createElement("span");

    nameLabel.className = "prefecture-item-name";
    nameLabel.textContent = name;

    // 回答人数
    const countLabel = document.createElement("span");

    countLabel.className = "prefecture-item-count";
    countLabel.textContent = prefectureCounts[name] + "人";

    // 操作ボタン
    const buttons = document.createElement("div");

    buttons.className = "prefecture-item-buttons";

    // −1人ボタン
    const minusButton = document.createElement("button");

    minusButton.type = "button";
    minusButton.textContent = "−";
    minusButton.setAttribute("aria-label", name + "を1人減らす");

    minusButton.disabled = prefectureCounts[name] === 0;

    minusButton.addEventListener("click", function() {

      changePrefectureCount(name, -1);

    });

    // ＋1人ボタン
    const plusButton = document.createElement("button");

    plusButton.type = "button";
    plusButton.textContent = "+";
    plusButton.setAttribute("aria-label", name + "を1人増やす");

    plusButton.addEventListener("click", function() {

      changePrefectureCount(name, 1);

    });

    // 要素を組み立てる
    buttons.appendChild(minusButton);
    buttons.appendChild(plusButton);

    item.appendChild(nameLabel);
    item.appendChild(countLabel);
    item.appendChild(buttons);

    prefectureList.appendChild(item);

  });

}


// ---------------------------------------------------------
// 8. 人数変更
// 指定した県の回答人数を増減する
// ---------------------------------------------------------

function changePrefectureCount(name, amount) {

  if (!prefectureNames.includes(name)) {
    return;
  }

  const nextCount = prefectureCounts[name] + amount;

  // 0人未満にはしない
  prefectureCounts[name] = Math.max(0, nextCount);

  updatePrefectureDisplay();

}


// ---------------------------------------------------------
// 9. 画面の更新
// 合計人数・回答済み県数・一覧をまとめて更新
// ---------------------------------------------------------

function updatePrefectureDisplay() {

  // 回答済み都道府県数
  prefectureCompleted.textContent =
    calculatePrefectureCompleted();

  // 回答者の合計人数
  prefectureTotal.textContent =
    calculatePrefectureTotal();

  // 47都道府県の一覧
  renderPrefectureList();

  // データを保存
  savePrefectureCounts();

// 地図の色も最新の回答状況に更新
updatePrefectureMap();

}


// ---------------------------------------------------------
// 10. ＋1人ボタン
// 選択した都道府県の人数を1人増やす
// ---------------------------------------------------------

prefectureAddButton.addEventListener("click", function() {

  const selectedName = prefectureSelect.value;

  // 選択されていない場合は何もしない
  if (!selectedName) {
    return;
  }

  changePrefectureCount(selectedName, 1);

});


// ---------------------------------------------------------
// 11. 全体リセット
// 47都道府県の回答人数をすべて0人に戻す
// ---------------------------------------------------------

prefectureReset.addEventListener("click", function() {

  const shouldReset = confirm(
    "47都道府県の回答記録をすべてリセットしますか？"
  );

  if (!shouldReset) {
    return;
  }

  prefectureNames.forEach(function(name) {

    prefectureCounts[name] = 0;

  });

  updatePrefectureDisplay();

});


// ---------------------------------------------------------
// 12. 初期表示
// ページを開いたときに保存データを画面に反映
// ---------------------------------------------------------

updatePrefectureDisplay();


/* =========================================================
   JAPAN MAP（日本地図の色分け）
   回答があった都道府県を緑色に変更する
========================================================= */

// ---------------------------------------------------------
// 1. 地図を読み込む
// images/map 内のSVGファイルを取得して表示する
// ---------------------------------------------------------

async function loadJapanMap() {

  const japanMap = document.getElementById("japan-map");

  try {

    const response = await fetch(
      "images/map/deformed-japan-prefecture-map.svg"
    );

    // ファイルが見つからない場合はエラーにする
    if (!response.ok) {
      throw new Error("日本地図のファイルを読み込めませんでした。");
    }

    // SVGの中身を文字列として取得
    const svgText = await response.text();

    // HTML内に地図を表示
    japanMap.innerHTML = svgText;

    // 読み込み後、都道府県の色を更新
    updatePrefectureMap();

  } catch (error) {

    console.error("日本地図の読み込みエラー:", error);

    japanMap.innerHTML =
      "<p>地図を読み込めませんでした。ファイルの場所を確認してください。</p>";

  }

}


// ---------------------------------------------------------
// 2. 地図の色を更新
// 回答人数が1人以上の県を緑色にする
// ---------------------------------------------------------

function updatePrefectureMap() {

  const japanMap = document.getElementById("japan-map");

  // SVG内の都道府県ごとの図形を取得
  const prefectureShapes =
    japanMap.querySelectorAll("[data-name]");

  prefectureShapes.forEach(function(shape) {

    // SVGに登録されている都道府県名
    const name = shape.getAttribute("data-name");

    // 回答人数が1人以上なら緑色にする
    if (
      prefectureNames.includes(name) &&
      prefectureCounts[name] > 0
    ) {

      shape.classList.add("prefecture-shape");
      shape.classList.add("answered");

    } else if (prefectureNames.includes(name)) {

      // 回答が0人なら白色に戻す
      shape.classList.add("prefecture-shape");
      shape.classList.remove("answered");

    }

  });

}


// ---------------------------------------------------------
// 3. 地図の読み込みを開始
// ページを開いたときに一度だけ実行する
// ---------------------------------------------------------

loadJapanMap();


/* ======================================
   BUDGET DICE（予算ダイスカウンター）
   配信内で出た硬貨の回数と合計金額を記録
====================================== */

// 硬貨の種類と金額を定義
// 左側の数字が硬貨の金額、右側が記録回数
const diceCoins = [1, 5, 10, 50, 100, 500];

// ブラウザ保存用のキー
const diceStorageKey = "zoma-budget-dice";

// 各硬貨の記録回数を入れるオブジェクト
let diceCounts = {};

// 保存されている記録を読み込む
try {
  const savedDiceCounts = JSON.parse(
    localStorage.getItem(diceStorageKey)
  );

  diceCoins.forEach(function(coin) {
    const savedCount = savedDiceCounts?.[coin];

    // 0以上の安全な整数だけ読み込む
    diceCounts[coin] =
      Number.isSafeInteger(savedCount) && savedCount >= 0
        ? savedCount
        : 0;
  });

} catch (error) {
  console.warn("予算ダイスの保存データを読み込めませんでした。", error);

  // 読み込みに失敗した場合はすべて0にする
  diceCoins.forEach(function(coin) {
    diceCounts[coin] = 0;
  });
}

// 画面の表示を更新する関数
function updateDiceDisplay() {

  let totalAmount = 0;
  let totalRolls = 0;

  // 6種類の硬貨を順番に集計
  diceCoins.forEach(function(coin) {

    // 硬貨ごとの回数を画面に表示
    const countDisplay = document.getElementById(
      "dice-count-" + coin
    );

    if (countDisplay) {
      countDisplay.textContent = diceCounts[coin];
    }

    // 金額と回数を合計
    totalAmount += coin * diceCounts[coin];
    totalRolls += diceCounts[coin];

  });

  // 合計金額を表示
  document.getElementById("dice-total").textContent =
    totalAmount.toLocaleString("ja-JP") + "円";

  // 総出目回数を表示
  document.getElementById("dice-roll-total").textContent =
    totalRolls + "回";

  // 現在の記録をブラウザに保存
  localStorage.setItem(
    diceStorageKey,
    JSON.stringify(diceCounts)
  );
}

// 硬貨の＋／−ボタンを取得
const diceButtons = document.querySelectorAll(
  ".dice-count-item button"
);

// 各ボタンにクリック処理を設定
diceButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    // 対象の硬貨金額を取得
    const coin = Number(button.dataset.coin);

    // ＋か−かを取得
    const action = button.dataset.action;

    // 登録されていない硬貨は処理しない
    if (!diceCoins.includes(coin)) return;

    // ＋なら1回追加
    if (action === "plus") {
      diceCounts[coin]++;
    }

    // −なら1回減らす（0未満にはしない）
    if (action === "minus") {
      diceCounts[coin] = Math.max(
        0,
        diceCounts[coin] - 1
      );
    }

    // 画面と保存データを更新
    updateDiceDisplay();

  });

});

// RESETボタンを取得
const diceReset = document.getElementById("dice-reset");

// 全記録をリセット
diceReset.addEventListener("click", function() {

  // 確認メッセージを表示
  const shouldReset = confirm(
    "予算ダイスの記録をすべてリセットしますか？"
  );

  // キャンセルされたら何もしない
  if (!shouldReset) return;

  // すべての硬貨の回数を0に戻す
  diceCoins.forEach(function(coin) {
    diceCounts[coin] = 0;
  });

  // 表示と保存データを更新
  updateDiceDisplay();

});

// ページを開いたときに保存データを画面へ反映
updateDiceDisplay();

/* ======================================
   ZODIAC COUNTER（星座耐久カウンター）
   12星座ごとの回答人数を記録・集計
====================================== */

// 12星座の識別名
// HTML側の data-zodiac と対応させる
const zodiacSigns = [
  "aries",       // 牡羊座
  "taurus",      // 牡牛座
  "gemini",      // 双子座
  "cancer",      // 蟹座
  "leo",         // 獅子座
  "virgo",       // 乙女座
  "libra",       // 天秤座
  "scorpio",     // 蠍座
  "sagittarius", // 射手座
  "capricorn",   // 山羊座
  "aquarius",    // 水瓶座
  "pisces"       // 魚座
];

// ブラウザ保存用のキー
const zodiacStorageKey = "zoma-zodiac-counts";

// 星座ごとの回答人数を保存するオブジェクト
let zodiacCounts = {};

// 保存済みデータを読み込む
try {

  const savedZodiacCounts = JSON.parse(
    localStorage.getItem(zodiacStorageKey)
  );

  // 12星座それぞれの保存データを確認
  zodiacSigns.forEach(function(sign) {

    const savedCount = savedZodiacCounts?.[sign];

    // 0以上の安全な整数だけ読み込む
    zodiacCounts[sign] =
      Number.isSafeInteger(savedCount) && savedCount >= 0
        ? savedCount
        : 0;

  });

} catch (error) {

  // 保存データの読み込みに失敗した場合
  console.warn(
    "星座の保存データを読み込めませんでした。",
    error
  );

  // すべての星座を0人にする
  zodiacSigns.forEach(function(sign) {
    zodiacCounts[sign] = 0;
  });

}

// 画面表示を更新する関数
function updateZodiacDisplay() {

  // 総回答人数を初期化
  let totalCount = 0;

  // 12星座を順番に処理
  zodiacSigns.forEach(function(sign) {

    // 星座ごとの人数表示を取得
    const countDisplay = document.getElementById(
      "zodiac-count-" + sign
    );

    // 星座ごとの人数を画面に表示
    if (countDisplay) {
      countDisplay.textContent = zodiacCounts[sign];
    }

    // 総回答人数に加算
    totalCount += zodiacCounts[sign];

  });

  // 総回答人数を画面に表示
  const totalDisplay = document.getElementById("zodiac-total");

  if (totalDisplay) {
    totalDisplay.textContent =
      totalCount.toLocaleString("ja-JP") + "人";
  }

  // 現在の記録をブラウザに保存
  localStorage.setItem(
    zodiacStorageKey,
    JSON.stringify(zodiacCounts)
  );

}

// ＋／−ボタンを取得
const zodiacButtons = document.querySelectorAll(
  ".zodiac-count-item button"
);

// それぞれのボタンにクリック処理を設定
zodiacButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    // 対象の星座を取得
    const sign = button.dataset.zodiac;

    // ＋か−かを取得
    const action = button.dataset.action;

    // 登録されていない星座なら処理しない
    if (!zodiacSigns.includes(sign)) return;

    // ＋ボタンなら1人追加
    if (action === "plus") {

      zodiacCounts[sign]++;

    }

    // −ボタンなら1人減らす
    if (action === "minus") {

      // 0人より小さくならないようにする
      zodiacCounts[sign] = Math.max(
        0,
        zodiacCounts[sign] - 1
      );

    }

    // 画面表示と保存データを更新
    updateZodiacDisplay();

  });

});

// RESETボタンを取得
const zodiacReset = document.getElementById("zodiac-reset");

// RESETボタンのクリック処理
if (zodiacReset) {

  zodiacReset.addEventListener("click", function() {

    // リセットするか確認
    const shouldReset = confirm(
      "12星座の回答記録をすべてリセットしますか？"
    );

    // キャンセルされた場合は終了
    if (!shouldReset) return;

    // 12星座すべての人数を0に戻す
    zodiacSigns.forEach(function(sign) {
      zodiacCounts[sign] = 0;
    });

    // 表示と保存データを更新
    updateZodiacDisplay();

  });

}

// ページを開いたときに保存済みデータを表示
updateZodiacDisplay();


/* ======================================
   LIVE TOOLS ACCORDION（配信ツール開閉機能）
   4つのツールを個別に開閉できるようにする
====================================== */

// 4つのツールカードを取得
const toolCards = document.querySelectorAll(".live-tool-card");

// それぞれのカードに開閉処理を設定
toolCards.forEach(function(card) {

  // カード内の見出しボタンを取得
  const toggleButton = card.querySelector(".tool-accordion-toggle");

  // 見出しボタンが存在しない場合は処理しない
  if (!toggleButton) return;

  // 見出しボタンをクリックしたときの処理
  toggleButton.addEventListener("click", function() {

    // 現在カードが開いているか確認
    const isOpen = card.classList.contains("is-open");

    // 開いている場合は閉じる
    if (isOpen) {

      card.classList.remove("is-open");

      // アクセシビリティ用の状態も更新
      toggleButton.setAttribute("aria-expanded", "false");

    } else {

      // 閉じている場合は開く
      card.classList.add("is-open");

      // アクセシビリティ用の状態も更新
      toggleButton.setAttribute("aria-expanded", "true");

    }

  });

});
