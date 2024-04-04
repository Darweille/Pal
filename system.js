let listPalAll = []
let listPalShowing = [];
let listBreedResult = [];

//能力名稱, 篩選等級, 能力等級上限
let listWorks =
[
	["Kindling", 0, 0],
	["Watering", 0, 0],
	["Planting", 0, 0],
	["Electricity", 0, 0],
	["Handiwork", 0, 0],
	["Gathering", 0, 0],
	["Lumbering", 0, 0],
	["Mining", 0 ,0],
	["Medicine", 0, 0],
	["Cooling", 0, 0],
	["Transporting", 0, 0],
	["Farming", 0, 0]
];

const listElements =
[
	["Neutral"],
	["Fire"],
	["Water"],
	["Grass"],
	["Electric"],
	["Ice"],
	["Ground"],
	["Dark"],
	["Dragon"]
];

const listLanguage =
[
	["English", "en"],
	["Chinese (Simplified)", "zh-hans"],
	["Chinese (Traditional)", "zh-hant"],
	["Japanese", "ja"]
]

let filterExpandDetails;
let filterTypeBOnly;
let filterFood = [0, 0];
let filterElement = [];

let selectedPal = [];
let selectedLanguage;

let databasePalUnique = [];

const iconExpand = "images/expand.png";
const iconCollapse = "images/collapse.png";
const iconCheckboxOff = "images/checkbox_off.png";
const iconCheckboxOn = "images/checkbox_on.png";

let messageIndex;

let timer;

let setPalBredDetails = -1;

let stringsLibrary = {};

