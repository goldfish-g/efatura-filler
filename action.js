let savedData = {
  faturas: [],
  currInd: 0
}

chrome.storage.local.get(["faturas","currInd"]).then((result) => {
  if (result && result.faturas) {
    savedData.faturas = result.faturas;

    document.getElementById("importWindow").className = "hidden"
    document.getElementById("fillformWindow").className = ""
    document.getElementById("importText").value = JSON.stringify(result.faturas)
    document.getElementById("totalFaturas").innerText = result.faturas.length

    if (result.currInd) {
      savedData.currInd = result.currInd
      document.getElementById("currentFatura").value = ""+(result.currInd+1)
    }
  }
});

const injector = async (fatura) => {
  document.getElementById("nifAdquirente").value = fatura.nifAdquirente
  document.getElementById("atcud").value = fatura.atcud
  document.getElementById("tipoDocumento").value = "FS"
  document.getElementById("numeroDocumento").value = fatura.numeroDocumento
  document.getElementById("dataEmissaoDocumento").value = fatura.dataEmissaoDocumento

  document.querySelector('a[onclick="editar(this)"]').click();
  await new Promise(r => setTimeout(r, 500));

  document.getElementById("taxaIvaVerba").value = "ISE"
  document.getElementById("motivoIsencao").value = "M07"
  document.getElementById("totalInput").value = fatura.totalInput
  document.getElementById("baseTributavelInput").value = fatura.totalInput

  document.getElementById("guardarDetalheLinhaModal").click()
}

const submitFatura = async () => {
  document.getElementById("guardarDocumentoBtn").click()
}


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  
  return tab;
}

document.getElementById("importButton").addEventListener('click', ()  => {
  console.log("importButton")
  document.getElementById("importWindow").classList.remove("hidden")
  document.getElementById("fillformButton").classList.remove("hidden")
  document.getElementById("fillformWindow").classList.add("hidden")
  document.getElementById("importButton").classList.add("hidden")
})

document.getElementById("fillformButton").addEventListener('click', ()  => {
  console.log("fillformButton")
  document.getElementById("importWindow").classList.add("hidden")
  document.getElementById("fillformButton").classList.add("hidden")
  document.getElementById("fillformWindow").classList.remove("hidden")
  document.getElementById("importButton").classList.remove("hidden")
})

document.getElementById("importSave").addEventListener('click', ()  => {
  const faturas = JSON.parse(document.getElementById("importText").value)
  savedData.faturas = faturas;
  savedData.currInd = 0;

  document.getElementById("currentFatura").value = "1"
  document.getElementById("totalFaturas").innerText = faturas.length

  chrome.storage.local.set({ faturas, currInd: 0 })
})

document.getElementById("fillButton").addEventListener('click', async () => {
  let tab = await getCurrentTab();
  let fatura = savedData.faturas[savedData.currInd]
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: injector,
    args: [fatura],
  })
})

document.getElementById("submitButton").addEventListener('click', async () => {
  let tab = await getCurrentTab();
  if (savedData.currInd < savedData.faturas.length - 1) {
    savedData.currInd = savedData.currInd + 1
    await chrome.storage.local.set({ currInd: +savedData.currInd })
    document.getElementById("currentFatura").value = ""+(savedData.currInd+1)
  }
  
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: submitFatura
  })
})


document.getElementById("backButton").addEventListener('click', async () => {
  if (savedData.currInd > 0) {
    savedData.currInd = savedData.currInd - 1;
    await chrome.storage.local.set({ currInd: +savedData.currInd })
    document.getElementById("currentFatura").value = ""+(savedData.currInd+1)
  }
})

document.getElementById("skipButton").addEventListener('click', async () => {
  if (savedData.currInd < savedData.faturas.length - 1) {
    savedData.currInd = savedData.currInd + 1;
    await chrome.storage.local.set({ currInd: +savedData.currInd })
    document.getElementById("currentFatura").value = ""+(savedData.currInd+1)
  }
})

document.getElementById("currentFaturaForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  const newValue = +document.getElementById("currentFatura").value

  if (newValue > 0 && newValue < savedData.faturas.length + 1) {
    savedData.currInd = newValue - 1;
    await chrome.storage.local.set({ currInd: newValue - 1 })
  } else {
    document.getElementById("currentFatura").value = ""+(savedData.currInd+1)
  }
})

document.getElementById("currentFaturaForm").addEventListener("focusout", () => {
  document.getElementById("currentFatura").value = ""+(savedData.currInd+1)
})