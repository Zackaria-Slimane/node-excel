const express = require("express");
const xlsxm = require("../Helpers/manageXlsx.func");
const path = require("path");
const app = express();

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "DELETE,GET,POST,PUT,PATCH,OPTION");
	res.setHeader("Access-Control-Allow-Headers", "*");
	next();
});

app.use(express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 50000 }));
app.use(express.json({ extended: true, limit: "50mb", parameterLimit: 50000 }));

xlsxm.testPlan();
module.exports = app;
