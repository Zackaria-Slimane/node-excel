let xlsx = require("xlsx");
let fs = require("fs");
const ConsoleProgressBar = require("console-progress-bar");
let sites = [];
let data = [
	{
		ref: 1,
		data: "l",
	},
	{
		ref: 1,
		data: "p",
	},
	{
		ref: 1,
		data: "k",
	},
	{
		ref: 2,
		data: "t",
	},
	{
		ref: 2,
		data: "v",
	},
	{
		ref: 3,
		data: "o",
	},
	{
		ref: 3,
		data: "nn",
	},
];
let dataRef = {};

exports.genearteScenario1 = (filename) => {
	try {
		let cPb = new ConsoleProgressBar({ maxValue: 100 });
		let counter = 0;
		let timer = setInterval(() => {
			counter += 3;
			cPb.setValue(counter);
		}, 1000);
		dataRef = getReferenceAttr();
		sites = readXlsxFile("test/files/sites.xlsx", "Réf Site");
		let data = readXlsxFile(filename, "plan de chargement reference");

		let dateTab = [
			{ name: "LU", date: "25/10/2021" },
			{ name: "MA", date: "26/10/2021" },
			{ name: "ME", date: "27/10/2021" },
			{ name: "JE", date: "28/10/2021" },
			{ name: "VE", date: "29/10/2021" },
			{ name: "SA", date: "30/10/2021" },
		];

		let output = [];

		data.forEach((sheet, index) => {
			dateTab.forEach((_day) => {
				if (sheet["Périodicité"].indexOf(_day.name) !== -1) {
					const uid = (index + 1).toString().padStart(3, "0");
					let sSite = getSiteInfo(sheet["Code Entité de Transit Départ"]);
					let eSite = getSiteInfo(sheet["Code Entité de Transit Arrivée"]);
					let Edate = sheet["Heure de déchargement site d'arrivée"];
					let Ldate = sheet["Heure de chargement site d'arrivée"];

					if (Edate == "Non affecté") Edate = "00:00";

					if (Ldate == "Non affecté") Ldate = Edate;

					/* if(Edate[0] == '0')
                       Edate = Edate.substr(1)

                    if(Ldate[0] == '0')
                       Ldate = Ldate.substr(1) */

					let $data = {
						CreationDate: "25/10/2021 00:00:00",
						ImportType: "OrderImport",
						ImportAction: "create",
						ExtId1: sheet["N° de ligne"] + "-" + uid + "-" + _day.name,
						OrderAction: "AB",
						EarliestDateTime: _day.date + " 00:00",
						LatestDateTime: _day.date + " 23:59",
						EarliestPickupTime: _day.date + " 00:00",
						LatestPickupTime: _day.date + " 23:59",
						EarliestDeliveryTime: _day.date + " " + Edate,
						LatestDeliveryTime: _day.date + " " + Ldate,
						PickupLocationID: sSite["CO_ENTITE"],
						PickupLocationName: sSite["IBELLE LONG ENTITE"],
						PickupCountry: sSite["PAYS"]?.substr(0, 3).toUpperCase(),
						PickupPostCode: sSite["CODE POSTAL"],
						PickupCity: sSite["VILLE"],
						PickupStreet: sSite["ADRESSE VOIE"],
						PickupCoordFormat: "MERCATOR",
						DeliveryLocationID: eSite["CO_ENTITE"],
						DeliveryLocationName: eSite["IBELLE LONG ENTITE"],
						DeliveryCountry: eSite["PAYS"]?.substr(0, 3).toUpperCase(),
						DeliveryPostCode: eSite["CODE POSTAL"],
						DeliveryCity: eSite["VILLE"],
						DeliveryStreet: eSite["ADRESSE VOIE"],
						DeliveryCoordFormat: "MERCATOR",
						Text_1: sheet["Intitulé de la ligne"],
						Text_2: sheet["Type de véhicule"],
						Text_3:
							sheet["Intitulé du Transporteur"] +
							"-" +
							sheet["Code Transporteur"] +
							"-" +
							sheet["Code Transporteur SAPTM"],
						Text_4: sheet["Code contrat"],
						Text_5: sheet["Périodicité"],
						Text_6: sheet["Heure d'arrivée planifiée"],
						Text_7: sheet["Heure de déchargement planifié"],
						Text_8: sheet["Heure de chargement planifié"],
						Text_9: sheet["Heure de départ planifié"],
						Text_10: sheet["Code Organisation"],
						PrecombinedTourId: sheet["N° de ligne"],
						DeliveryPrecombinedTourSequence: sheet["Numéro d'ordre de l'étape suivante"],
						Quantity1: isNaN(sheet["Qté CE30 moyen"]) ? "" : sheet["Qté CE30 moyen"],
					};

					const setInfos = (type = 1) => {
						let typeTxt = type == 1 ? "Pickup" : "Delivery";
						let oVType = type == 1 ? sSite : eSite;
						let oV = [
							{
								id: 1,
								date: oVType["LUNDI"],
							},
							{
								id: 2,
								date: oVType["MARDI"],
							},
							{
								id: 3,
								date: oVType["MERCREDI"],
							},
							{
								id: 4,
								date: oVType["JEUDI"],
							},
							{
								id: 5,
								date: oVType["VENDREDI"],
							},
							{
								id: 6,
								date: oVType["SAMEDI"],
							},
						];
						const dup = combineDuplicateDatas(oV, "id", "date");

						dup.forEach((content, oindex) => {
							let attr1 = `${typeTxt}OpeningHour${oindex + 1}Start`;
							let attr2 = `${typeTxt}OpeningHour${oindex + 1}End`;
							let attr3 = `${typeTxt}OpeningHour${oindex + 1}Days`;

							let date1 = content.combinedCode?.split("-")[0].trim() || "00:00";
							let date2 = content.combinedCode?.split("-")[1].trim() || "00:00";

							/* date1 = formatTime(date1)
                            date2 = formatTime(date2) */

							$data[attr1] = date1;
							$data[attr2] = date2;
							$data[attr3] = content.combinedRes;
						});
					};

					setInfos(1);
					setInfos(2);

					/* $data['PickupLongitude'] = sSite['COORDONNEES GEOLOCALISATION'].split('/')[0].trim()
                     $data['PickupLatitude'] = sSite['COORDONNEES GEOLOCALISATION'].split('/')[1].trim()
                     $data['DeliveryLongitude'] = eSite['COORDONNEES GEOLOCALISATION'].split('/')[0].trim()
                     $data['DeliveryLatitude'] = eSite['COORDONNEES GEOLOCALISATION'].split('/')[1].trim() */

					output.push({ ...dataRef, ...$data });
				}
			});
			if (sheet["Périodicité"].length > 2) {
			}
		});

		if (output.length > 0) {
			writeXlsxFile(output, filename, "plan de chargement destination");
			clearInterval(timer);
			console.log("saved successfuly");
		}
	} catch (error) {
		console.log("error:", error.message);
	}
};

