/* ==========================================
   CLASSROOM ARCADE PLATFORM CONTROLLER (app.js)
   ========================================== */

// 1. Demo Mode Fallback Questions Database
const DEMO_QUESTIONS = [
  {
    "question": "諾貝爾是哪個國家的人？",
    "options": ["英國", "瑞典", "美國", "德國"],
    "answer": "瑞典"
  },
  {
    "question": "陪伴愛因斯坦一生，甚至能登台演奏的樂器是什麼？",
    "options": ["鋼琴", "吉他", "長笛", "小提琴"],
    "answer": "小提琴"
  },
  {
    "question": "哈伯在擔任天文學家前，曾經擔任哪一項工作？",
    "options": ["律師", "醫生", "畫家", "廚師"],
    "answer": "律師"
  },
  {
    "question": "查爾斯·達爾文的父親及祖父的職業是什麼？",
    "options": ["牧師", "鐵匠", "醫生", "律師"],
    "answer": "醫生"
  },
  {
    "question": "搞笑諾貝爾獎的獎金是多少？",
    "options": ["1000萬瑞典克朗", "不會有任何獎金", "400萬美元", "3200萬新台幣"],
    "answer": "不會有任何獎金"
  },
  {
    "question": "現代物理學之父是誰？",
    "options": ["牛頓", "愛因斯坦", "伽利略", "哈伯"],
    "answer": "愛因斯坦"
  },
  {
    "question": "星系天文學之父是指哪一位科學家？",
    "options": ["哈伯", "伽利略", "牛頓", "哥白尼"],
    "answer": "哈伯"
  },
  {
    "question": "達爾文死後在哪裡安葬？",
    "options": ["太平洋", "巴黎鐵塔", "金字塔", "西敏寺"],
    "answer": "西敏寺"
  },
  {
    "question": "搞笑諾貝爾獎是向什麼致敬（授予什麼成就）？",
    "options": ["乍看好笑後引人深思", "最無聊的成就", "最花錢的成就", "寵物安東尼旺的研究"],
    "answer": "乍看好笑後引人深思"
  },
  {
    "question": "愛因斯坦的「奇蹟之年」是哪一年？",
    "options": ["1905年", "1879年", "1955年", "1914年"],
    "answer": "1905年"
  },
  {
    "question": "諾貝爾是什麼時候出生？",
    "options": ["1896年", "1901年", "1833年", "1862年"],
    "answer": "1833年"
  },
  {
    "question": "諾貝爾在哪一年去世的？",
    "options": ["1901年", "1833年", "1864年", "1896年"],
    "answer": "1896年"
  },
  {
    "question": "諾貝爾的主要研究領域是什麼？",
    "options": ["炸藥製造", "天文學", "生理醫學", "文學"],
    "answer": "炸藥製造"
  },
  {
    "question": "為什麼諾貝爾要創立諾貝爾獎？",
    "options": ["為了自己出名", "為了賺取利息", "獎勵對人類社會有最大貢獻的人", "為了推廣炸藥"],
    "answer": "獎勵對人類社會有最大貢獻的人"
  },
  {
    "question": "諾貝爾獎總共分為多少個類別的獎項(原始設立)？",
    "options": ["3個", "6個", "10個", "5個"],
    "answer": "5個"
  },
  {
    "question": "諾貝爾獎的頒獎儀式在哪裡舉行？",
    "options": ["美國", "英國", "法國", "瑞典"],
    "answer": "瑞典"
  },
  {
    "question": "諾貝爾獎的頒獎典禮在每年的哪個日期舉行？",
    "options": ["10月12日", "1月1日", "12月10日", "12月25日"],
    "answer": "12月10日"
  },
  {
    "question": "什麼是搞笑諾貝爾獎？",
    "options": ["發給喜劇演員的獎", "真正的諾貝爾獎", "獎金最高的獎項", "對諾貝爾獎的有趣模仿"],
    "answer": "對諾貝爾獎的有趣模仿"
  },
  {
    "question": "搞笑諾貝爾獎的頒獎儀式在哪裡舉行？",
    "options": ["劍橋大學", "牛津大學", "哈佛大學", "瑞典皇家科學院"],
    "answer": "哈佛大學"
  },
  {
    "question": "愛因斯坦是哪個國家的人？",
    "options": ["德國", "英國", "瑞士", "美國"],
    "answer": "德國"
  },
  {
    "question": "愛因斯坦在美國的哪所大學擔任教職？",
    "options": ["柏林大學", "蘇黎世大學", "哈佛大學", "普林斯頓大學"],
    "answer": "普林斯頓大學"
  },
  {
    "question": "愛因斯坦得過哪一種諾貝爾獎？",
    "options": ["化學獎", "和平獎", "物理學獎", "數學獎"],
    "answer": "物理學獎"
  },
  {
    "question": "質能互換方程式是指哪一個方程式？",
    "options": ["F=ma", "V=IR", "E=mc2", "P=IV"],
    "answer": "E=mc2"
  },
  {
    "question": "科學家們因為愛因斯坦提出的哪個理論，而開始了核分裂的研究？",
    "options": ["狹義相對論(質能互換)", "廣義相對論", "光電效應", "量子理論"],
    "answer": "狹義相對論(質能互換)"
  },
  {
    "question": "愛因斯坦的研究間接促成核分裂的應用，例如下列何者？",
    "options": ["炸藥", "雷達", "望遠鏡", "原子彈"],
    "answer": "原子彈"
  },
  {
    "question": "埃德溫·哈伯是在哪一年出生？",
    "options": ["1879年", "1910年", "1889年", "1953年"],
    "answer": "1889年"
  },
  {
    "question": "埃德溫·哈伯在西元1919年獲得哪一個天文台聘用，成為終身職位？",
    "options": ["威爾森天文台", "格林威治天文台", "巴黎天文台", "帕洛馬天文台"],
    "answer": "威爾森天文台"
  },
  {
    "question": "哈伯證實了銀河系外其他星系存在，並發現星系紅移現象，建立了什麼定律？",
    "options": ["虎克定律", "萬有引力定律", "慣性定律", "哈伯定律"],
    "answer": "哈伯定律"
  },
  {
    "question": "哈伯定律指出遙遠星系的退行速度與距離成正比，為哪一個理論提出了有力支持？",
    "options": ["宇宙大爆炸理論", "天擇說", "日心說", "相對論"],
    "answer": "宇宙大爆炸理論"
  },
  {
    "question": "以天文學家愛德溫·哈伯來命名，在地球軌道上運行的太空望遠鏡是哪一座？",
    "options": ["韋伯太空望遠鏡", "哈伯太空望遠鏡", "克卜勒望遠鏡", "伽利略望遠鏡"],
    "answer": "哈伯太空望遠鏡"
  },
  {
    "question": "哈伯太空望遠鏡的高解析影像被用來證實何者存在於星系核中的學說？",
    "options": ["外星人", "彗星", "黑洞", "太陽"],
    "answer": "黑洞"
  },
  {
    "question": "將太空望遠鏡發射到地球軌道上運行的好處是什麼？",
    "options": ["比較便宜", "不受重力影響", "離外星人比較近", "影像不受大氣湍流擾動"],
    "answer": "影像不受大氣湍流擾動"
  },
  {
    "question": "查爾斯·達爾文是哪個國家的科學家？",
    "options": ["美國", "英國", "德國", "義大利"],
    "answer": "英國"
  },
  {
    "question": "達爾文因提出哪一套理論而聞名？",
    "options": ["大陸漂移說", "相對論", "天擇說(演化論)", "萬有引力"],
    "answer": "天擇說(演化論)"
  },
  {
    "question": "下列何者「不是」達爾文天擇說的四個重要主張？",
    "options": ["用進廢退", "個體差異", "過度繁殖", "適者生存"],
    "answer": "用進廢退"
  },
  {
    "question": "下列哪一本是達爾文所寫的著名書籍？",
    "options": ["陸與海的起源", "雙螺旋", "物種起源", "靈憲"],
    "answer": "物種起源"
  },
  {
    "question": "得到哪一種疾病的人因為紅血球變形，可以免除瘧疾的危害？",
    "options": ["白血病", "蠶豆症", "糖尿病", "血友病"],
    "answer": "蠶豆症"
  },
  {
    "question": "達爾文發現生物過度繁殖，但地球上的什麼是有限的，導致生存競爭？",
    "options": ["資源(食物和空間)", "空氣", "陽光", "水分"],
    "answer": "資源(食物和空間)"
  },
  {
    "question": "在達爾文時代，演化論被視為新奇想法，如果公開會被教會視為什麼？",
    "options": ["偉大真理", "上帝的啟示", "法律規定", "異端邪說"],
    "answer": "異端邪說"
  },
  {
    "question": "長頸鹿面對高樹木的環境，脖子長的更容易活下來傳遞特點，這符合哪一項概念？",
    "options": ["個體差異", "適者生存", "過度繁殖", "人工生殖"],
    "answer": "適者生存"
  }
];

