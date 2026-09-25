// ============================
// 材料マスター表示
// ============================

function renderMaterials() {
  const table = document.getElementById("materialsTable");

  table.innerHTML = "";

  Object.entries(materials).forEach(function(entry) {
    const material = entry[1];

    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = material.name;

    const priceCell = document.createElement("td");
    priceCell.textContent =
      material.price.toLocaleString() + " 円";

    row.appendChild(nameCell);
    row.appendChild(priceCell);

    table.appendChild(row);
  });
}


// ============================
// 商品一覧表示
// ============================

function renderProducts() {
  const table = document.getElementById("productsTable");

  table.innerHTML = "";

  products.forEach(function(product, index) {

    const row = document.createElement("tr");


    // チェックボックス
    const checkboxCell = document.createElement("td");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "product";
    checkbox.dataset.index = index;

    checkboxCell.appendChild(checkbox);


    // 商品名
    const nameCell = document.createElement("td");
    nameCell.textContent = product.name;


    // 材料原価
    const costCell = document.createElement("td");
    costCell.className = "product-cost";
    costCell.dataset.index = index;
    costCell.textContent = "0 円";


    // 作業価格
    const priceCell = document.createElement("td");
    priceCell.textContent =
      product.price.toLocaleString() + " 円";


    row.appendChild(checkboxCell);
    row.appendChild(nameCell);
    row.appendChild(costCell);
    row.appendChild(priceCell);

    table.appendChild(row);
  });
}


// ============================
// 商品1個あたりの材料原価
// ============================

function calculateProductCost(product) {

  let cost = 0;

  product.materials.forEach(function(materialInfo) {

    const material = materials[materialInfo.id];

    if (!material) {
      console.warn(
        "材料が見つかりません:",
        materialInfo.id
      );
      return;
    }

    cost +=
      material.price *
      materialInfo.quantity;
  });

  return cost;
}


// ============================
// 現在チェックされている商品の材料
// ============================

function calculateCurrentMaterials() {

  const currentMaterials = {};

  document
    .querySelectorAll(".product:checked")
    .forEach(function(checkbox) {

      const index =
        Number(checkbox.dataset.index);

      const product =
        products[index];

      product.materials.forEach(function(materialInfo) {

        if (!currentMaterials[materialInfo.id]) {
          currentMaterials[materialInfo.id] = 0;
        }

        currentMaterials[materialInfo.id] +=
          materialInfo.quantity;

      });

    });

  return currentMaterials;
}


// ============================
// 使用材料（今回）表示
// ============================

function renderCurrentMaterials() {

  const table =
    document.getElementById(
      "usedMaterialsTable"
    );

  table.innerHTML = "";

  const currentMaterials =
    calculateCurrentMaterials();

  const materialIds =
    Object.keys(currentMaterials);


  if (materialIds.length === 0) {

    const row =
      document.createElement("tr");

    const cell =
      document.createElement("td");

    cell.colSpan = 2;

    cell.textContent =
      "商品を選択してください";

    row.appendChild(cell);

    table.appendChild(row);

    return;
  }


  materialIds.forEach(function(materialId) {

    const material =
      materials[materialId];

    if (!material) {
      return;
    }

    const row =
      document.createElement("tr");


    const nameCell =
      document.createElement("td");

    nameCell.textContent =
      material.name;


    const quantityCell =
      document.createElement("td");

    quantityCell.textContent =
      currentMaterials[materialId];


    row.appendChild(nameCell);
    row.appendChild(quantityCell);

    table.appendChild(row);

  });
}


// ============================
// 累積材料
// ============================

// 保存用の名前
const cumulativeStorageKey =
  "mechanicToolCumulativeMaterials";


// ============================
// 累積材料を読み込む
// ============================

function loadCumulativeMaterials() {

  const savedData =
    localStorage.getItem(
      cumulativeStorageKey
    );


  if (!savedData) {
    return {};
  }


  try {

    return JSON.parse(savedData);

  } catch (error) {

    console.warn(
      "累積材料の読み込みに失敗しました。",
      error
    );

    return {};

  }

}


// 保存されている累積材料を読み込む
const cumulativeMaterials =
  loadCumulativeMaterials();


// ============================
// 累積材料を保存
// ============================

function saveCumulativeMaterials() {

  localStorage.setItem(
    cumulativeStorageKey,
    JSON.stringify(cumulativeMaterials)
  );

}