exports.genearteScenario2 = (filename = "test/files/plan.xlsx") => {
	try {
		dataRef = getReferenceAttr();
		sites = readXlsxFile("test/files/sites.xlsx", "sites sn2");
		let flux = readXlsxFile(filename, "flux sn2");
		console.log("sites", sites.length);
		console.log("plans", flux.length);
		let output = [];
		let cpt = 0;
		for (let _flux of flux) {
			cpt++;
			let sSite = getSiteInfo(_flux["Site Origine"], "Site");
			let eSite = getSiteInfo(_flux["Site Destination"], "Site");
			let date1 = _flux["Horaire Départ au plus tôt"];
			date1 = date1.split("  ");
			date1[0] = date1[0].split("/");
			let m1 = date1[0][0];
			let m2 = date1[0][1];
			date1[0][0] = m2;
			date1[0][1] = m1;
			date1[0] = date1[0].join("/");
			date1 = date1.join(" ");

			let date2 = _flux["Horaire Arrivée au plus tard"];
			date2 = date2.split("  ");
			date2[0] = date2[0].split("/");
			let _m1 = date2[0][0];
			let _m2 = date2[0][1];
			date2[0][0] = _m2;
			date2[0][1] = _m1;
			date2[0] = date2[0].join("/");
			date2 = date2.join(" ");

			let $data = {
				CreationDate: "25/09/2021 00:00:00",
				ImportType: "OrderImport",
				ImportAction: "update",
				ExtId1: _flux["ID Flux"],
				OrderAction: "AB",
				EarliestDateTime: date1,
				LatestDateTime: date2,
				EarliestDeliveryTime: date1,
				LatestDeliveryTime: date2,
				EarliestPickupTime: date1,
				LatestPickupTime: date1,
				PickupLocationID: sSite["Site"],
				// PickupCoordFormat: 'GEODEC',
				PickupIsDepot: 1,
				DeliveryIsDepot: 1,
				DeliveryLocationID: eSite["Site"],
				/* DeliveryCoordFormat: 'GEODEC' ,
                PickupLongitude: sSite['X Coord'],
                PickupLatitude:  sSite['Y Coord'],
                DeliveryLongitude:  eSite['X Coord'],
                DeliveryLatitude:  eSite['Y Coord'], */
				Text_1: _flux["Type Flux"],
				// Text_2: 'Temps transit sites: 45 min',
				Quantity1: _flux["Quantité N2"],
				//PickupOneTimeLocation: 1,
				//DeliveryOneTimeLocation: 1,
				Taskfield1ExtId: "NATIONAL CONCEPTION",
				//PrecombinedTourId: _flux['ID Flux'],
			};

			output.push({ ...dataRef, ...$data });
		}
		console.log("output:", output.length);
		if (output.length > 0) {
			writeXlsxFile(output, filename, "plan final scenario 2");
			console.log("write file successfuly");
		}
	} catch (err) {
		console.log("Error:", err.message);
	}
};