//頁面讀取完成時
window.onload = function()
{
	//處理使用者的習慣語言
	const savedLanguage = localStorage.getItem("language"); //讀取localStorage中的language
	
	//依據儲存的語言設定自動選擇語言
	if (savedLanguage) selectedLanguage = savedLanguage;
	else
	{
		//依瀏覽器的語言來選擇
		switch (navigator.language.toLowerCase())
		{
			case "ja":
			case "ja-jp":
				selectedLanguage = "ja";
				break;
			case "zh-cn":
			case "zh-chs":
			case "zh-my":
			case "zh-sg":
				selectedLanguage = "zh-hans";
				break;
			case "zh-hk":
			case "zh-mo":
			case "zh-tw":
			case "zh-cht":
				selectedLanguage = "zh-hant";
				break;
			default:
				selectedLanguage = "en";
				break;
		}
	}
	
	const htmlMenuLanguage = listLanguage.map(([name, code]) => `\n<div id="${code}"><img src="images/language_options.png"><span>${name}</span></div>`).join('');
	document.querySelector("#divLanguageMenu").innerHTML = htmlMenuLanguage;
	document.querySelector("#divLanguageMenu").classList.add("hidden");
	
	changeLanguage(selectedLanguage); //依據選擇的語言切換
	
	document.querySelector("#divMenu").classList.add("hidden");
	
	//處理使用者的篩選習慣
	//const checkExpandDetails = document.querySelector("#checkExpandDetails");
	//const checkTypeBOnly = document.querySelector("#checkTypeBOnly");
	
	//讀取localStorage中的值並自動勾選
	//checkExpandDetails.checked = localStorage.getItem("checkExpandDetails") == "true" ? true : false;
	//checkTypeBOnly.checked = localStorage.getItem("checkTypeBOnly") == "true" ? true : false;
	
	filterTypeBOnly = localStorage.getItem("filterTypeBOnly") == "true" ? true : false;
	filterExpandDetails =localStorage.getItem("filterExpandDetails") == "true" ? true : false;
	
	document.querySelector("#divTypeBOnly").classList.toggle("clicked", filterTypeBOnly);
	document.querySelector("#divShowDetails").classList.toggle("clicked", filterExpandDetails);
	
	document.querySelector("#divTypeBOnly").querySelector("img").src = filterTypeBOnly ? iconCheckboxOn : iconCheckboxOff;
	document.querySelector("#divShowDetails").querySelector("img").src = filterExpandDetails ? iconCheckboxOn : iconCheckboxOff;
	
	//製作屬性篩選器
	const htmlFilterElement = listElements.map(([name]) => `\n
		<div id="buttonFliterElements${name}">
			<img src="images/elements/0/${name.toLowerCase()}.png">
			<span class="classElement${name}">${stringsLibrary[`stringElement${name}`]}</span>
		</div>`).join('');
	
	//製作工作能力篩選器
	const htmlFilterWork = listWorks.map(([name]) => `\n
		<div id="buttonFliterWorks${name}">
			<img src="images/works/2/${name.toLowerCase()}.png">
			<span class="classWork${name}">${stringsLibrary[`stringWork${name}`]}</span><span id="levelFilterWork${name}"></span>
		</div>`).join('');
	
	//製作食量篩選器
	const htmlFilterFood = `\n
		<div id="buttonFliterFood">
			<img src="images/food/2/food.png">
			<span class="classFood">${stringsLibrary["stringFood"]}</span><span id="levelFilterFood"></span>
		</div>`
	
	
	document.querySelector("#divFilterElements").innerHTML = htmlFilterElement; //寫入屬性篩選器
	document.querySelector("#divFilterWorks").innerHTML = htmlFilterWork + htmlFilterFood; //寫入技能篩選器
	document.querySelector("#divPalsData").innerHTML = convertDatasetToHTML(databasePal, '', listPalAll) + "\n\t"; //寫入帕魯資料
	
	listPalShowing = listPalAll;
	
	//遍歷整個文庫為帕魯資料庫加入各語言的名稱關鍵字
	databaseTranslations.forEach(dataset => 
	{
		const tag = dataset.tag;
		
		if (tag.startsWith("classPalName"))
		{
			const targetPal = getPal(tag);
			const arrayNames = Object.entries(dataset).filter(([key]) => key !== "tag").map(([, value]) => value);
			targetPal.keywords = arrayNames; //將各語言的名稱加入關鍵字
		}
	});
	
	databasePalUnique = databaseCombos.filter(Pal => Pal.unique == true);
	
	databasePal.forEach(Pal =>
	{
		Pal["unique"] = false;
		Pal["parents"] = [];
		
		const uniquePal = databasePalUnique.find(uniquePal => uniquePal.indexInner == Pal.indexInner);
		
		if (uniquePal)
		{
			Pal["unique"] = true;
			Pal["parents"] = uniquePal.parents;
		}
	});
	
	document.querySelector("#divStickyBottom").classList.add("hidden");
	
	if (typeof databaseVersion !== "undefined")
	{
		document.querySelector("#spanDataVersion").innerHTML += `Palworld Version: ${databaseVersion}`; //引入database內的版本號
	}
	
	//用裝置是否支援滑鼠懸停事件來判斷使用者是否使用滑鼠
	if (window.matchMedia("(hover: hover)").matches || "ontouchstart" in window == false)
	{
		document.querySelector("body").onmouseover = startTimer;
		document.querySelector("body").onmouseout = clearTimer;
		document.querySelector("body").ondblclick = whileDoubleClick;
	}
	
	document.querySelector("body").onclick = whileClick;
	
	filterPal(); //再依據預設狀態篩選一次
}

//當語言變更時
function changeLanguage(language)
{
	localStorage.setItem("language", language);
	selectedLanguage = language;
	
	//遍歷整個文庫
	databaseTranslations.forEach(dataset => 
	{
		const tag = dataset.tag;
		
		//處理開頭為class或id的資料
		if (tag.startsWith("class") || tag.startsWith("id"))
		{
			//更換帕魯資料庫的名稱
			if (tag.startsWith("classPalName"))
			{
				const targetPal = getPal(tag);
				targetPal.name = dataset[language];
			}
			
			let element;
			
			if (tag.startsWith("id"))
			{
				element = document.querySelectorAll(`#${dataset.tag}`);
			}
			else
			{
				element = document.querySelectorAll(`.${dataset.tag}`);
			}
			
			if (element)
			{
				element.forEach(element =>
				{
					element.textContent = dataset[language];
				});
			}
		}
		
		//開頭為string的資料更新到字串資料庫
		else if (tag.startsWith("string"))
		{
			stringsLibrary[tag] = dataset[language];
		}
		
		//決定標題
		else if (tag.startsWith("titleHTML"))
		{
			document.title = dataset[language];
		}
	});
	
	//決定當前選擇的是哪一個語言選項
	document.querySelectorAll("#divLanguageMenu div").forEach(function(div)
	{
		div.classList.remove("clicked");
		
		if (div.id == language) div.classList.add("clicked");
	});
	
	document.querySelector("#inputPalID").placeholder = stringsLibrary["stringSearchPlaceholder"];
	
	updateMessage(); //更新結果訊息
}