const 複習02_答案是文字 = [
  {
    "question": "創立「大陸漂移學說」的德國科學家是誰？",
    "options": [
      "張衡",
      "韋格納",
      "華生",
      "克里克"
    ],
    "answer": "韋格納"
  },
  {
    "question": "韋格納在柏林洪堡大學拿到了哪一種學位的博士？",
    "options": [
      "醫學博士",
      "神學博士",
      "理學博士",
      "法學博士"
    ],
    "answer": "理學博士"
  },
  {
    "question": "韋格納與他的兄長庫爾特共同創下了哪項氣象觀測紀錄？",
    "options": [
      "熱氣球連續飛行時間",
      "風箏飛行高度",
      "氣象觀測站數量",
      "探測氣球飛行距離"
    ],
    "answer": "熱氣球連續飛行時間"
  },
  {
    "question": "韋格納在哪個島嶼建造了第一個氣象觀測站？",
    "options": [
      "冰島",
      "格陵蘭島",
      "台灣島",
      "馬達加斯加島"
    ],
    "answer": "格陵蘭島"
  },
  {
    "question": "韋格納在擔任教職期間，注意到哪兩個大陸的海岸線非常相似？",
    "options": [
      "亞洲與非洲",
      "非洲西岸與南美洲東岸",
      "歐洲與北美洲",
      "非洲與南極大陸"
    ],
    "answer": "非洲西岸與南美洲東岸"
  },
  {
    "question": "韋格納假設在古生代石炭紀以前，全世界的大陸是一整塊什麼？",
    "options": [
      "太平洋大陸",
      "大西洋大陸",
      "盤古大陸",
      "孤立大陸"
    ],
    "answer": "盤古大陸"
  },
  {
    "question": "根據學說，盤古大陸破裂和漂移的主要原因與地球自轉的什麼力有關？",
    "options": [
      "向心力",
      "萬有引力",
      "離心力",
      "摩擦力"
    ],
    "answer": "離心力"
  },
  {
    "question": "當時學界多不接受大陸漂移學說，其中一個批評原因是什麼？",
    "options": [
      "研究越了界",
      "數據全憑虛構",
      "沒有去過格陵蘭",
      "不精通氣象學"
    ],
    "answer": "研究越了界"
  },
  {
    "question": "大陸漂移學說在當時無法解決的關鍵問題是什麼？",
    "options": [
      "海岸線形狀",
      "化石的分佈",
      "大陸移動的原動力",
      "地質的吻合度"
    ],
    "answer": "大陸移動的原動力"
  },
  {
    "question": "韋格納在哪一年、他五十歲生日當天，不幸在探險中遇難？",
    "options": [
      "一九零五年",
      "一九一二年",
      "一九三零年",
      "一九五三年"
    ],
    "answer": "一九三零年"
  },
  {
    "question": "在一九五三年共同發現去氧核糖核酸雙螺旋結構的搭檔是誰？",
    "options": [
      "華生與克里克",
      "虎克與牛頓",
      "威爾金斯與富蘭克林",
      "林媽利與張衡"
    ],
    "answer": "華生與克里克"
  },
  {
    "question": "哪位傑出的女性英國物理化學家拍出了關鍵的「照片五十一號」？",
    "options": [
      "林媽利",
      "富蘭克林",
      "居禮夫人",
      "伊蓮娜"
    ],
    "answer": "富蘭克林"
  },
  {
    "question": "美國天才科學家華生是在幾歲時就拿到了博士學位？",
    "options": [
      "二十二歲",
      "三十歲",
      "三十體歲",
      "五十歲"
    ],
    "answer": "二十二歲"
  },
  {
    "question": "華生是在參與哪裡的學術會議時，堅定了研究遺傳物質結構的決心？",
    "options": [
      "倫敦",
      "哥本哈根",
      "那不勒斯",
      "劍橋"
    ],
    "answer": "那不勒斯"
  },
  {
    "question": "華生與克里克是在哪一所大學的卡文迪許實驗室進行研究？",
    "options": [
      "牛津大學",
      "劍橋大學",
      "倫敦大學",
      "印第安納大學"
    ],
    "answer": "劍橋大學"
  },
  {
    "question": "富蘭克林利用哪一種高難度的化學與晶體學技術來研究物質結構？",
    "options": [
      "光學顯微鏡",
      "高能雷射光",
      "光繞射技術",
      "核磁共振"
    ],
    "answer": "光繞射技術"
  },
  {
    "question": "影響遺傳物質結構解密、拍下含氮鹼基交叉排列的關鍵照片編號是幾號？",
    "options": [
      "照片一號",
      "照片十五號",
      "照片三十七號",
      "照片五十一號"
    ],
    "answer": "照片五十一號"
  },
  {
    "question": "華生與克里克破解的遺傳物質結構中，哪一個部分位於螺旋結構的內側？",
    "options": [
      "磷酸根",
      "含氮鹼基",
      "去氧核糖",
      "蛋白質外殼"
    ],
    "answer": "含氮鹼基"
  },
  {
    "question": "華生、克里克與威爾金斯是在哪一年獲得諾貝爾生理醫學獎？",
    "options": [
      "一九一二年",
      "一九三零年",
      "一九五三年",
      "一九六二年"
    ],
    "answer": "一九六二年"
  },
  {
    "question": "富蘭克林在幾歲時因病逝世，因而與後來的諾貝爾獎擦身而過？",
    "options": [
      "二十二歲",
      "三十七歲",
      "五十歲",
      "七十八歲"
    ],
    "answer": "三十七歲"
  },
  {
    "question": "被尊稱為「台灣血液之母」的台灣科學家是誰？",
    "options": [
      "富蘭克林",
      "林媽利",
      "居禮夫人",
      "張衡"
    ],
    "answer": "林媽利"
  },
  {
    "question": "林媽利教授出生於台灣的哪一個縣市？",
    "options": [
      "台北市",
      "台南市",
      "高雄市",
      "花蓮縣"
    ],
    "answer": "高雄市"
  },
  {
    "question": "早期台灣醫院的血液多向俗稱什麼的民眾購買？",
    "options": [
      "血牛",
      "血汗人",
      "血商",
      "血庫"
    ],
    "answer": "血牛"
  },
  {
    "question": "台灣在林媽利教授等人的全力協助下，於哪一年建立起健全的無償捐血制度？",
    "options": [
      "一九三八年",
      "一九五三年",
      "一九六二年",
      "一九九二年"
    ],
    "answer": "一九九二年"
  },
  {
    "question": "血型主要是透過紅血球的表面存在哪些物質來進行分類？",
    "options": [
      "抗原",
      "抗體",
      "白血球",
      "血小板"
    ],
    "answer": "抗原"
  },
  {
    "question": "能夠誘發免疫系統產生抗體並引起溶血反應的物質稱為什麼？",
    "options": [
      "血紅素",
      "抗原",
      "血漿",
      "凝血因子"
    ],
    "answer": "抗原"
  },
  {
    "question": "林媽利教授找到了哪一種更適合亞洲人的血液檢驗方法？",
    "options": [
      "膜透法",
      "晶體繞射法",
      "比重法",
      "離心分離法"
    ],
    "answer": "膜透法"
  },
  {
    "question": "林媽利教授的研究發現，台灣人在臨床上不需要進行哪種特殊血型測定？",
    "options": [
      "恆河猴因子陰性血型",
      "米田堡血型",
      "亞孟買血型",
      "血型"
    ],
    "answer": "恆河猴因子陰性血型"
  },
  {
    "question": "哪一種血型是林媽利教授發現屬於亞洲人獨有且高比例的特殊血型？",
    "options": [
      "恆河猴因子陰性血型",
      "米田堡血型",
      "型",
      "型"
    ],
    "answer": "米田堡血型"
  },
  {
    "question": "林媽利教授成立了什麼實驗室，利用基因研究全面分析台灣族群的起源？",
    "options": [
      "古代實驗室",
      "古代蛋白質研究室",
      "輸血安全研究室",
      "法醫鑑定中心"
    ],
    "answer": "古代實驗室"
  },
  {
    "question": "活躍於東漢時期、被後世譽為「東方亞里斯多德」的全才科學家是誰？",
    "options": [
      "張衡",
      "韋格納",
      "虎克",
      "伽利略"
    ],
    "answer": "張衡"
  },
  {
    "question": "張衡在三十七歲時出任哪一個官職，掌管天文與曆法長達十四年？",
    "options": [
      "太守",
      "主簿",
      "太史令",
      "尚書侍郎"
    ],
    "answer": "太史令"
  },
  {
    "question": "太史令這個古代官職，其工作內容相當於現代的什麼職位？",
    "options": [
      "教育部長",
      "法院法官",
      "天文台台長",
      "外交大使"
    ],
    "answer": "天文台台長"
  },
  {
    "question": "張衡利用流動的水力作為動力，製作了能準確顯示天象的什麼儀器？",
    "options": [
      "候風地動儀",
      "渾天儀",
      "指南車",
      "記里鼓車"
    ],
    "answer": "渾天儀"
  },
  {
    "question": "西元一三八年，張衡發明的候風地動儀精準探測到了哪裡的大地震？",
    "options": [
      "洛陽",
      "長安",
      "甘肅",
      "南陽"
    ],
    "answer": "甘肅"
  },
  {
    "question": "張衡在文學上也極具盛名，他開創了哪一種中華文學的詩歌體裁？",
    "options": [
      "五言絕句",
      "七言古詩",
      "宋詞",
      "元曲"
    ],
    "answer": "七言古詩"
  },
  {
    "question": "張衡是世界上最早指出下列哪一個關於月球天文現象的科學家？",
    "options": [
      "月球表面有坑洞",
      "月球本身不發光",
      "月球自轉週期",
      "月球上有水存在"
    ],
    "answer": "月球本身不發光"
  },
  {
    "question": "張衡從哲學與科學的角度，將他先進的宇宙運行理論記載在哪一部不朽名著中？",
    "options": [
      "靈憲",
      "渾天儀注",
      "歸田賦",
      "二京賦"
    ],
    "answer": "靈憲"
  },
  {
    "question": "張衡少時家境清寒，在二十二歲時曾出任南陽郡太守的什麼官職？",
    "options": [
      "主簿",
      "太史令",
      "侍郎",
      "郎中"
    ],
    "answer": "主簿"
  },
  {
    "question": "雖然張衡在科學上成就極高，但在朝廷上面對宦官專權，他的態度為何？",
    "options": [
      "同流合污",
      "不慕官位勇敢直言",
      "辭官隱居不問世事",
      "投靠權貴"
    ],
    "answer": "不慕官位勇敢直言"
  }
];