// ============================
// 累積材料を表示
// ============================

function renderCumulativeMaterials() {

  const table =
    document.getElementById(
      "cumulativeMaterialsTable"
    );

  table.innerHTML = "";

  const materialIds =
    Object.keys(cumulativeMaterials);


  if (materialIds.length === 0) {

    const row =
      document.createElement("tr");

    const cell =
      document.createElement("td");

    cell.colSpan = 2;

    cell.textContent =
      "まだ請求されていません";

    row.appendChild(cell);

    table.appendChild(row);

    return;
  }


  materialIds.forEach(function(materialId) {

    const material =
      materials[materialId];

    if (!material) {
      return;
    }

    const row =
      document.createElement("tr");


    const nameCell =
      document.createElement("td");

    nameCell.textContent =
      material.name;


    const quantityCell =
      document.createElement("td");

    quantityCell.textContent =
      cumulativeMaterials[materialId];


    row.appendChild(nameCell);
    row.appendChild(quantityCell);

    table.appendChild(row);

  });

}


// ============================
// 合計計算
// ============================

function calculate() {

  let totalCost = 0;
  let totalSales = 0;


  // 商品ごとの材料原価
  products.forEach(function(product, index) {

    const cost =
      calculateProductCost(product);

    const costElement =
      document.querySelector(
        '.product-cost[data-index="' +
        index +
        '"]'
      );


    if (costElement) {

      costElement.textContent =
        cost.toLocaleString() +
        " 円";

    }

  });


  // 選択された商品の合計
  document
    .querySelectorAll(".product:checked")
    .forEach(function(checkbox) {

      const index =
        Number(checkbox.dataset.index);

      const product =
        products[index];


      totalCost +=
        calculateProductCost(product);

      totalSales +=
        product.price;

    });


  // 粗利
  const profit =
    totalSales - totalCost;


  // 合計表示
  document.getElementById(
    "totalCost"
  ).textContent =
    totalCost.toLocaleString();


  document.getElementById(
    "totalSales"
  ).textContent =
    totalSales.toLocaleString();


  document.getElementById(
    "profit"
  ).textContent =
    profit.toLocaleString();


  // 今回の使用材料を更新
  renderCurrentMaterials();
}


// ============================
// 請求処理
// ============================

function billing() {

  const currentMaterials =
    calculateCurrentMaterials();

  const materialIds =
    Object.keys(currentMaterials);


  // 商品が選択されていない場合
  if (materialIds.length === 0) {

    alert("商品を選択してください。");

    return;
  }


  // 今回分を累積に追加
  materialIds.forEach(function(materialId) {

    if (!cumulativeMaterials[materialId]) {
      cumulativeMaterials[materialId] = 0;
    }

    cumulativeMaterials[materialId] +=
      currentMaterials[materialId];

  });


  // ★ 累積材料を保存
  saveCumulativeMaterials();


  // 累積材料を表示
  renderCumulativeMaterials();


  // 商品のチェックを全部外す
  document
    .querySelectorAll(".product")
    .forEach(function(checkbox) {

      checkbox.checked = false;

    });


  // 合計を0に戻す
  calculate();

}


// ============================
// 使用材料リセット
// ============================

function resetCumulativeMaterials() {

  const materialIds =
    Object.keys(cumulativeMaterials);


  materialIds.forEach(function(materialId) {

    delete cumulativeMaterials[materialId];

  });


  // ★ 保存されている累積材料も削除
  localStorage.removeItem(
    cumulativeStorageKey
  );


  renderCumulativeMaterials();
}


// ============================
// イベント設定
// ============================

function setupEvents() {

  // 商品チェック時
  document.addEventListener(
    "change",
    function(event) {

      if (
        event.target.classList.contains(
          "product"
        )
      ) {

        calculate();

      }

    }
  );


  // 請求ボタン
  document
    .getElementById("billingButton")
    .addEventListener(
      "click",
      function() {

        billing();

      }
    );


  // 累積材料リセット
  document
    .getElementById(
      "resetMaterialsButton"
    )
    .addEventListener(
      "click",
      function() {

        resetCumulativeMaterials();

      }
    );

}


// ============================
// 初期処理
// ============================

renderMaterials();

renderProducts();

setupEvents();

calculate();

renderCumulativeMaterials();
