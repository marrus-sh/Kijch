// Usage: `new Charset(document)`.
export const [
	BASIC_TYPE
	, NO_BLOCK
	, PREFIX ] = [
	Object.freeze({
		CONTROL: "https://vocab.KIBI.network/Kixt/#CONTROL"
		, DATA: "https://vocab.KIBI.network/Kixt/#DATA"
		, FORMAT: "https://vocab.KIBI.network/Kixt/#FORMAT"
		, NONCHARACTER: "https://vocab.KIBI.network/Kixt/#NONCHARACTER"
		, NONSPACING: "https://vocab.KIBI.network/Kixt/#NONSPACING"
		, PRIVATEUSE: "https://vocab.KIBI.network/Kixt/#PRIVATEUSE"
		, SPACING: "https://vocab.KIBI.network/Kixt/#SPACING"
		, TRANSMISSION: "https://vocab.KIBI.network/Kixt/#TRANSMISSION"
		, UNASSIGNED: "https://vocab.KIBI.network/Kixt/#UNASSIGNED" })
	, "NO BLOCK"
	, "https://vocab.KIBI.network/Kixt/#" ]
let
	Block
	, Character
	, Script
const SuperBlock = class Block { constructor ( ) { if (!(this instanceof Block)) throw new TypeError("Invalid constructor.") } } // Works with `typeof` but cannot construct
const SuperCharacter = class Character { constructor ( ) { if (!(this instanceof Character)) throw new TypeError("Invalid constructor.") } } // Works with `typeof` but cannot construct
const SuperScript = class Script { constructor ( ) { if (!(this instanceof Script)) throw new TypeError("Invalid constructor.") } } // Works with `typeof` but cannot construct
export {
	SuperBlock as Block
	, SuperCharacter as Character
	, SuperScript as Script }
Block = class extends SuperBlock {
	constructor ( context, props ) {
		super()
		Object.defineProperties(this, {
			aliases: { enumerable: true, get: ( ) => new Set(props.aliases) }
			, alsoKnownAs: { enumerable: true, get: ( ) => new Set(props.alsoKnownAs) }
			, characters: { enumerable: true, get: ( ) => Object.keys(context.characters).filter(key => context.characters[key].block == this).reduce(( characters, key ) => ((characters[key] = context.characters[key]), characters), Array(0xFFFF)) }
			, name: { enumerable: true, value: props.name }
			, namedCharacters: { enumerable: true, get: ( ) => Object.freeze(Object.keys(context.namedCharacters).filter(key => context.namedCharacters[key].block == this).reduce(( namedCharacters, key ) => ((namedCharacters[key] = context.namedCharacters[key]), namedCharacters), { })) }
			, notes: { enumerable: true, get: ( ) => new Set(props.notes) } }) } }
Character = class extends SuperCharacter {
	constructor ( context, props ) {
		super()
		Object.defineProperties(this, {
			aliases: { enumerable: true, get: ( ) => new Set(props.aliases) }
			, alsoKnownAs: { enumerable: true, get: ( ) => new Set(props.alsoKnownAs) }
			, basicType: { enumerable: true, value: props.basicType }
			, block: { enumerable: true, value: props.block }
			, codepoint: { enumerable: true, value: props.codepoint }
			, combiningClass: { enumerable: true, value: props.combiningClass }
			, compatibility: { enumerable: true, get: ( ) => props.compatibility.map(( ref ) => context.characters[ref]) }
			, compatibilityMode: { enumerable: true, value: props.compatibilityMode }
			, conjoiningClass: { enumerable: true, value: props.conjoiningClass }
			, conjoiningMode: { enumerable: true, value: props.conjoiningMode }
			, decomposition: { enumerable: true, get: ( ) => props.decomposition.map(( ref ) => context.characters[ref]) }
			, decompositionPreferred: { enumerable: true, value: props.decompositionPreferred }
			, deprecated: { enumerable: true, value: props.deprecated }
			, fullwidth: { enumerable: true, value: props.fullwidth }
			, glyphs: { enumerable: true, get: ( ) => new Glyphs(props.glyphs) }
			, name: { enumerable: true, value: props.name }
			, notes: { enumerable: true, get: ( ) => new Set(props.notes) }
			, references: { enumerable: true, get: ( ) => {
				const result = new Set
				props.references.forEach(( reference ) => result.add(context.characters[reference]))
				return result } }
			, script: { enumerable: true, value: props.script }
			, segments: { enumerable: true, value: props.segments }
			, unicode: { enumerable: true, get: ( ) => props.unicode.slice() } }) } }