//把指定的資料集轉換成HTML格式
function convertDatasetToHTML(dataset, modeConvert, listConverted)
{
	let htmlResult = ``;
	
	//遍歷整個帕魯資料庫
	dataset.forEach(Pal =>
	{
		const PalID = `${Pal.indexDex}${Pal.suffix}`;
		const PalNumber = Pal.indexDex.toString().padStart(3, "0"); //編號補零
		const PalSuffix = Pal.suffix.toUpperCase(); //將型態文字轉為大寫用以顯示在編號後
		
		//製作帕魯的屬性圖案
		const htmlPalElement = Pal.typeElement.map(name => `<img src="images/elements/1/${name}.png">`).join(''); //遍歷帕魯的屬性並加入對應的圖案
		
		//製作帕魯的工作能力資料表
		const htmlPalWorks = listWorks.map(([name], index) =>
		{
			const path = Pal.works[index] > 0 ? `images/works/1/${name}.png` : `images/works/0/${name}.png`;
			const level = Pal.works[index] > 0 ? Pal.works[index] : '';
			
			if (Pal.works[index] > listWorks[index][2]) listWorks[index][2] = Pal.works[index]; //若帕魯的技能等級大於listWorks中的最高等級則替代
			
			return `<div class="divPalWorks"><img src="${path}"><span>${level}</span></div>`
		}).join('');
		
		let tempExpandDetails = filterExpandDetails;
		
		if (modeConvert.toLowerCase().includes("bred") && setPalBredDetails != -1)
		{
			tempExpandDetails = setPalBredDetails;
		}
		
		//依據有無勾選詳細資料來開關資料
		const pathSwitchIcon = tempExpandDetails ? iconCollapse : iconExpand;
		const classPalDetails = tempExpandDetails ? "divPalDetails" : "divPalDetails collapsed";
		
		const classPalName = `classPalName${PalID}`;
		
		if (Pal.food > filterFood[1]) filterFood[1] = Pal.food;
		
		//將此筆結果組合成HTML格式寫入
		htmlResult +=`\n
		<div id="idPal${PalID}${modeConvert}" class="divPal">
			<div class="divPalHeader">
				<div class="divPalElements">${htmlPalElement}</div>
				<div class="divPalNumber">No.${PalNumber}<span class="spanPalType">${PalSuffix}</span></div>
				<div class="divPalDetailsSwitch"><img src="${pathSwitchIcon}"></div>
			</div>
			<div class="divPalAvatar"><img onerror="this.src='images/avatars/noimg.png'" src="images/avatars/${PalID}.png"></div>
			<div class="divPalName"><span class="${classPalName}">${Pal.name}</span></div>
			<div class="${classPalDetails}">
				${htmlPalWorks}
				<div class="divPalFood"><img src="images/food/1/food.png"><span>${Pal.food}</span></div>
			</div>
		</div>`;
		
		if (listConverted) listConverted.push(Pal.indexDex + Pal.suffix); //寫入全ID清單
	});
	
	return htmlResult;
}