const 複習03_正確答案是文字 = [
  {
    "question": "英國博物學家虎克出生於哪一種家庭？",
    "options": [
      "醫生家庭",
      "牧師家庭",
      "律師家庭",
      "教師家庭"
    ],
    "answer": "牧師家庭"
  },
  {
    "question": "虎克在16歲時進入哪一所大學就讀？",
    "options": [
      "劍橋大學",
      "倫敦大學",
      "牛津大學",
      "巴黎大學"
    ],
    "answer": "牛津大學"
  },
  {
    "question": "哪位科學家賞識虎克並讓他進入實驗室工作？",
    "options": [
      "牛頓",
      "波以耳",
      "伽利略",
      "歐幾里得"
    ],
    "answer": "波以耳"
  },
  {
    "question": "虎克在皇家學會中擔任什麼職務？",
    "options": [
      "會長",
      "幾何學教授",
      "秘書長",
      "實驗負責人"
    ],
    "answer": "實驗負責人"
  },
  {
    "question": "虎克在哪一年受聘為格雷斯罕學院的幾何學教授？",
    "options": [
      "1662年",
      "1663年",
      "1665年",
      "1678年"
    ],
    "answer": "1665年"
  },
  {
    "question": "虎克利用顯微鏡觀察樹皮軟木薄片時發現了什麼？",
    "options": [
      "活細胞",
      "死細胞",
      "細菌",
      "病毒"
    ],
    "answer": "死細胞"
  },
  {
    "question": "虎克用英文單字命名細胞，這個字原本的意思是什麼？",
    "options": [
      "小密室或單人房間",
      "蜂窩",
      "樹皮",
      "顯微鏡"
    ],
    "answer": "小密室或單人房間"
  },
  {
    "question": "現代車輛傳動裝置中廣泛應用的哪種結構是虎克製造的？",
    "options": [
      "萬向接頭",
      "齒輪箱",
      "輪形氣壓計",
      "反射望遠鏡"
    ],
    "answer": "萬向接頭"
  },
  {
    "question": "虎克在1664年利用反射望遠鏡發現了木星上的什麼特徵？",
    "options": [
      "木星環",
      "大紅點",
      "四顆衛星",
      "自轉軸"
    ],
    "answer": "大紅點"
  },
  {
    "question": "虎克逝世後，哪位科學家試圖銷毀他的論文與手稿？",
    "options": [
      "波以耳",
      "愛因斯坦",
      "貝克勒",
      "牛頓"
    ],
    "answer": "牛頓"
  },
  {
    "question": "阿基米德出生於西西里島的哪一個城市？",
    "options": [
      "敘拉古",
      "亞歷山卓",
      "開羅",
      "羅馬"
    ],
    "answer": "敘拉古"
  },
  {
    "question": "阿基米德小時候被父親送到哪裡唸書求學？",
    "options": [
      "希臘雅典",
      "義大利羅馬",
      "埃及亞歷山大城",
      "法國巴黎"
    ],
    "answer": "埃及亞歷山大城"
  },
  {
    "question": "阿基米德求學時曾跟隨哪位有名的幾何學大師學習？",
    "options": [
      "亞里斯多德",
      "歐幾里得",
      "高斯",
      "柏拉圖"
    ],
    "answer": "歐幾里得"
  },
  {
    "question": "美國數學史學家將阿基米德與哪兩位並列為史上最偉大數學家？",
    "options": [
      "牛頓、高斯",
      "歐幾里得、牛頓",
      "高斯、愛因斯坦",
      "虎克、牛頓"
    ],
    "answer": "牛頓、高斯"
  },
  {
    "question": "布匿戰爭時期，進攻阿基米德故鄉的是哪一個國家？",
    "options": [
      "迦太基",
      "埃及",
      "羅馬",
      "希臘"
    ],
    "answer": "羅馬"
  },
  {
    "question": "阿基米德利用什麼原理製造出投石機來防禦敵軍？",
    "options": [
      "浮力原理",
      "槓桿原理",
      "萬有引力",
      "加速度原理"
    ],
    "answer": "槓桿原理"
  },
  {
    "question": "羅馬軍隊進城時，沉思中的阿基米德大喊了什麼話？",
    "options": [
      "發現了！",
      "別碰我的圓！",
      "給我一個支點！",
      "戰爭結束了！"
    ],
    "answer": "別碰我的圓！"
  },
  {
    "question": "阿基米德利用「逼近法」逐次加倍邊數計算到了幾邊形？",
    "options": [
      "六邊形",
      "四十八邊形",
      "九十六邊形",
      "一百邊形"
    ],
    "answer": "九十六邊形"
  },
  {
    "question": "阿基米德在洗澡時得到了靈感，成功揭穿了金匠的什麼舞弊？",
    "options": [
      "王冠摻白銀",
      "王冠偷工減料",
      "盜取宮廷黃金",
      "偽造金幣"
    ],
    "answer": "王冠摻白銀"
  },
  {
    "question": "阿基米德提出什麼理論：物體在流體中所受浮力等於排開流體重？",
    "options": [
      "浮力理論",
      "槓桿原理",
      "密度理論",
      "萬向原理"
    ],
    "answer": "浮力理論"
  },
  {
    "question": "伽利略的父親在當時是一位怎麼樣的思想家？",
    "options": [
      "盲從權威",
      "痛恨思想封閉的反叛思想家",
      "宗教法庭法官",
      "大學醫學教授"
    ],
    "answer": "痛恨思想封閉的反叛思想家"
  },
  {
    "question": "21歲的伽利略在尚未取得什麼的情況下就離開的大學？",
    "options": [
      "研究經費",
      "教授職位",
      "官方文憑",
      "實驗儀器"
    ],
    "answer": "官方文憑"
  },
  {
    "question": "伽利略著名的比薩斜塔實驗推翻了誰的「重的物體下落快」理論？",
    "options": [
      "歐幾里得",
      "哥白尼",
      "牛頓",
      "亞里斯多德"
    ],
    "answer": "亞里斯多德"
  },
  {
    "question": "伽利略利用什麼器具研究並發現了加速度的概念？",
    "options": [
      "單擺",
      "斜面",
      "望遠鏡",
      "萬向接頭"
    ],
    "answer": "斜面"
  },
  {
    "question": "1615年伽利略因為公開支持哪一種學說而遭受教會彈劾？",
    "options": [
      "哥白尼的學說",
      "牛頓的學說",
      "亞里斯多德哲學",
      "萬有引力說"
    ],
    "answer": "哥白尼的學說"
  },
  {
    "question": "1633年羅馬宗教法庭判處伽利略什麼處罰？",
    "options": [
      "死刑",
      "驅逐出境",
      "罰款",
      "終生監禁（軟禁在家）"
    ],
    "answer": "終生監禁（軟禁在家）"
  },
  {
    "question": "伽利略把什麼儀器從普通小玩意轉變為不可或缺的科學儀器？",
    "options": [
      "顯微鏡",
      "望遠鏡",
      "輪形氣壓計",
      "地動儀"
    ],
    "answer": "望遠鏡"
  },
  {
    "question": "16世紀控制歐洲思想、否定日心說的兩大勢力是天主教會與誰？",
    "options": [
      "柏拉圖",
      "歐幾里得",
      "亞里斯多德",
      "哥白尼"
    ],
    "answer": "亞里斯多德"
  },
  {
    "question": "天主教會設立哪一個組織專門監察出版及民眾言論？",
    "options": [
      "耶穌會",
      "皇家學會",
      "宗教法庭",
      "科學革命會"
    ],
    "answer": "宗教法庭"
  },
  {
    "question": "哪位教宗在1992年正式表示對教會處理伽利略的方式感到遺憾？",
    "options": [
      "若望·保祿二世",
      "馬克盧斯",
      "希倫二世",
      "鮑林"
    ],
    "answer": "若望·保祿二世"
  },
  {
    "question": "居禮夫人原名瑪麗亞，她出生於哪一個國家？",
    "options": [
      "法國",
      "波蘭",
      "瑞典",
      "德國"
    ],
    "answer": "波蘭"
  },
  {
    "question": "居禮夫人年輕時與二姊偷偷加入什麼組織繼續研讀科學？",
    "options": [
      "皇家學會",
      "耶穌會",
      "隱形大學",
      "巴黎大學"
    ],
    "answer": "隱形大學"
  },
  {
    "question": "居禮夫婦是從哪一種廢棄物料中耗費大量時間提煉出新元素？",
    "options": [
      "廢棄瀝青",
      "煤炭碎屑",
      "石墨礦石",
      "廢棄純金"
    ],
    "answer": "廢棄瀝青"
  },
  {
    "question": "居禮夫人為了紀念她的祖國，將其中一個新元素命名為什麼？",
    "options": [
      "鐳元素",
      "釙元素",
      "鈾元素",
      "矽元素"
    ],
    "answer": "釙元素"
  },
  {
    "question": "1903年居禮夫人獲得了哪一個領域的諾貝爾獎？",
    "options": [
      "化學獎",
      "生理醫學獎",
      "和平獎",
      "物理獎"
    ],
    "answer": "物理獎"
  },
  {
    "question": "居禮先生因意外過世後，居禮夫人於1911年又獨自獲得了什麼獎？",
    "options": [
      "諾貝爾化學獎",
      "醫療奉獻獎",
      "諾貝爾物理獎",
      "菲爾茲獎"
    ],
    "answer": "諾貝爾化學獎"
  },
  {
    "question": "第一次世界大戰開始後，居禮夫人改造了什麼車輛協助救人？",
    "options": [
      "蒸汽裝甲車",
      "醫療照射車",
      "救護手術車",
      "提水車"
    ],
    "answer": "醫療照射車"
  },
  {
    "question": "誰曾讚嘆居禮夫人是「世界上唯一一個沒被盛名腐化的人」？",
    "options": [
      "牛頓",
      "波以耳",
      "愛因斯坦",
      "皮耶·居禮"
    ],
    "answer": "愛因斯坦"
  },
  {
    "question": "經過一世紀到現在，居禮夫人留下的日常用品仍殘留著什麼？",
    "options": [
      "強烈輻射",
      "傳染病毒",
      "水銀劇毒",
      "黑色瀝青"
    ],
    "answer": "強烈輻射"
  },
  {
    "question": "居禮家族實力驚人，總共獲得了幾次共幾人的諾貝爾獎卓越成就？",
    "options": [
      "兩次三人",
      "三次五人",
      "四次四人",
      "五次五人"
    ],
    "answer": "三次五人"
  }
];