exports.genearteScenario3 = (filename = "test/files/plan.xlsx") => {
	try {
		dataRef = getReferenceAttr();
		sites = readXlsxFile("test/files/sites.xlsx", "sites sn3");
		let datas = readXlsxFile(filename, "sn3 parsed");
		let output = [];
		//'rrr'.replaceAll()
		console.log(datas.length);
		datas.forEach((data, index) => {
			let sCode = data["type"].trim() === "PLEIN" ? "Ville" : "Site";
			let eCode = data["type"].trim() !== "PLEIN" ? "Ville" : "Site";
			let sSite = getSiteInfo(data["Site de Départ"], "Site");
			let eSite = getSiteInfo(data["Site de Livraison"], "Site");
			if (index === 1) {
				console.log(data["Site de Départ"]);
				console.log(sSite);
			}
			let $data = {
				CreationDate: "03/11/2021 00:00:00",
				ImportType: "OrderImport",
				ImportAction: "update",
				ExtId1: "TNP-" + (index + 1).toString().padStart(3, "0"),
				OrderAction: data["type"].trim() === "PLEIN" ? "delivery" : "pickup",
				EarliestDateTime: "04/11/2021 00:00:00",
				LatestDateTime: "05/11/2021 " + (data["Heure Livraison souhaitée"] || "00:00:00"),
				EarliestDeliveryTime: "05/11/2021 00:00:00",
				LatestDeliveryTime:
					"05/11/2021 " + (data["Heure Livraison souhaitée"] || "00:00:00"),
				EarliestPickupTime: "04/11/2021 00:00:00",
				LatestPickupTime: "04/11/2021 00:00:00",
				PickupLocationID: sSite["Site"],
				PickupLocationName: sSite["Site"],
				PickupPostCode: sSite["Code Postal"],
				PickupStreet: sSite["street"],
				PickupHouseNo: sSite["HouseNumber"],
				PickupCity: sSite["Ville"],
				DeliveryLocationID: eSite["Site"],
				DeliveryLocationName: eSite["Site"],
				DeliveryPostCode: eSite["Code Postal"],
				DeliveryStreet: eSite["street"],
				DeliveryHouseNo: sSite["HouseNumber"],
				DeliveryCity: eSite["Ville"],
				Text_1: data["type"],
				Text_2: data["jour"],
				Taskfield1ExtId: "NATIONAL PRESSE",
				PickupOneTimeLocation: data["type"].trim() === "PLEIN" ? 0 : 1,
				DeliveryOneTimeLocation: data["type"].trim() === "PLEIN" ? 1 : 0,
				Quantity1: data["qantity"],
				Weight: data["poid"],
				DeliveryOpeningHoursToleranceClass: 2,
				PickupCountry: "FRA",
				DeliveryCountry: "FRA",
				PickupIsDepot: data["type"].trim() === "PLEIN" ? 1 : 0,
				DeliveryIsDepot: data["type"].trim() === "PLEIN" ? 0 : 1,
			};

			output.push({ ...dataRef, ...$data });
		});
		if (output.length > 0) {
			writeXlsxFile(output, filename, "plan de chargement final sn3");
			console.log("Write file successfuly");
		}
	} catch (err) {
		console.log("error:", err.message);
	}
};