//篩選系統
function filterPal()
{
	let filterMode;
	
	const textInput = document.querySelector("#inputPalID").value.toLowerCase(); //搜尋內容
	
	const filterNumber = parseInt(textInput, 10); //產生純數字的目標編號
	
	if (textInput != undefined)
	{
		filterMode = 1;
		
		if (filterNumber)
		{
			filterMode = 2;
			
			if (isNaN(textInput) && textInput.includes("b"))
			{
				filterMode = 3;
			}
		}
	}
	
	let conditionals; //定義初始的名稱過濾條件
	
	let filterWork = listWorks.filter(name => name[1] > 0);
	
	listPalShowing = []; //清空欲顯示清單

	//從全資料庫中遍歷
	databasePal.forEach(Pal =>
	{
		//當有搜尋內容時
		switch (filterMode)
		{
			case 1:
				conditionals = Pal.keywords.some(keyword => keyword.toLowerCase().includes(textInput)); //以名稱篩選
				break;
			case 2:
				conditionals = Pal.indexDex == textInput; //改以編號篩選
				break;
			case 3:
				conditionals = Pal.indexDex == filterNumber && Pal.suffix == "b"; //改以編號+B型態篩選
				break;
			default:
				break;
		}
		
		//限定B型態
		if (filterTypeBOnly) { conditionals &= Pal.suffix == "b"; }
		
		//當有指定的屬性時
		if (filterElement.length > 0)
		{
			conditionals &= filterElement.every(name => Pal.typeElement.includes(name))
		}
		
		//當有指定的技能時
		if (filterWork.length > 0)
		{
			//將database裡的技能資料[0,0,0,0,1,0,0,0,0,0,1,1]轉為[名稱,等級]的格式，再留下等級大於0的資料，以對應listWorks
			const dataPalWorks = listWorks.map(([name, level], index) => { return [name, Pal.works[index]]; }).filter(([_, level]) => level > 0);
			
			let matchedWork = [];
			
			//遍歷所選取的技能
			filterWork.forEach(([filterWork, filterLevel]) =>
			{
				const foundWork = dataPalWorks.find(([work, level]) => work == filterWork && level >= filterLevel);
				
				if (foundWork != undefined)
				{
					matchedWork.push(foundWork);
				}
			});
			
			conditionals &= filterWork.length == matchedWork.length;
		}
		
		if (filterFood[0] > 0)
		{
			conditionals &= Pal.food >= filterFood[0];
		}
		
		//符合條件式則加入欲顯示清單
		if (conditionals)
		{
			listPalShowing.push(Pal.indexDex + Pal.suffix);
		}
	});
	
	hidePalsData(listPalAll);
	showPalsData(listPalShowing);
}

//隱藏全部帕魯資料
function hidePalsData(listPalsID)
{
	listPalsID.forEach(id => { document.querySelector(`#idPal${id}`).classList.add("hidden"); });
}

//顯示指定的帕魯資料
function showPalsData(listPalsID)
{
	listPalsID.forEach(id => { document.querySelector(`#idPal${id}`).classList.remove("hidden"); });
	
	togglePalDetails();
	
	switch (listPalsID.length)
	{
		case 0:
			messageIndex = 0;
			break;
		case 1:
			messageIndex = 1;
			break;
		default:
			messageIndex = 2;
			break;
	}
	
	if (listPalsID.length == listPalAll.length)
	{
		messageIndex = -1;
	}
	
	updateMessage();
}

//更新顯示訊息
function updateMessage()
{
	let messageFormatted = ``;
	
	switch (messageIndex)
	{
		case 0:
			messageFormatted = stringsLibrary["stringNoFound"];
			break;
		case 1:
			messageFormatted = stringsLibrary["stringFoundOne"].replace("${number}", listPalShowing.length);
			break;
		case 2:
			messageFormatted = stringsLibrary["stringFoundSome"].replace("${number}", listPalShowing.length);
			break;
		default:
			messageFormatted = stringsLibrary["stringTotalPals"].replace("${number}", databasePal.length);
			break;
	}
	
	document.querySelector(`#divMessages`).innerHTML = messageFormatted;
}

//刪除陣列中指定的資料
function spliceTarget(targetArray, targetData)
{
	const index = targetArray.indexOf(targetData);
	if (index !== -1) { targetArray.splice(index, 1); }
}

//以限制陣列最大數量的方式加入資料
function pushLimited(targetArray, maxLength, newData, extraMode)
{
	//當陣列數量達指定值移除最舊的值
	if (targetArray.length >= maxLength)
	{
		switch (extraMode)
		{
			case "Pal":
				document.querySelector(`#idPal${targetArray[0].indexDex}${targetArray[0].suffix}`).classList.remove("clicked");
				break;
			case "Element":
				document.querySelector(`#buttonFliterElements${targetArray[0]}`).classList.remove("clicked");
				break;
		}
		
		targetArray.shift(); //從陣列中移除最舊的那筆資料
	}
	
	targetArray.push(newData); //加入新資料
}