// 2. Audio Synthesizer (Web Audio API)
const SoundFX = {
  ctx: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  play(freq, type, duration, delay = 0) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        // Exponential decay
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn("Audio synthesis error:", e);
      }
    }, delay * 1000);
  },

  playClick() {
    this.play(800, 'sine', 0.05);
  },

  playSuccess() {
    // Upward arpeggio
    this.play(523.25, 'triangle', 0.1, 0);      // C5
    this.play(659.25, 'triangle', 0.1, 0.08);   // E5
    this.play(783.99, 'triangle', 0.15, 0.16);  // G5
    this.play(1046.50, 'triangle', 0.25, 0.24); // C6
  },

  playFail() {
    // Double downward buzz
    this.play(196.00, 'sawtooth', 0.15, 0);     // G3
    this.play(130.81, 'sawtooth', 0.3, 0.12);   // C3
  },

  playCoin() {
    this.play(987.77, 'sine', 0.08, 0);         // B5
    this.play(1318.51, 'sine', 0.25, 0.08);     // E6
  },

  playDice() {
    // Rapid tick sounds
    for (let i = 0; i < 6; i++) {
      this.play(300 + i * 100, 'sine', 0.04, i * 0.06);
    }
  },

  playWin() {
    // Triumph arpeggio
    const notes = [523, 659, 784, 1046, 784, 1046, 1318];
    notes.forEach((f, idx) => {
      this.play(f, 'sine', 0.2, idx * 0.12);
    });
  }
};