exports.genearteScenario4 = (filename = "test/files/plan.xlsx") => {
	let destSites = {
		s1: "LES ARCS VAR PFC",
		s2: "BRIVE HUB",
		s3: "LA BUISSIERE ALP PFC",
		s4: "DOUVRIN PFC",
		s5: "LE THILLAY PFC",
		s6: "MONTEREAU JARD PFC",
		s7: "VIAPOST ANGERS",
		s8: "VAL DE REUIL PFC",
		s9: "TOULOUSE CAPITOU PFC",
		s10: "BEGLES BORDEAUX PFC",
		s11: "LE RHEU RENNES PFC",
		s12: "MER PFC",
		s13: "BAR LE DUC PFC",
		s14: "CLT-FD PFC",
		s15: "ERSTEIN PFC",
		s16: "ST LAURENT MURE PFC",
		s17: "MOISSY CRAMAYEL PFC",
		s18: "CAVAILLON PFC",
	};
	try {
		dataRef = getReferenceAttr();
		sites = readXlsxFile("test/files/sites.xlsx", "sites sn4");
		let datas = readXlsxFile(filename, "sn4 colis");
		let output = [];
		//'rrr'.replaceAll()
		console.log(datas.length, sites.length);
		datas.forEach((data, index) => {
			let i = 1;
			let startSite = data["site_code"].trim();
			let sSite = getSiteInfo(startSite, "ID");
			if (startSite == "CLT-FD PFC" || startSite == "FUCHS STT") return;

			if (Object.keys(sSite).length === 0) console.log("nulll site", startSite);

			let addrInfos1 = sSite["adresse"];
			addrInfos1 = parseAddr(addrInfos1);

			for (i; i <= 18; i++) {
				let volume = +data["v" + i];

				let endSite = destSites["s" + i];
				if (
					endSite == "CLT-FD PFC" ||
					endSite == "FUCHS STT" ||
					isNaN(volume) ||
					startSite === endSite
				)
					continue;

				let eSite = getSiteInfo(endSite, "ID");

				let addrInfos2 = eSite["adresse"];
				addrInfos2 = parseAddr(addrInfos2);

				if (index === 3) {
					//console.log('site',sSite)
					//console.log(addrInfos1)
				}
				cpt = 0;

				while (volume > 0) {
					cpt++;
					let $data = {
						CreationDate: "03/11/2021 00:00:00",
						ImportType: "OrderImport",
						ImportAction: "update",
						ExtId1: data["REF"] + "-SL" + (i + 1) + "-QL" + cpt,
						OrderAction: "AB",
						EarliestDateTime: "04/11/2021 18:00:00",
						LatestDateTime: "05/11/2021 20:00:00",
						EarliestDeliveryTime: "04/11/2021 18:00:00",
						LatestDeliveryTime: "05/11/2021 20:00:00",
						EarliestPickupTime: "04/11/2021 18:00:00",
						LatestPickupTime: "05/11/2021 04:00:00",
						PickupLocationID: sSite["code_site"],
						PickupLocationName: startSite,
						PickupPostCode: addrInfos1.postal_code,
						PickupStreet: addrInfos1.street,
						PickupHouseNo: addrInfos1.strNumber,
						PickupCity: addrInfos1.city,
						DeliveryLocationID: eSite["code_site"],
						DeliveryLocationName: endSite,
						DeliveryPostCode: addrInfos2.postal_code,
						DeliveryStreet: addrInfos2.street,
						DeliveryHouseNo: addrInfos2.strNumber,
						DeliveryCity: addrInfos2.city,
						Text_1: startSite,
						Text_2: endSite,
						Text_3: sSite["vehicules"],
						Text_4: sSite["type"],
						Taskfield1ExtId: "NATIONAL COLISSIMO",
						PickupOneTimeLocation: 1,
						DeliveryOneTimeLocation: 1,
						Quantity1: volume > 1000 ? 1000 : volume,
						PickupServiceTimeClass: 2,
						DeliveryServiceTimeClass: 2,
						PickupOpeningHour1Start: "05:00",
						PickupOpeningHour1End: "00:00",
						PickupOpeningHour1Days: "1,2,3,4,5,6",
						PickupOpeningHour2Start: "00:00",
						PickupOpeningHour2End: "04:00",
						PickupOpeningHour2Days: "1,2,3,4,5,6",
						DeliveryOpeningHour1Start: "05:00",
						DeliveryOpeningHour1End: "00:00",
						DeliveryOpeningHour1Days: "1,2,3,4,5,6",
						DeliveryOpeningHour2Start: "00:00",
						DeliveryOpeningHour2End: "04:00",
						DeliveryOpeningHour2Days: "1,2,3,4,5,6",
						PickupCountry: "FRA",
						DeliveryCountry: "FRA",
						PickupIsDepot: 0,
						DeliveryIsDepot: 0,
					};

					output.push({ ...dataRef, ...$data });

					volume -= 1000;
				}
			}
		});
		if (output.length > 0) {
			writeXlsxFile(output, filename, "plan de chargement final sn4");
			console.log("Write file successfuly");
		}
	} catch (err) {
		console.log("error:", err.message);
	}
};