//勾選或取消詳細資料時
/*
function changeDetailsSwitch(checked)
{
	localStorage.setItem("checkExpandDetails", checked);
	filterExpandDetails = checked;
	togglePalDetails();
}
*/

//勾選或取消限定B型態時
/*
function changeTypeBOnly(checked)
{
	localStorage.setItem("checkTypeBOnly", checked);
	filterTypeBOnly = checked;
	filterPal();
}
*/

//開關帕魯的詳細資料
function togglePalDetails(id)
{
	//有指定id時只開關該id的資料否則為當前畫面全部的帕魯資料
	if (id)
	{
		const divPal = document.querySelector(`#${id}`);
		const divPalDetailsCollapsed = divPal.querySelector(".divPalDetails").classList.contains("collapsed"); //收起狀態
		divPal.querySelector(".divPalDetailsSwitch").querySelector("img").src = divPalDetailsCollapsed ? iconCollapse : iconExpand; //若為收起狀態，在此次點擊後為展開，切換到展開狀態須顯示的Collapse收起圖片
		divPal.querySelector(".divPalDetails").classList.toggle("collapsed");
		
		if (divPal.id.includes("Bred"))
		{
			setPalBredDetails = divPalDetailsCollapsed ? true : false;
		}
	}
	else
	{
		const divPalAll = document.querySelectorAll(".divPal");
		
		divPalAll.forEach(divPal =>
		{
			if (!divPal.id.includes("Bred"))
			{
				divPal.querySelector(".divPalDetailsSwitch").querySelector("img").src = filterExpandDetails ? iconCollapse : iconExpand;
				divPal.querySelector(".divPalDetails").classList.add("collapsed");
				
				if (filterExpandDetails)
				{
					divPal.querySelector(".divPalDetails").classList.remove("collapsed");
				}
			}
		});
	}
}

//雙擊時
function whileDoubleClick(event)
{
	const targetClicked = event.target;
	
	//若為帕魯資料
	if (targetClicked.closest(".divPal")) { togglePalDetails(targetClicked.closest(".divPal").id); }
}