// 3. Platform State Manager
const ArcadeState = {
  student: {
    class: localStorage.getItem('arcade_student_class') || '',
    seat: localStorage.getItem('arcade_student_seat') || '',
    name: localStorage.getItem('arcade_student_name') || ''
  },
  apiUrl: localStorage.getItem('arcade_api_url') || 'https://script.google.com/macros/s/AKfycbwQTUHb4mxUA8pf3rFpKoIFn5NjME-EJyFFfBuJJGJvd0ihwzDKUStF3fi1dqNKuJL1kw/exec',
  currentPool: 'default',
  pools: {
    'default': DEMO_QUESTIONS,
    'review_02': 複習02_答案是文字,
    'review_03': 複習03_正確答案是文字
  },
  cloudQuestions: null,
  questions: [...DEMO_QUESTIONS],
  isDemoMode: false,

  setPool(poolKey) {
    this.currentPool = poolKey;
    if (poolKey === 'cloud') {
      this.questions = this.cloudQuestions || [];
    } else {
      if (this.pools[poolKey]) {
        this.questions = [...this.pools[poolKey]];
      } else {
        this.questions = [...DEMO_QUESTIONS];
      }
    }
  },
  history: JSON.parse(localStorage.getItem('arcade_play_history') || '[]'),
  currentGame: null,

  getMultipleChoiceQuestion(q) {
    if (q.options && Array.isArray(q.options)) {
      let ansIndex = 0;
      if (typeof q.answer === 'number') {
        ansIndex = q.answer;
      } else {
        const correctText = q.answer.toString().trim();
        const foundIndex = q.options.findIndex(opt => opt.toString().trim() === correctText);
        ansIndex = foundIndex !== -1 ? foundIndex : 0;
      }
      return {
        question: q.question,
        options: q.options,
        answer: ansIndex,
        explanation: q.explanation || ""
      };
    }
    
    const correctText = q.answer;
    
    // Get all other distinct answers from pool
    let otherAnswers = Array.from(new Set(
      this.questions
        .map(x => x.answer)
        .filter(ans => ans !== correctText && ans !== "")
    ));
    
    // Shuffle other answers
    otherAnswers = this.shuffleArray(otherAnswers);
    
    // Select 3 incorrect answers (distractors)
    const distractors = otherAnswers.slice(0, 3);
    
    // If not enough distractors, fill with mock choices
    while (distractors.length < 3) {
      const mockOptions = ["錯誤選項A", "錯誤選項B", "錯誤選項C", "錯誤選項D"];
      const nextMock = mockOptions.find(o => o !== correctText && !distractors.includes(o));
      distractors.push(nextMock || `選項 ${distractors.length + 1}`);
    }
    
    // Combine and shuffle
    const finalOptions = [correctText, ...distractors];
    const shuffledOptions = this.shuffleArray(finalOptions);
    const correctIndex = shuffledOptions.indexOf(correctText);
    
    return {
      question: q.question,
      options: shuffledOptions,
      answer: correctIndex,
      explanation: q.explanation || ""
    };
  },

  getRandomQuestions(count = 20) {
    const shuffled = this.shuffleArray([...this.questions]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  },

  saveStudent(studentClass, seat, name) {
    this.student.class = studentClass.trim();
    this.student.seat = seat.trim();
    this.student.name = name.trim();
    
    localStorage.setItem('arcade_student_class', this.student.class);
    localStorage.setItem('arcade_student_seat', this.student.seat);
    localStorage.setItem('arcade_student_name', this.student.name);
  },

  clearStudent() {
    this.student.class = '';
    this.student.seat = '';
    this.student.name = '';
    localStorage.removeItem('arcade_student_class');
    localStorage.removeItem('arcade_student_seat');
    localStorage.removeItem('arcade_student_name');
  },

  setApiUrl(url) {
    this.apiUrl = url.trim();
    localStorage.setItem('arcade_api_url', this.apiUrl);
    this.isDemoMode = (this.apiUrl.length === 0);
  },

  addHistory(gameName, score, correct, total, status) {
    const record = {
      game: gameName,
      name: this.student.name || "測試玩家",
      correct: correct,
      total: total,
      score: score,
      status: status,
      time: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    };
    this.history.unshift(record);
    if (this.history.length > 20) this.history.pop();
    localStorage.setItem('arcade_play_history', JSON.stringify(this.history));
    this.renderHistory();
  },

  renderHistory() {
    const listContainer = document.getElementById('history-list');
    if (!listContainer) return;
    
    if (this.history.length === 0) {
      listContainer.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">尚未有遊玩記錄，快開始第一局吧！</td>
        </tr>
      `;
      return;
    }
    
    listContainer.innerHTML = this.history.map(record => {
      let statusClass = 'demo';
      let statusText = '單機模式';
      if (record.status === 'success') {
        statusClass = 'success';
        statusText = '已存入雲端';
      } else if (record.status === 'failed') {
        statusClass = 'error';
        statusText = '上傳失敗';
      }
      
      return `
        <tr>
          <td><strong>${record.game}</strong></td>
          <td>${record.name}</td>
          <td>${record.correct} 題</td>
          <td>${record.total} 題</td>
          <td><span class="accent-text" style="font-weight:bold">${record.score}</span></td>
          <td><span class="status-pill ${statusClass}">${statusText}</span></td>
          <td style="font-size:0.8rem; color:var(--text-muted)">${record.time}</td>
        </tr>
      `;
    }).join('');
  }
};

// Helper to update question pool select options dynamically
function updatePoolSelectUI() {
  const poolSelect = document.getElementById('question-pool-select');
  if (!poolSelect) return;
  
  let cloudOption = poolSelect.querySelector('option[value="cloud"]');
  
  if (ArcadeState.cloudQuestions && ArcadeState.cloudQuestions.length > 0) {
    if (!cloudOption) {
      cloudOption = document.createElement('option');
      cloudOption.value = 'cloud';
      cloudOption.textContent = `雲端試算表題庫 (Apps Script - 共 ${ArcadeState.cloudQuestions.length} 題)`;
      poolSelect.appendChild(cloudOption);
    } else {
      cloudOption.textContent = `雲端試算表題庫 (Apps Script - 共 ${ArcadeState.cloudQuestions.length} 題)`;
    }
  } else {
    if (cloudOption) {
      cloudOption.remove();
      if (poolSelect.value === 'cloud') {
        poolSelect.value = 'default';
        ArcadeState.setPool('default');
        localStorage.setItem('arcade_selected_pool', 'default');
      }
    }
  }
}

// 4. API Service Integration
const GAS_API = {
  async testAndSaveConnection(url) {
    if (!url) {
      ArcadeState.setApiUrl('');
      ArcadeState.cloudQuestions = null;
      updatePoolSelectUI();
      return { success: true, message: "已切換回單機測試模式。" };
    }
    
    try {
      const res = await fetch(`${url}?action=read_questions`);
      const json = await res.json();
      
      if (json.status === 'success') {
        ArcadeState.setApiUrl(url);
        ArcadeState.cloudQuestions = json.data.length > 0 ? json.data : null;
        updatePoolSelectUI();
        
        // Auto select cloud pool
        const poolSelect = document.getElementById('question-pool-select');
        if (poolSelect) {
          poolSelect.value = 'cloud';
          ArcadeState.setPool('cloud');
          localStorage.setItem('arcade_selected_pool', 'cloud');
        }
        
        return { 
          success: true, 
          message: `連線成功！共讀取到 ${json.data.length} 題庫。`
        };
      } else {
        return { success: false, message: "伺服器回傳錯誤：" + json.message };
      }
    } catch (e) {
      print_err = e;
      console.error(e);
      return { success: false, message: "連線測試失敗。請確認 Apps Script 部署 URL 是否正確且已設為「任何人」存取。" };
    }
  },

  async fetchQuestionsSilent() {
    if (ArcadeState.isDemoMode || !ArcadeState.apiUrl) return;
    try {
      const res = await fetch(`${ArcadeState.apiUrl}?action=read_questions`);
      const json = await res.json();
      if (json.status === 'success' && json.data.length > 0) {
        ArcadeState.cloudQuestions = json.data;
        updatePoolSelectUI();
        
        const savedPool = localStorage.getItem('arcade_selected_pool') || 'default';
        if (savedPool === 'cloud') {
          const poolSelect = document.getElementById('question-pool-select');
          if (poolSelect) poolSelect.value = 'cloud';
          ArcadeState.setPool('cloud');
        }
      }
    } catch (e) {
      console.warn("Failed silent fetch of questions, using cached.", e);
    }
  },

  async logScore(gameName, score, correct, total) {
    if (ArcadeState.isDemoMode || !ArcadeState.apiUrl) {
      ArcadeState.addHistory(gameName, score, correct, total, 'demo');
      return { success: true, demo: true };
    }
    
    try {
      const url = `${ArcadeState.apiUrl}?action=log_score&name=${encodeURIComponent(ArcadeState.student.name)}&class=${encodeURIComponent(ArcadeState.student.class)}&seat=${encodeURIComponent(ArcadeState.student.seat)}&game=${encodeURIComponent(gameName)}&score=${score}&correct=${correct}&total=${total}`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.status === 'success') {
        ArcadeState.addHistory(gameName, score, correct, total, 'success');
        return { success: true };
      } else {
        ArcadeState.addHistory(gameName, score, correct, total, 'failed');
        return { success: false, message: json.message };
      }
    } catch (e) {
      console.error("Score logging failed:", e);
      ArcadeState.addHistory(gameName, score, correct, total, 'failed');
      return { success: false, message: "網路傳輸失敗，無法寫入 Google Sheets。" };
    }
  }
};

// 5. Particle Effects System
const LobbyParticles = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,

  init() {
    this.canvas = document.getElementById('bg-particles');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push(this.createParticle());
    }

    this.animate();
  },

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2, // Drifts slightly upwards
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 0, 127, 0.15)'
    };
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }
};

// 6. Generic Question Overlay Modal Manager
const QuestionModal = {
  timerId: null,
  
  show(questionObj, durationSeconds = 20, onAnsweredCallback) {
    const modal = document.getElementById('question-modal');
    const qText = document.getElementById('modal-question-text');
    const optContainer = document.getElementById('modal-options-container');
    const feedback = document.getElementById('modal-feedback');
    const fText = document.getElementById('modal-feedback-text');
    const expText = document.getElementById('modal-explanation-text');
    const nextBtn = document.getElementById('btn-next-question');
    const timerBar = document.getElementById('question-timer-bar');

    // Clean states
    clearTimeout(this.timerId);
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    optContainer.innerHTML = '';
    
    // Set text
    qText.textContent = questionObj.question;
    
    // Set timer duration variable in CSS
    timerBar.style.setProperty('--duration', `${durationSeconds}s`);
    // Restart animation
    timerBar.style.animation = 'none';
    timerBar.offsetHeight; /* trigger reflow */
    timerBar.style.animation = null;

    let hasSelected = false;

    // Render options
    questionObj.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
        <span class="option-content">${optText}</span>
      `;
      
      btn.addEventListener('click', () => {
        if (hasSelected) return;
        hasSelected = true;
        
        clearTimeout(this.timerId);
        // Disable timer animation
        timerBar.style.animation = 'none';
        
        const isCorrect = (index === questionObj.answer);
        
        // Disable all option buttons
        document.querySelectorAll('.option-btn').forEach((b, i) => {
          b.disabled = true;
          if (i === questionObj.answer) {
            b.classList.add('correct');
          } else if (i === index && !isCorrect) {
            b.classList.add('wrong');
          }
        });

        // Show feedback
        feedback.classList.remove('hidden');
        feedback.className = `question-feedback ${isCorrect ? 'success' : 'error'}`;
        fText.textContent = isCorrect ? "🎉 答對了！太棒了！" : `❌ 答錯了！正確答案是 ${String.fromCharCode(65 + questionObj.answer)}`;
        expText.textContent = questionObj.explanation ? `解析：${questionObj.explanation}` : "";
        
        // Play Sound
        if (isCorrect) {
          SoundFX.playSuccess();
        } else {
          SoundFX.playFail();
        }
        
        nextBtn.classList.remove('hidden');
        
        // Save choice callback
        nextBtn.onclick = () => {
          SoundFX.playClick();
          modal.classList.add('hidden');
          onAnsweredCallback(isCorrect);
        };
      });
      
      optContainer.appendChild(btn);
    });

    modal.classList.remove('hidden');

    // Trigger timer timeout
    this.timerId = setTimeout(() => {
      if (hasSelected) return;
      hasSelected = true;
      
      // Auto wrong
      document.querySelectorAll('.option-btn').forEach((b, i) => {
        b.disabled = true;
        if (i === questionObj.answer) b.classList.add('correct');
      });

      feedback.classList.remove('hidden');
      feedback.className = 'question-feedback error';
      fText.textContent = `⏰ 時間到！正確答案是 ${String.fromCharCode(65 + questionObj.answer)}`;
      expText.textContent = questionObj.explanation ? `解析：${questionObj.explanation}` : "";
      
      SoundFX.playFail();
      
      nextBtn.classList.remove('hidden');
      nextBtn.onclick = () => {
        SoundFX.playClick();
        modal.classList.add('hidden');
        onAnsweredCallback(false);
      };
    }, durationSeconds * 1000);
  }
};

