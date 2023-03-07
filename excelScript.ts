function main(workbook: ExcelScript.Workbook): Fatura[] {

  const worksheet = workbook.getWorksheets()[0];
  
  let faturaArray: Fatura[] = []

  while (true) {
    let i = faturaArray.length;
    const previousFatura = faturaArray[i-1]

    i++

    const nifAdquirente = ""+worksheet.getRange(`A${i}`).getValue()
    const atcud = "" +worksheet.getRange(`B${i}`).getValue()
    const numeroDocumento = "" +worksheet.getRange(`C${i}`).getValue()
    const dataEmissaoDocumento = "" +worksheet.getRange(`D${i}`).getValue()
    const totalInput = "" +worksheet.getRange(`E${i}`).getValue()

    if (!nifAdquirente && !atcud && !numeroDocumento && !dataEmissaoDocumento && !totalInput) {
      break;
    }

    const fatura: Fatura = { nifAdquirente, atcud, numeroDocumento, dataEmissaoDocumento, totalInput}

    Object.keys(fatura).forEach((key) => {
      if (!fatura[key]) {

        if (key === "nifAdquirente") {
          fatura[key] = "999999990"
          return;
        }

        if (key === "atcud") {
          const prev = previousFatura[key].split("-")
          prev[1] = zeroPad(+prev[1] + 1, 4)
          fatura[key] = prev.join("-")
          return;
        }

        if (key === "numeroDocumento") {
          const prev = previousFatura[key].split("/")
          prev[1] = zeroPad(+prev[1] + 1, 4)
          fatura[key] = prev.join("/")
          return;
        }

        if (key === "dataEmissaoDocumento") {
          fatura[key] = previousFatura[key]
          return;
        }

        throw new Error ("Empty cell that can't be empty.")
      }
    })

    faturaArray.push(fatura)
  }
  faturaArray.forEach(e => {
    e.dataEmissaoDocumento = formatDate(e.dataEmissaoDocumento)
    e.totalInput = (+e.totalInput).toLocaleString("pt-PT",{maximumFractionDigits: 2, minimumFractionDigits: 2})
  })
  console.log(JSON.stringify(faturaArray))
  return faturaArray;
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

const formatDate = (serial: string): string => {
  var utc_days = Math.floor(+serial - 25569);
  var utc_value = utc_days * 86400;
  var val = new Date(utc_value * 1000);

  const day = val.getDate();
  const month = val.getMonth() + 1;
  const year = val.getFullYear();
  return `${year}-${zeroPad(month, 2)}-${ zeroPad(day, 2)}`
}

interface Fatura {
  nifAdquirente: string;
  atcud: string;
  numeroDocumento: string;
  dataEmissaoDocumento: string;
  totalInput: string;
}