//單擊時
function whileClick(event)
{
	let targetClicked = event.target;
	
	//若為帕魯資料區
	if (targetClicked.closest(".divPal"))
	{
		const idClicked = targetClicked.closest(".divPal").id;
		
		//若為詳細資料切換開關
		if (targetClicked.closest(".divPalDetailsSwitch"))
		{
			togglePalDetails(idClicked);
		}
		else
		{
			if (!idClicked.includes("Bred"))
			{
				const clickedPal = getPal(idClicked);
				
				if (selectedPal.indexOf(clickedPal) === -1)
				{
					pushLimited(selectedPal, 2, clickedPal, "Pal");
				}
				else
				{
					spliceTarget(selectedPal, clickedPal);
				}
				
				document.querySelector(`#${idClicked}`).classList.toggle("clicked");
				
				if (selectedPal.length === 2)
				{
					//選取兩個不同的帕魯後開始計算配種結果並顯示
					const datasetBreedResult = [matePals(selectedPal[0], selectedPal[1])];
					document.querySelector("#divStickyBottom").classList.remove("hidden");
					document.querySelector("#divBreedResult").innerHTML = `${convertDatasetToHTML([selectedPal[0]], "BredA")}
					<span>x</span>${convertDatasetToHTML([selectedPal[1]], "BredB")}
					<span>=</span>${convertDatasetToHTML(datasetBreedResult, "BredC")}`;
				}
				else if (selectedPal.length === 1)
				{
					
					/*
					const selectedCombos = databaseCombos.find(Pal => (Pal.number == selectedPal[0].number) && (Pal.type == selectedPal[0].type));
					
					if (selectedCombos.parents.length > 0)
					{
						console.log(selectedCombos)
						
						selectedCombos.parents.forEach(arrayParents =>
						{
							
						});
					}
					*/
					
					/*
					const selectedPalNumber = parseInt(selectedPal[0], 10);
					let selectedPalType = '';
					
					if (selectedPal[0].includes("b")) selectedPalType = "b";
					
					const selectedCombos = databaseCombos.find(dataset => (dataset.number === selectedPalNumber) && (dataset.type === selectedPalType));
					
					//document.querySelector("#divStickyBottom").classList.remove("hidden");
					//document.querySelector("#divBreedResult").innerHTML = '';
					
					selectedCombos.parents.forEach(array =>
					{
						const targetParents = array.split(",");
						const targetParents1Number = parseInt(targetParents[0], 10);
						const targetParents2Number = parseInt(targetParents[1], 10);
						
						let targetParents1Type = '';
						let targetParents2Type = '';
						
						if (targetParents[0].includes("b")) targetParents1Type = "b";
						if (targetParents[1].includes("b")) targetParents2Type = "b";
						
						const targetParent1 = [databasePal.find(dataset => (dataset.number === targetParents1Number) && (dataset.type === targetParents1Type))];
						const targetParent2 = [databasePal.find(dataset => (dataset.number === targetParents2Number) && (dataset.type === targetParents2Type))];
						const targetSelf = [databasePal.find(dataset => (dataset.number === selectedPalNumber) && (dataset.type === selectedPalType))];
						
						//console.log(targetParent1)
						//console.log(targetParent2)
						//console.log(targetSelf)
						
						//document.querySelector("#divBreedResult").innerHTML += `<div>${convertDatasetToHTML(targetParent1, "ParentsA")}
						//<span>x</span>${convertDatasetToHTML(targetParent2, "ParentsB")}
						//<span>=</span>${convertDatasetToHTML(targetSelf, "Self")}</div>`;
					});
					
					console.log([selectedCombos])
					*/
				}
				else if (selectedPal.length === 0)
				{
					//若都沒有選取帕魯則淨空配種結果區
					document.querySelector("#divBreedResult").innerHTML = '';
					document.querySelector("#divStickyBottom").classList.add("hidden");
				}
			}
		}
	}
	
	else if (targetClicked.closest("#divSearch img"))
	{
		document.querySelector("#divMenu").classList.toggle("hidden");
	}
	
	//若為語言切換按鈕
	else if (targetClicked.closest("#divLanguageMenu div"))
	{
		const codeLanguage = targetClicked.closest("#divLanguageMenu div").id;
		
		changeLanguage(codeLanguage)
	}
	
	else if (targetClicked.closest("#divLanguage"))
	{
		document.querySelector("#divLanguage").classList.toggle("clicked");
		document.querySelector("#divLanguageMenu").classList.toggle("hidden");
	}
	
	else if (targetClicked.closest("#divTypeBOnly"))
	{
		filterTypeBOnly = !filterTypeBOnly;
		localStorage.setItem("filterTypeBOnly", filterTypeBOnly);
		
		targetClicked.closest("#divTypeBOnly").querySelector("img").src = filterTypeBOnly ? iconCheckboxOn : iconCheckboxOff;
		targetClicked.closest("#divTypeBOnly").classList.toggle("clicked", filterTypeBOnly);
		
		filterPal();
	}
	
	else if (targetClicked.closest("#divShowDetails"))
	{
		filterExpandDetails = !filterExpandDetails;
		localStorage.setItem("filterExpandDetails", filterExpandDetails);
		
		targetClicked.closest("#divShowDetails").querySelector("img").src = filterExpandDetails ? iconCheckboxOn : iconCheckboxOff;
		targetClicked.closest("#divShowDetails").classList.toggle("clicked", filterExpandDetails);
		
		togglePalDetails();
	}
	
	//若為屬性篩選按鈕
	else if (targetClicked.closest("#divFilterElements div"))
	{
		targetClicked = targetClicked.closest("#divFilterElements div"); //把目標定位到屬性按鈕最上層
		
		const clickedElement = listElements.find(([name]) => targetClicked.id.includes(name))[0];
		
		const checkIndex = filterElement.indexOf(clickedElement);
		
		if (checkIndex !== -1)
		{
			filterElement.splice(checkIndex, 1); //從清單中移除
		}
		else
		{
			pushLimited(filterElement, 2, clickedElement, "Element"); //以最多2選的方式加入陣列清單
		}
		
		targetClicked.classList.toggle("clicked");
		
		filterPal();
	}
	
	//若為工作能力篩選按鈕
	else if (targetClicked.closest("#divFilterWorks div"))
	{
		targetClicked = targetClicked.closest("#divFilterWorks div");
		targetClicked.classList.add("clicked");
		
		//若點擊的是食量
		if (targetClicked.closest("#buttonFliterFood"))
		{
			//讓食量篩選從2開始，再逐次+1
			filterFood[0] += filterFood[0] < 2 ? 2 : 1;
			
			//超過最大值時
			if (filterFood[0] > filterFood[1])
			{
				filterFood[0] = 0;
				targetClicked.classList.remove("clicked");
			}
			
			targetClicked.querySelector(`#levelFilterFood`).innerHTML = filterFood[0] > 0 ? `${filterFood[0]}` : '';
			targetClicked.querySelector("img").src = filterFood[0] > 0 ? `images/food/1/food.png` : `images/food/2/food.png`;
		}
		else
		{
			const clickedWork = listWorks.find(([name]) => targetClicked.id.includes(name));
			
			clickedWork[1] += 1;
			
			//若超過最大值則歸零
			if (clickedWork[1] > clickedWork[2])
			{
				clickedWork[1] = 0;
				targetClicked.classList.remove("clicked");
			}
			
			targetClicked.querySelector(`#levelFilterWork${clickedWork[0]}`).innerHTML = clickedWork[1] > 0 ? `${clickedWork[1]}` : '';
			targetClicked.querySelector("img").src = clickedWork[1] > 0 ? `images/works/1/${clickedWork[0].toLowerCase()}.png` : `images/works/2/${clickedWork[0].toLowerCase()}.png`;
		}
		
		filterPal();
	}
	
	//關閉語言選單
	if (!targetClicked.closest("#divLanguage") || targetClicked.closest("#divLanguageMenu"))
	{
		let divLanguageMenu = document.querySelector("#divLanguageMenu");
		if (divLanguageMenu.style.display == "block")
		{
			divLanguageMenu.style.display = "none";
			event.preventDefault(); //避免點擊穿透
		}
	}
}