// 7. Global Initializer & Lobby Binding
window.addEventListener('DOMContentLoaded', () => {
  // A. Initialize Lucide Icons
  lucide.createIcons();

  // Setup Question Pool Selection Event Handlers
  const poolSelect = document.getElementById('question-pool-select');
  if (poolSelect) {
    const savedPool = localStorage.getItem('arcade_selected_pool') || 'default';
    poolSelect.value = savedPool;
    ArcadeState.setPool(savedPool);
    
    poolSelect.addEventListener('change', (e) => {
      SoundFX.playClick();
      const selectedPool = e.target.value;
      ArcadeState.setPool(selectedPool);
      localStorage.setItem('arcade_selected_pool', selectedPool);
    });
  }


  // B. Run background particles
  LobbyParticles.init();

  // C. Determine Initial Connection State
  ArcadeState.isDemoMode = (ArcadeState.apiUrl.length === 0);
  const banner = document.getElementById('connection-banner');
  if (ArcadeState.isDemoMode) {
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
    GAS_API.fetchQuestionsSilent(); // Silent reload in background
  }
  
  // Render past history
  ArcadeState.renderHistory();

  // D. Handle Student Profile Login
  const studentForm = document.getElementById('student-form');
  const studentBadge = document.getElementById('student-badge');
  const badgeName = document.getElementById('badge-display-name');
  const logoutBtn = document.getElementById('btn-logout');
  const gameCards = document.querySelectorAll('.game-card');

  const updateLoginUI = () => {
    if (ArcadeState.student.name) {
      studentForm.classList.add('hidden');
      studentBadge.classList.remove('hidden');
      badgeName.textContent = `${ArcadeState.student.name} (${ArcadeState.student.class}班 ${ArcadeState.student.seat}號)`;
      
      // Unlock games
      gameCards.forEach(card => {
        card.classList.remove('locked');
        card.querySelector('.start-game-btn').disabled = false;
      });
    } else {
      studentForm.classList.remove('hidden');
      studentBadge.classList.add('hidden');
      
      // Lock games
      gameCards.forEach(card => {
        card.classList.add('locked');
        card.querySelector('.start-game-btn').disabled = true;
      });
    }
  };
  
  // Fill initial form values if saved
  document.getElementById('student-class').value = ArcadeState.student.class;
  document.getElementById('student-seat').value = ArcadeState.student.seat;
  document.getElementById('student-name').value = ArcadeState.student.name;
  updateLoginUI();

  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const cls = document.getElementById('student-class').value.trim();
    const seat = document.getElementById('student-seat').value.trim();
    const name = document.getElementById('student-name').value.trim();
    
    if (!cls) {
      alert('請填寫班級！');
      document.getElementById('student-class').focus();
      return;
    }
    if (!seat) {
      alert('請填寫座號！');
      document.getElementById('student-seat').focus();
      return;
    }
    if (!name) {
      alert('請填寫姓名！');
      document.getElementById('student-name').focus();
      return;
    }
    
    SoundFX.playCoin();
    ArcadeState.saveStudent(cls, seat, name);
    updateLoginUI();
  });

  logoutBtn.addEventListener('click', () => {
    SoundFX.playClick();
    if (confirm("確認要切換或登出玩家嗎？")) {
      ArcadeState.clearStudent();
      updateLoginUI();
    }
  });

  // E. Settings Modal Bindings
  const settingsModal = document.getElementById('settings-modal');
  const openSettings = document.getElementById('open-settings');
  const closeSettings = document.getElementById('close-settings');
  const saveSettingsBtn = document.getElementById('btn-test-api');
  const apiUrlInput = document.getElementById('settings-api-url');

  openSettings.addEventListener('click', () => {
    SoundFX.playClick();
    apiUrlInput.value = ArcadeState.apiUrl;
    settingsModal.classList.remove('hidden');
  });

  closeSettings.addEventListener('click', () => {
    SoundFX.playClick();
    settingsModal.classList.add('hidden');
  });

  saveSettingsBtn.addEventListener('click', async () => {
    saveSettingsBtn.disabled = true;
    saveSettingsBtn.innerHTML = '<i data-lucide="refresh-cw" class="animate-spin"></i> 測試中...';
    lucide.createIcons();
    
    const res = await GAS_API.testAndSaveConnection(apiUrlInput.value);
    
    saveSettingsBtn.disabled = false;
    saveSettingsBtn.innerHTML = '<i data-lucide="refresh-cw"></i> 測試連線並儲存';
    lucide.createIcons();
    
    alert(res.message);
    
    if (res.success) {
      settingsModal.classList.add('hidden');
      if (ArcadeState.isDemoMode) {
        banner.style.display = 'flex';
      } else {
        banner.style.display = 'none';
      }
    }
  });

  // F. Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    SoundFX.playClick();
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('arcade_theme', newTheme);
  });
  
  const savedTheme = localStorage.getItem('arcade_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // G. Game exit button handler
  document.getElementById('btn-exit-game').addEventListener('click', () => {
    SoundFX.playClick();
    if (confirm("確認要退出目前的遊戲嗎？您的成績可能不會存檔。")) {
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      if (ArcadeState.currentGame && typeof ArcadeState.currentGame.destroy === 'function') {
        ArcadeState.currentGame.destroy();
      }
      ArcadeState.currentGame = null;
    }
  });

  // H. Start Game Cards Handlers
  gameCards.forEach(card => {
    const startBtn = card.querySelector('.start-game-btn');
    startBtn.addEventListener('click', () => {
      if (card.classList.contains('locked')) return;
      SoundFX.playCoin();
      
      const gameType = card.dataset.game;
      let gameEngine = null;
      
      if (gameType === 'monopoly') {
        gameEngine = MonopolyGame;
      } else if (gameType === 'match') {
        gameEngine = MatchGame;
      } else if (gameType === 'mole') {
        gameEngine = MoleGame;
      } else if (gameType === 'treasure') {
        gameEngine = TreasureGame;
      } else if (gameType === 'shooter') {
        gameEngine = ShooterGame;
      } else if (gameType === 'racer') {
        gameEngine = RacerGame;
      } else if (gameType === 'archery') {
        gameEngine = ArcheryGame;
      } else if (gameType === 'jumper') {
        gameEngine = JumperGame;
      } else if (gameType === 'flip') {
        gameEngine = FlipGame;
      } else if (gameType === 'puzzle') {
        gameEngine = PuzzleGame;
      } else if (gameType === 'balloon') {
        gameEngine = BalloonGame;
      } else if (gameType === 'miner') {
        gameEngine = MinerGame;
      } else if (gameType === 'arena') {
        gameEngine = ArenaGame;
      } else if (gameType === 'buzzer') {
        gameEngine = BuzzerGame;
      } else if (gameType === 'fisher') {
        gameEngine = FisherGame;
      } else if (gameType === 'slots') {
        gameEngine = SlotsGame;
      } else if (gameType === 'lava') {
        gameEngine = LavaGame;
      } else if (gameType === 'pancake') {
        gameEngine = PancakeGame;
      } else if (gameType === 'catch') {
        gameEngine = CatchGame;
      } else if (gameType === 'dodge') {
        gameEngine = DodgeGame;
      } else if (gameType === 'stack') {
        gameEngine = StackGame;
      } else if (gameType === 'spin') {
        gameEngine = SpinGame;
      } else if (gameType === 'paint') {
        gameEngine = PaintGame;
      } else if (gameType === 'tower') {
        gameEngine = TowerGame;
      } else if (gameType === 'snake') {
        gameEngine = SnakeGame;
      } else if (gameType === 'pong') {
        gameEngine = PongGame;
      } else if (gameType === 'quizrace') {
        gameEngine = QuizRaceGame;
      }
      
      if (gameEngine) {
        // Setup Stage UI
        document.getElementById('arcade-lobby').classList.add('hidden');
        document.getElementById('game-stage').classList.remove('hidden');
        document.getElementById('game-player-name').textContent = ArcadeState.student.name;
        
        ArcadeState.currentGame = gameEngine;
        gameEngine.init();
      }
    });
  });
});
