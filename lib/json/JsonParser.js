/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const parseJson = require("json-parse-even-better-errors");
const Parser = require("../Parser");
const JsonExportsDependency = require("../dependencies/JsonExportsDependency");
const JsonData = require("./JsonData");

/** @typedef {import("../../declarations/plugins/JsonModulesPluginParser").JsonModulesPluginParserOptions} JsonModulesPluginParserOptions */
/** @typedef {import("../Parser").ParserState} ParserState */
/** @typedef {import("../Parser").PreparsedAst} PreparsedAst */
/** @typedef {import("./JsonModulesPlugin").RawJsonData} RawJsonData */

class JsonParser extends Parser {
	/**
	 * @param {JsonModulesPluginParserOptions} options parser options
	 */
	constructor(options) {
		super();
		this.options = options || {};
	}

	/**
	 * @param {string | Buffer | PreparsedAst} source the source to parse
	 * @param {ParserState} state the parser state
	 * @returns {ParserState} the parser state
	 */
	parse(source, state) {
		if (Buffer.isBuffer(source)) {
			source = source.toString("utf-8");
		}

		/** @type {NonNullable<JsonModulesPluginParserOptions["parse"]>} */
		const parseFn =
			typeof this.options.parse === "function" ? this.options.parse : parseJson;
		/** @type {Buffer | RawJsonData} */
		const data =
			typeof source === "object"
				? source
				: parseFn(source[0] === "\ufeff" ? source.slice(1) : source);
		const jsonData = new JsonData(data);
		state.module.buildInfo.jsonData = jsonData;
		state.module.buildInfo.strict = true;
		state.module.buildMeta.exportsType = "default";
		state.module.buildMeta.defaultObject =
			typeof data === "object" ? "redirect-warn" : false;
		state.module.addDependency(new JsonExportsDependency(jsonData));
		return state;
	}
}

module.exports = JsonParser;