//開始計時
function startTimer(event)
{
	timer = setTimeout(function() { whileMouseOver(event); }, 750);
}

//停止計時
function clearTimer()
{
	clearTimeout(timer);
	showTip();
}

//移到元素上時
function whileMouseOver(event)
{
	const targetOver = event.target;
	
	let x = targetOver.getBoundingClientRect().left + (targetOver.getBoundingClientRect().width / 2);
	let y = targetOver.getBoundingClientRect().top - (targetOver.getBoundingClientRect().height) + 2;
	
	let stringTip = '';
	
	//若是在屬性篩選按鈕上
	if (targetOver.closest("#divFilterElements div"))
	{
		const targetElement = targetOver.closest("#divFilterElements div").id.replace("buttonFliterElements", '');
		const stringName = `stringElement${targetElement}`;
		stringTip = stringsLibrary[stringName];
	}
	
	//假如是在技能篩選按鈕上
	else if (targetOver.closest("#divFilterWorks div"))
	{
		const targetWork = targetOver.closest("#divFilterWorks div").id.replace("buttonFliterWorks", '');
		const stringName = `stringWork${targetWork}`;
		stringTip = stringsLibrary[stringName];
		
		//假如是在食量篩選按鈕上
		if (targetOver.closest("#buttonFliterFood"))
		{
			const stringName = "stringFood";
			stringTip = stringsLibrary[stringName];
		}
	}
	
	//假如是在詳細資料開關上
	else if (targetOver.closest(".divPalDetailsSwitch"))
	{
		const targetFixed = targetOver.closest(".divPalDetailsSwitch").querySelector("img");
		x = targetFixed.x + 16;
		y = targetFixed.y - 38;
		
		const targetDetails = targetOver.closest(".divPal").querySelector(".divPalDetails");
		stringTip = stringsLibrary["stringCollapse"];
		
		//若詳細資料是縮起的狀態
		if (targetDetails && targetDetails.classList.contains("collapsed"))
		{
			stringTip = stringsLibrary["stringExpand"];
		}
	}
	
	else if (targetOver.closest(".divPalWorks"))
	{
		const targetFixed = targetOver.closest(".divPalWorks");
		x = targetFixed.getBoundingClientRect().left + (targetFixed.getBoundingClientRect().width / 2);
		y = targetFixed.getBoundingClientRect().top - (targetFixed.getBoundingClientRect().height) + 2;
		
		const targetWork = listWorks.find(([name]) => targetFixed.querySelector("img").src.includes(name))[0];
		const stringName = `stringWork${targetWork}`;
		
		stringTip = stringsLibrary[stringName];
	}
	
	else if (targetOver.closest(".divPalFood"))
	{
		const targetFixed = targetOver.closest(".divPalFood");
		x = targetFixed.getBoundingClientRect().left + (targetFixed.getBoundingClientRect().width / 2);
		y = targetFixed.getBoundingClientRect().top - (targetFixed.getBoundingClientRect().height) + 2;
		
		const stringName = "stringFood";
		
		stringTip = stringsLibrary[stringName];
	}
	
	if (isNaN(x) || isNaN(y) || x == null || y == null)
	{
		x = event.clientX + 10;
		y = event.clientY + 10;
	}
	
	showTip(stringTip, x, y);
}