exports.getStudentsList = (filename = "test/files/planTest.xlsx") => {
	try {
		let students = readXlsxFile(filename, "plan sn1");
		console.log(students);
		let outdata = [];
		students.forEach((student) => {
			let data = {
				...student,
				isOld: +student.age > 18 ? "YES" : "NO",
			};
		});
		if (outdata.length > 0) {
			writeXlsxFile(outdata, filename, "student tab new");

			console.log("write successfuly !!!");
		}
	} catch (err) {
		console.log("error:", err.message);
	}
};

exports.testPlan = (filename = "test/files/planTest.xlsx") => {
	try {
		let entry = readXlsxFile(filename, "plan sn1");
		sites = readXlsxFile(filename, "site");
		//let sSite = getSiteInfo(["site_code"], "Site");
		let outdata = [];
		entry.forEach((data, index) => {
			let sLoc = getSiteInfo(data["sLocation"], "site_code");
			let eLoc = getSiteInfo(data["eLocation"], "site_code");

			if (index == 1) {
				console.log(eLoc);
			}

			let data = {
				orderID: data["orderID"],
				PickupLocationID: sLoc["site_code"],
				PickupLocationName: sLoc["site_name"],
				pickupLocationLat: sLoc["lat"],
				pickupLocationLng: sLoc["lng"],
				DeliveryLocationID: eLoc["site_code"],
				DeliveryLocationName: eLoc["site_name"],
				DeliveryLocationLat: eLoc["lat"],
				DeliveryLocationLng: eLoc["lng"],
				Text_1: data["sLocation"],
				Text_2: data["eLocation"],
			};
			outdata.push(data);
		});

		if (outdata.length > 0) {
			writeXlsxFile(outdata, filename, "Sheet 5");
			console.log("wrote on Sheet 5 successfully !!!");
		}
	} catch (err) {
		console.log("error:", err.message);
	}
};

function getSiteInfo(siteCode, key = "CO_ENTITE") {
	if (siteCode == undefined) return false;
	let site = sites.find((_site) => _site[key] === siteCode);
	return site || {};
}

/**
 * combiner des champs qui on les memes valeur sur un champs et
 * les combiner en un champs unique
 * utile pour regrouper les jours qui ont les memes heures d'ouverture et de fermeture
 */

function combineDuplicateDatas(array, idKey, compairAttrKey) {
	let output = [];

	while (array.length > 0) {
		array.forEach((arrayEl, index) => {
			let code = arrayEl[compairAttrKey];
			let data = array.filter((_arrayEl, _index) => {
				return _arrayEl[compairAttrKey] === code;
			});

			let combineTbl = [];
			data.forEach((cbnEl) => {
				combineTbl.push(cbnEl[idKey]);
				let index = array.findIndex((el) => el[idKey] === cbnEl[idKey]);
				array.splice(index, 1);
			});
			output.push({ combinedCode: code, combinedRes: combineTbl.join(",") });
		});
	}

	return output;
}

/** 
 Recuperation des champs du fichier de destination
 */

function getReferenceAttr() {
	let data = readXlsxFile("test/files/OrderImport_ReferenceDataTest.xlsx", "OrderImport");
	let attrRes = {};
	if (data && data.length > 0) {
		attrRes = data[0];
		let keys = Object.keys(attrRes);
		keys.forEach((key) => (attrRes[key] = ""));
	}
	return attrRes;
}

/*** 
   Lecture d'un fichier excel
  -> filename: chemin vers le fichier
  -> sheetname = nom de la feuille
 */
function readXlsxFile(filename, sheetname) {
	let file = xlsx.readFile(filename);
	let data = [];
	const fsheets = file.Sheets[sheetname];
	if (fsheets != undefined) {
		const temp = xlsx.utils.sheet_to_json(fsheets);
		temp.forEach((res) => {
			data.push(res);
		});
	}

	return data;
}

/***
  eciture dans un fichier excel: 
  -> data = list en format json des lignes a ajouter ex. [{column1: val1 , column2: val2 , column3: val3...}]
  -> filename = chemin vers le fichier d'écriture
  -> sheetname = nom de la feuille si celle-ci n'exist pas elle sera crée. 
     si elle exist sont contenu sera modifier 
***/