Script = class extends SuperScript {
	constructor ( context, props ) {
		super()
		Object.defineProperties(this, {
			IRI: { enumerable: true, value: props.IRI }
			, alsoKnownAs: { enumerable: true, get: ( ) => new Set(props.alsoKnownAs) }
			, characters: { enumerable: true, get: ( ) => Object.keys(context.characters).filter(key => context.characters[key].script == this).reduce(( characters, key ) => ((characters[key] = context.characters[key]), characters), Array(0xFFFF)) }
			, namedCharacters: { enumerable: true, get: ( ) => Object.freeze(Object.keys(context.namedCharacters).filter(key => context.namedCharacters[key].script == this).reduce(( namedCharacters, key ) => ((namedCharacters[key] = context.namedCharacters[key]), namedCharacters), { })) }
			, notes: { enumerable: true, get: ( ) => new Set(props.notes) } }) } }
export class Charset {
	constructor ( definition ) {
		if ( !/[\x0A\x0D\x85\u2028]/u.test(definition[definition.length - 1]) ) throw new TypeError("Document does not end in a break.")
		const alsoKnownAs = new Set
			, blocks = { }
			, characters = Array(0xFFFF)
			, lines = definition.split(/[\x0A\x85\u2028]|\x0D\x0A|\x0D\x85|\x0D(?![\x0A\x85])/gu)
			, namedCharacters = { }
			, notes = new Set
			, scripts = [ `${PREFIX}COMMON`, `${PREFIX}INHERITED`, `${PREFIX}UNKNOWN` ].reduce((scripts, key) => (scripts[key] = new Script(this, { IRI: key })), { })
			, usedBlocks = new Set
			, usedCodepoints = new Set
			, usedNames = new Set
		let IRI = void { }
			, currentBlock = null
			, currentScript = scripts[`${PREFIX}UNKNOWN`]
			, line = lines[0]
			, index = 0
			, inMultiLineComment = false
			, match = void { }
			, revision = void { }
			, supportsVariableEncoding = false
			, version = void { }
		function moveToNextNonCommentLine ( ) {
			do line = lines[++index]
			while ( /^ *\/[^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*$/u.test(line) ) }
		function collectAliasesInto ( collection, used ) {
			while ( match = line.match(/^ *= *([A-Z](?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])|-(?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])))*) *$/u) ) { // <Aliases>
					collection.add(match[1])
					if ( used.has(match[1]) ) throw new TypeError(`Redefinition of name ${ match[1] } on line ${ index + 1 } of input.`)
					else used.add(match[1])
					moveToNextNonCommentLine() } }
		function collectAlsoKnownAsInto ( collection ) {
			while ( match = line.match(/^ *- *([\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}](?: ?[\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}])*) *$/u) ) { // <OtherNames>
					collection.add(match[1])
					moveToNextNonCommentLine() } }
		function collectNotesInto ( collection ) {
			while ( match = line.match(/^ *\* *([\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}](?: ?[\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}])*) *$/u) ) { // <Notes>
					collection.add(match[1])
					moveToNextNonCommentLine() } }
		while ( index < lines.length ) {
			if ( index == 0 ) { // <CharsetDeclaration>
				if ( !(match = line.match(/^(?:\uFEFF)?;CHARSET<([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)>(?:(0|[1-9A-F][0-9A-F]{0,3})(?:\.(0|[1-9A-F][0-9A-F]{0,3}))?)? *$/u)) ) throw new TypeError("Document does not begin with a charset declaration.") // <CharsetIdentifier>
				try { new URL(IRI = match[1]) } catch ( error ) { throw new TypeError("Document does not begin with a charset declaration.") }
				if ( match[2] ) version = parseInt(match[2], 16)
				if ( match[3] ) revision = parseInt(match[3], 16)
				moveToNextNonCommentLine()
				if ( match = line.match(/^ *& *VARIABLE *$/u) ) { // <CharsetProperties>
					supportsVariableEncoding = true
					moveToNextNonCommentLine() }
				collectAlsoKnownAsInto(alsoKnownAs)
				collectNotesInto(notes)
				continue }
			if ( inMultiLineComment ) { // <MultiLineComment>
				if ( /^\/\/\//u.test(line) ) {
					inMultiLineComment = false
					moveToNextNonCommentLine()
					continue }
				if ( !/^[^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*$/u.test(line) ) throw new TypeError("Invalid character in multiline comment on line ${ index + 1 } of input.")
				line = lines[++index]
				continue }
			if ( match = line.match(/^ *% *([A-Z](?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])|-(?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])))*) *$/u) ) { // <BlockDeclaration>
				if ( match[1] == NO_BLOCK ) {
					currentBlock = null
					moveToNextNonCommentLine()
					continue }
				const props = {
					aliases: new Set
					, alsoKnownAs: new Set
					, notes: new Set }
				props.name = match[1]
				if ( usedBlocks.has(props.name) ) throw new TypeError(`Redefinition of block ${ props.name } on line ${ index + 1 } of input.`) // <BlockName>
				usedBlocks.add(props.name)
				moveToNextNonCommentLine()
				collectAliasesInto(props.aliases, usedBlocks)
				collectAlsoKnownAsInto(props.alsoKnownAs)
				collectNotesInto(props.notes)
				currentBlock = blocks[props.name] = new Block(this, props)
				props.aliases.forEach(alias => blocks[alias] = blocks[props.name])
				continue }
			if ( match = line.match(/^ *' *<([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)> *$/u) ) { // <ScriptDeclaration>
				const props = scripts.hasOwnProperty(match[1]) ? {
					alsoKnownAs: scripts[match[1]].alsoKnownAs
					, notes: scripts[match[1]].notes } : {
					alsoKnownAs: new Set
					, notes: new Set }
				try { new URL(props.IRI = match[1]) } catch ( error ) { throw new TypeError(`The IRI in the script declaration is not well-formed on line ${ index + 1 } of input.`) } // <ScriptIdentifier>
				moveToNextNonCommentLine()
				collectAlsoKnownAsInto(props.alsoKnownAs)
				collectNotesInto(props.notes)
				currentScript = scripts[props.IRI] = new Script(this, props)
				continue }
			if ( /^ *U\+(?:0*(?:10|[1-9A-F])[0-9A-F]{0,4}|0+)(?: [^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*)?$/u.test(line) ) { // <CharacterDefinition>
				const props = {
						aliases: new Set
						, alsoKnownAs: new Set
						, block: currentBlock
						, combiningClass: 0
						, compatibilityMode: `${PREFIX}GENERIC`
						, conjoiningClass: 0
						, conjoiningMode: null
						, deprecated: false
						, fullwidth: null
						, glyphs: new Set
						, notes: new Set
						, references: new Set
						, script: currentScript
						, segments: null
						, unicode: [ ] }
				while ( match = line.match(/^ *U\+(0*(?:10|[1-9A-F])[0-9A-F]{0,4}|0+)(?: [^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*)?$/u) ) { // <UnicodeMapping>
					props.unicode.push(parseInt(match[1], 16))
					moveToNextNonCommentLine() }
				match = line.match(/^ *; *(?:((?:0 ?)*1(?: ?[01])*|(?:0 ?)+) *\/|(0*[1-9A-F][0-9A-F]{0,3}|0+) ) *([A-Z](?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])|-(?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])))*) *\((CONTROL|TRANSMISSION|FORMAT|DATA|NONSPACING|SPACING|PRIVATEUSE|NONCHARACTER)\) *$/u) // <CharacterInfo>
				if ( !match ) throw new TypeError(`Character definition does not contain well-formed character info on line ${ index + 1} of input.`)
				props.codepoint = match[1] ? parseInt(match[1].replace(/ /gu, ""), 2) : parseInt(match[2], 16)
				if ( characters[props.codepoint] ) throw new TypeError(`Redefinition of codepoint ${ new Array(3 - Math.floor(props.codepoint ? Math.log2(props.codepoint) / 4 : 0)).fill(0).join("") + props.codepoint.toString(16).toUpperCase() } on line ${ index + 1} of input.`)
				props.compatibility = [ props.codepoint ]
				props.decomposition = [ props.codepoint ]
				props.name = match[3]
				if ( usedNames.has(match[3]) ) throw new TypeError(`Redefinition of name ${ match[3] } on line ${ index + 1 } of input.`)
				else usedNames.add(match[3])
				props.basicType = PREFIX + match[4]
				moveToNextNonCommentLine()
				match = line.match(/^ *\( *(?:<([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)>)? *((?:0*[1-9A-F][0-9A-F]{0,3}|0+)(?: +(?:0*[1-9A-F][0-9A-F]{0,3}|0+))*) *$/u) // <CompatibilityMapping>
				if ( match ) {
					props.compatibility = match[2].trim().split(/ +/gu).map(value => parseInt(value, 16))
					if ( match[1] ) try { new URL(match[1]) } catch ( error ) { `The IRI in the compatibility mapping is not well-formed on line ${ index + 1 } of input.` }
					props.compatibilityMode = match[1] || "${PREFIX}GENERIC"
					if ( props.compatibility.length == 1 && props.compatibility[0] == props.codepoint && props.compatibilityMode != "${PREFIX}GENERIC" ) throw new TypeError(`A character has a compatibility mapping to itself but a non-GENERIC compatibility mode on line ${ index + 1 } of input.`)
					props.compatibility.forEach(value => usedCodepoints.add(value))
					moveToNextNonCommentLine() }
				match = line.match(/^ *(?:< *((?:0*[1-9A-F][0-9A-F]{0,3}|0+)(?: +(?:0*[1-9A-F][0-9A-F]{0,3}|0+))*)|<< *((?:0*[1-9A-F][0-9A-F]{0,3}|0+)(?: +(?:0*[1-9A-F][0-9A-F]{0,3}|0+))+)) *$/u) // <DecompositionMapping>
				if ( match ) {
					props.decomposition = (match[1] || match[2]).trim().split(/ +/gu).map(value => parseInt(value, 16))
					props.decompositionPreferred = props.decomposition.length == 1 || !match[1]
					props.decomposition.forEach(value => usedCodepoints.add(value))
					moveToNextNonCommentLine() }
				match = line.match(/^ *& *(?:(DEPRECATED)(?: +(?:(PROPORTIONAL|FULLWIDTH)(?: +CONJOINS<([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)>)?|CONJOINS<([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)>(?:\|(0|[1-9A-F][0-9A-F]{0,3}))?|(EXTENDS|DIVIDER)(?:\+(0|[1-9A-F][0-9A-F]{0,3}))?))?|(PROPORTIONAL|FULLWIDTH)(?: +CONJOINS<([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)>)?|CONJOINS<([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)>(?:\|(0|[1-9A-F][0-9A-F]{0,3}))?|(EXTENDS|DIVIDER)(?:\+(0|[1-9A-F][0-9A-F]{0,3}))?) *$/u) // <AdditionalProperties>
				if ( match ) {
					props.deprecated = !!match[1]
					props.fullwidth = match[2] || match[8] ? (match[2] || match[8]) == "FULLWIDTH" : null
					props.segments = match[6] || match[12] ? (match[6] || match[12]) == "DIVIDER" : null
					if ( props.segments == null && props.script.IRI == "${PREFIX}INHERITED" ) throw new TypeError(`The INHERITED script was declared for a non-combining character on line ${ index + 1 } of input.`)
					props.combiningClass = parseInt(match[7] || match[13], 16) >>> 0
					props.conjoiningMode = match[3] || match[4] || match[9] || match[10] || null
					if ( props.conjoiningMode ) try { new URL(props.conjoiningMode) } catch ( error ) { throw new TypeError(`The IRI in the additional properties is not well-formed on line ${ index + 1 } of input.`) }
					if ( props.basicType != BASIC_TYPE.SPACING && props.basicType != BASIC_TYPE.NONSPACING && (props.fullwidth != null || props.segments != null || props.conjoiningMode != null) ) throw new TypeError(`An additional property other than DEPRECATED was provided for a non-graphic (spacing or nonspacing) character on line ${ index + 1 } of input.`)
					props.conjoiningClass = parseInt(match[5] || match[11], 16) >>> 0
					moveToNextNonCommentLine() }
				collectAliasesInto(props.aliases, usedNames)
				collectAlsoKnownAsInto(props.alsoKnownAs)
				collectNotesInto(props.notes)
				while ( match = line.match(/^ *> *(0*[1-9A-F][0-9A-F]{0,3}|0+)(?: [^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*)?$/u) ) { // <References>
					props.references.add(parseInt(match[1], 16))
					moveToNextNonCommentLine() }
				props.references.forEach(value => usedCodepoints.add(value))
				while ( match = line.match(/^ *\) *([0-9A-F]{8,}) *$/u) ) { // <Glyphs>
					let hex = match[1],
						sqrt = 0
					while ( !((sqrt = Math.floor(Math.sqrt(hex.length * 4))) * sqrt == hex.length * 4 || (sqrt = Math.floor(Math.sqrt(hex.length * 8))) * sqrt == hex.length * 8) || hex.length % 2 ) hex += "0"
					props.glyphs.forEach(( glyph ) => { if (glyph.length == hex.length) throw new TypeError(`Multiple glyphs of the same length are defined for a character on line ${ index + 1 } of input.`) })
					props.glyphs.add(hex)
					moveToNextNonCommentLine() }
				characters[props.codepoint] = new Character(this, props)
				namedCharacters[props.name] = characters[props.codepoint]
				props.aliases.forEach(alias => namedCharacters[alias] = characters[props.codepoint])
				continue }
			if ( /^ *$/u.test(line) ) { // <Blank>
				moveToNextNonCommentLine()
				continue }
			if ( /^\.\.\.$/u.test(line) ) { // <MultiLineComment> begins
				inMultiLineComment = true
				line = lines[++index]
				continue }
			throw new TypeError(`Unrecognized syntax on line ${ index + 1 } of input.`) }
		usedCodepoints.forEach(value => { if ( !characters[value] ) throw new TypeError(`A reference was made to codepoint ${ new Array(3 - Math.floor(value ? Math.log2(value) / 4 : 0)).fill(0).join("") + value.toString(16).toUpperCase() }, but it was never defined.`) })
		Object.defineProperties(this, {
			IRI: { enumerable: true, value: IRI }
			, alsoKnownAs: { enumerable: true, get: ( ) => new Set(alsoKnownAs) }
			, blocks: { enumerable: true, value: Object.freeze(blocks) }
			, characters: { enumerable: true, get: ( ) => characters.slice() }
			, namedCharacters: { enumerable: true, value: Object.freeze(namedCharacters) }
			, notes: { enumerable: true, get: ( ) => new Set(notes) }
			, revision: { enumerable: true, value: revision }
			, scripts: { enumerable: true, value: Object.freeze(scripts) }
			, version: { enumerable: true, value: version } }) } }
export class Glyph {
	constructor ( data ) {
		if ( !/^(?:[0-9A-Fa-f]{2})+$/.test(typeof data == "number" ? data.toString(16) : data = String(data)) ) throw new TypeError("Glyph data is not convertible into a sequence of hexadecimal octets.")
		let sqrt = Math.floor(Math.sqrt(data.length * 4))
		const fullwidth = sqrt * sqrt == data.length * 4
		if ( !fullwidth ) {
			sqrt = Math.floor(Math.sqrt(data.length * 8))
			if ( !(sqrt * sqrt == data.length * 8) ) throw new TypeError("Data is not square or half-square.") }
		Object.defineProperties(this, {
			data: { value: data }
			, height: { value: sqrt }
			, fullwidth: { value: fullwidth }
			, width: { value: fullwidth ? sqrt : sqrt / 2 } }) }
	valueAt ( x, y ) {
		if ( x >>> 0 > (this.width >>> 0) - 1 || y >>> 0 > (this.height >>> 0) - 1 ) return false
		const index = (y >>> 0) * (this.width >>> 0) + (x >>> 0)
		return this.valueAtIndex(index) }
	valueAtIndex ( i ) { return !!(parseInt(this.data[Math.floor(i / 4)], 16) & 0b1000 >> i % 4) } }
export class Glyphs {
	constructor ( glyphsData ) {
		const dimensions = new Set
			, sizes = new Set
		try { glyphsData = new Set(glyphsData) } catch ( error ) { throw new TypeError("Glyphs data must be iterable.") }
		Object.defineProperties(this, {
			dimensions: { get: ( ) => new Set(dimensions) }
			, sizes: { get: ( ) => new Set(sizes) } })
		glyphsData.forEach(( glyphData ) => {
			const glyph = new Glyph(glyphData)
			sizes.add(glyph.height)
			dimensions.add(`${ glyph.width }x${ glyph.height }`)
			Object.defineProperty(this, `${ glyph.width }x${ glyph.height }`, { enumerable: true, get: ( ) => new Glyph(glyphData) }) })
		sizes.forEach(( size ) => {
			const sizeObj = { }
			let temp = void { }
			if ( dimensions.has(`${ size / 2 }x${ size }`) ) Object.defineProperty(sizeObj, size / 2, { enumerable: true, get: ( ) => this[`${ size / 2 }x${ size }`] })
			if ( dimensions.has(`${ size }x${ size }`) ) Object.defineProperty(sizeObj, size, { enumerable: true, get: ( ) => this[`${ size }x${ size }`] })
			Object.defineProperty(this, size, { value: Object.freeze(sizeObj) }) }) }
	fit ( height, width ) {
		let bestSize = void { }
		sizes.forEach(( size ) => { if ( !bestSize || size > bestSize && size < height || size < bestSize && bestSize > height ) bestSize = size })
		if ( !bestSize ) return
		if ( Object.getOwnPropertyNames(this[bestSize]).length == 1 ) return this[bestSize][Object.getOwnPropertyNames(this[bestSize])[0]]
		return Math.round(height / width) > 1 ? this[bestSize][bestSize] : this[bestSize][bestSize / 2] } }