//顯示提示訊息
function showTip(message, x, y)
{
	const divTip = document.querySelector("#divTip");
	divTip.style.display = "none";
	divTip.textContent = null;
	
	if (message)
	{
		divTip.textContent = message;
		divTip.style.left = `${x}px`;
		divTip.style.top = `${y}px`;
		divTip.style.display = "block"
	}
}

//用編號找到對應的帕魯
function getPal(targetID)
{
	const targetString = `${targetID}`;
	const matchedID = targetString.match(/(\d+)(\D)/);
	
	let targetNumber = 0;
	let targetType = '';
	
	//尋找字串中第一組數字且數字後有字母
	if (matchedID)
	{
		targetNumber = matchedID[1];
		
		//若後方字母為b
		if (matchedID[2].toLowerCase() == "b")
		{
			targetType = "b";
		}
	}
	else
	{
		//嘗試僅尋找第一組數字
		const matchedNumber = targetString.match(/(\d+)/);
		
		if (matchedNumber)
		{
			targetNumber = matchedNumber[0];
		}
		else
		{
			//完全沒有的話則嘗試將傳進來的值轉為整數，若無則回傳0
			targetNumber = isNaN(parseInt(targetID, 10)) ? 0 : parseInt(targetID, 10);
		}
	}
	
	const datasetPal = databasePal.find(Pal => (Pal.indexDex == targetNumber) && (Pal.suffix == targetType));
	
	return datasetPal;
}

//配種計算
function matePals(Pal1, Pal2)
{
	const targetRank = Math.round((Pal1.rankCombo + Pal2.rankCombo) / 2);
	
	let closestData = null;
	let closestDifference = Infinity;
	
	for (let i = 0; i < databasePal.length; i++)
	{
		//檢查是否為獨特組合
		if (databasePal[i].parents.length > 0)
		{
			const checkParents = databasePal[i].parents[0].split(",");

			if ((checkParents[0] == Pal1.indexInner && checkParents[1] == Pal2.indexInner) ||
				(checkParents[0] == Pal2.indexInner && checkParents[1] == Pal1.indexInner))
			{
				closestData = databasePal[i];
				break;
			}
		}
		else
		{
			if (!databasePal[i].unique)
			{
				const currentDifference = Math.abs(targetRank - databasePal[i].rankCombo);

				//透過比較差值的大小來找出最接近的值，若差值相等則取order值較小者
				if (currentDifference < closestDifference || (currentDifference == closestDifference && databasePal[i].indexInner < closestData.indexInner))
				{
					closestDifference = currentDifference;
					closestData = databasePal[i];
				}
			}
		}
	}
	
	return closestData;
}