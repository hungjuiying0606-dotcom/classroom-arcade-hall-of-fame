/**
 * Classroom Arcade Backend - Google Apps Script
 * Exposes endpoints to:
 * 1. Read quiz questions from Google Sheets (with column auto-detection)
 * 2. Log student scores into a "遊戲成績" sheet
 */

const DEFAULT_SPREADSHEET_ID = "1schm9u2LKrGFMsdQKn1Nd614YoFdov59FjWWSRC0CTQ";
const SCORE_SHEET_NAME = "遊戲成績";

// CORS Response Helper
function corsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Open Spreadsheet (by configured ID, or active sheet, or fallback)
function getSpreadsheet() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty("SPREADSHEET_ID") || DEFAULT_SPREADSHEET_ID;
  
  let ss = null;
  if (spreadsheetId) {
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
    } catch(e) {
      ss = null;
    }
  }
  
  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch(e) {
      ss = null;
    }
  }
  
  return ss;
}

// Main GET Router
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = getSpreadsheet();
    
    if (!ss) {
      return corsResponse({ status: "error", message: "找不到試算表！請確認 Google Apps Script 與試算表已正確連結。" });
    }
    
    // ACTION 1: READ QUESTIONS
    if (action === "read_questions") {
      // Find "題目" sheet or use the first sheet
      let sheet = ss.getSheetByName("題目") || ss.getSheetByName("題庫");
      if (!sheet) {
        sheet = ss.getSheets()[0]; // Fallback to first sheet
      }
      
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return corsResponse({ status: "success", data: [], message: "試算表中沒有題目資料（除標題列外無資料）" });
      }
      
      // Auto-detect column headers
      const headers = data[0].map(h => h.toString().trim().toLowerCase());
      let colQuestion = -1;
      let colAnswer = -1;
      let colOptions = [];
      let colExplanation = -1;
      
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i];
        if (h.includes("題目") || h.includes("問題") || h.includes("question") || h.includes("題幹")) {
          colQuestion = i;
        } else if (h.includes("正确答案") || h.includes("正確答案") || h.includes("答案") || h.includes("answer") || h.includes("解答") || h.includes("正解") || h === "ans" || h === "key" || h === "correct") {
          colAnswer = i;
        } else if (h.includes("選項") || h.includes("option") || h.includes("choice") || h.includes("選一") || h.includes("選二") || h.includes("選三") || h.includes("選四")) {
          colOptions.push(i);
        } else if (h.includes("解析") || h.includes("說明") || h.includes("explanation") || h.includes("詳解")) {
          colExplanation = i;
        }
      }
      
      // Fallback: if no headers match, detect based on column count
      if (colQuestion === -1 && headers.length >= 6) {
        colQuestion = 0;
        colOptions = [1, 2, 3, 4];
        colAnswer = 5;
      } else {
        if (colQuestion === -1) {
          colQuestion = (headers[0] === "" || !isNaN(headers[0])) ? 1 : 0;
        }
        if (colAnswer === -1) {
          colAnswer = colQuestion + 1 < headers.length ? colQuestion + 1 : colQuestion;
        }
      }
      
      const questions = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const qText = colQuestion < row.length ? row[colQuestion]?.toString().trim() : "";
        const aText = colAnswer < row.length ? row[colAnswer]?.toString().trim() : "";
        if (!qText || !aText) continue; // Skip empty rows
        
        let opts = [];
        if (colOptions.length > 0) {
          colOptions.forEach(optCol => {
            if (optCol < row.length) {
              const optVal = row[optCol]?.toString().trim();
              if (optVal !== "") {
                opts.push(optVal);
              }
            }
          });
        }
        
        const expText = (colExplanation !== -1 && colExplanation < row.length) ? row[colExplanation]?.toString().trim() : "";
        
        const qObj = {
          question: qText,
          answer: aText,
          explanation: expText
        };
        
        if (opts.length > 0) {
          qObj.options = opts;
        }
        
        questions.push(qObj);
      }
      
      return corsResponse({
        status: "success",
        data: questions,
        total: questions.length,
        spreadsheetUrl: ss.getUrl()
      });
    }
    
    // ACTION 2: LOG SCORE
    if (action === "log_score") {
      let sheet = ss.getSheetByName(SCORE_SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(SCORE_SHEET_NAME);
        const headers = ["記錄時間", "學生姓名", "班級", "座號", "遊玩遊戲", "得分", "答對題數", "總題數"];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#cbd5e1");
        sheet.setFrozenRows(1);
      }
      
      const name = e.parameter.name || "未具名";
      const studentClass = e.parameter.class || "未填寫";
      const seat = parseInt(e.parameter.seat) || 0;
      const game = e.parameter.game || "未知遊戲";
      const score = parseInt(e.parameter.score) || 0;
      const correct = parseInt(e.parameter.correct) || 0;
      const total = parseInt(e.parameter.total) || 0;
      
      const newRow = [
        new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
        name,
        studentClass,
        seat,
        game,
        score,
        correct,
        total
      ];
      
      sheet.appendRow(newRow);
      
      return corsResponse({
        status: "success",
        message: "成績已成功存入試算表！"
      });
    }
    
    return corsResponse({ status: "error", message: "無效的 Action 參數" });
  } catch(err) {
    return corsResponse({ status: "error", message: "後端程式執行出錯: " + err.toString() });
  }
}

function doPost(e) {
  return corsResponse({ status: "error", message: "請使用 GET 請求進行資料存取。" });
}