function writeXlsxFile(data, filename, sheetname = "sheet1") {
	console.log("start writing file....");
	const file = xlsx.readFile(filename);
	//console.log('file.Sheets',Object.keys(file.Sheets) )
	const ws = xlsx.utils.json_to_sheet(data);
	if (file.Sheets[sheetname] !== undefined) file.Sheets[sheetname] = ws;
	else xlsx.utils.book_append_sheet(file, ws, sheetname);

	xlsx.writeFile(file, filename);
}

function formatTime(time) {
	if (time.split(":").length == 2) time = time + ":00";

	if (time[0] == "0") time = time.substr(1);

	let parts = time.split(":");
	let format = "";

	if (+parts[0] <= 13) {
		parts[0] = parts[0];
		format = "AM";
	} else {
		parts[0] = (+parts[0] - 12).toString();
		format = "PM";
	}

	return parts.join(":") + " " + format;
}

function flormatDate(date, informat = 1, outformat = 2, delimiter = "/") {
	/*if(informat == outformat)
      return date

    let dateParts = date.replace('  ', ' ').split(' ')
    
    let datePartsDate = dateParts[0] ;

    datePartsDate = datePartsDate.split(delimiter);
    let outDate = '';
    switch( informat ){
        case 1:
    }
    if(format == 1){
         
    } */

	if (typeof date !== "string") {
		console.error("Wrong date format. Input must be of type string");
		return "";
	}
	date = date.replace("  ", " ").split("  ");
	date[0] = date[0].split("/");
	let _m1 = date[0][0];
	let _m2 = date[0][1];
	date[0][0] = _m2;
	date[0][1] = _m1;
	date[0] = date[0].join("/");
	date = date.join(" ");

	return date;
}

exports.parseSn3File = (filename = "test/files/plan.xlsx") => {
	try {
		let datas = readXlsxFile(filename, "sn3");
		let days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
		let output = [];

		console.log("math", Math.max);
		datas.forEach((data, index) => {
			let qt = [];
			let qt2 = [];
			days.forEach((day) => {
				qt.push(+data[day]);
				qt2.push({ day, qt: +data[day] });
			});
			let max = Math.max(...qt);

			let fn = qt2.find((_qn) => _qn.qt === max);
			if (index == 0) {
				console.log(fn);
			}

			let $data = {
				"Site de Départ": data["Site de Départ"],
				"Site de Livraison": data["Site de Livraison"],
				"Heure Livraison souhaitée": data["Heure Livraison souhaitée"],
				type: data["type"],
				volume: data[fn.day],
				jour: fn.day,
				poid: data["max"],
				qantity: fn.qt,
			};

			output.push($data);
		});

		if (output.length > 0) {
			writeXlsxFile(output, filename, "sn3 parsed");
		}
	} catch (err) {
		console.log("error:", err);
	}
};

function GET_FIRST_PART(str, type = 2, separator = " ") {
	try {
		if (typeof str !== "string")
			throw new Error("the first artgument of GET_FIRST_PART must be of type string");

		//let str = strInput
		let index = str.indexOf(" ");
		let hsNumber = false;
		if (index === -1) return ["", str];

		let firstPart = str.substring(0, index);
		let i = 0;

		while (i < firstPart.length) {
			if (!isNaN(firstPart[i])) {
				hsNumber = true;
				break;
			}

			i++;
			if (i == firstPart.length) index = 0;
		}

		firstPart = hsNumber ? firstPart : "";
		return [firstPart, str.substr(index).trim()];
	} catch (err) {
		console.log("errr:", err.message);
		return ["", ""];
	}
}

function parseAddr(addr, separator = ",") {
	try {
		let index = addr.lastIndexOf(separator);

		let firstPart = "",
			lastPart = "";

		if (index == -1) {
			firstPart = addr;
			lastPart = "";
		} else {
			firstPart = addr.substr(0, index).trim();
			lastPart = addr.substr(index).replace(separator, "").trim();
		}

		let city = "",
			strNumber = "",
			street = "",
			postal_code = "";

		let firstPartParts = GET_FIRST_PART(firstPart);
		let lastPartParts = GET_FIRST_PART(lastPart);
		strNumber = firstPartParts[0];
		street = firstPartParts[1];
		postal_code = lastPartParts[0];
		city = lastPartParts[1];

		return { strNumber, street, postal_code, city };
	} catch (err) {
		console.log("error:", err.message);
	}
}

function generateSites(filename = "") {}
