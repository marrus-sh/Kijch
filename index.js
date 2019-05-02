// Usage: `new Charset(document)`.
let Character
const SuperCharacter = class Character { constructor ( ) { if (!(this instanceof Character)) throw new TypeError("Invalid constructor.") } } // Works with `typeof` but cannot construct
export { SuperCharacter as Character }
Character = class extends SuperCharacter { constructor ( context, props ) {
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
export class Charset {
	constructor ( definition ) {
		if ( !/[\x0A\x0D\x85\u2028]/u.test(definition[definition.length - 1]) ) throw new TypeError("Document does not end in a break.")
		const characters = Array(0xFFFF)
			, lines = definition.split(/[\x0A\x85\u2028]|\x0D\x0A|\x0D\x85|\x0D(?![\x0A\x85])/gu)
			, namedCharacters = { }
		let IRI = void { }
			, currentBlock = "NO BLOCK"
			, currentScript = "https://vocab.KIBI.network/Kixt/#UNKNOWN"
			, line = lines[0]
			, index = 0
			, revision = void { }
			, usedBlocks = new Set
			, usedCodepoints = new Set
			, usedNames = new Set
			, version = void { }
		for ( ; index < lines.length ; line = lines[++index] ) {
			let match = void { }
			if ( index == 0 ) { // <CharsetDeclaration>
				if ( !(match = line.match(/^(?:\uFEFF)?CHARSET@([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)(?:\^([0-9A-F]{1,4})(?:\.([0-9A-F]{1,4}))?)? *$/u)) ) throw new TypeError("Document does not begin with a charset declaration.")
				try { new URL(IRI = match[1]) } catch ( error ) { throw new TypeError("Document does not begin with a charset declaration.") }
				if ( match[2] ) version = parseInt(match[2], 16)
				if ( match[3] ) revision = parseInt(match[3], 16)
				continue }
			if ( match = line.match(/^ *% *([A-Z](?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])|-(?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])))*) *$/u) ) { // <BlockDeclaration>
				if ( match[1] != "NO BLOCK" && usedBlocks.has(match[1]) ) throw new TypeError(`Redefinition of block ${ match[1] } on line ${ index + 1 } of input.`)
				currentBlock = match[1]
				if ( currentBlock != "NO BLOCK" ) usedBlocks.add(currentBlock)
				continue }
			if ( match = line.match(/^ *@ *([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*) *$/u) ) { // <ScriptDeclaration>
				try { new URL(currentScript = match[1]) } catch ( error ) { throw new TypeError(`The IRI in the script declaration is not well-formed on line ${ index + 1 } of input.`) }
				continue }
			if ( /^ *U\+(?:0*(?:10|[1-9A-F])[0-9A-F]{0,4}|0+)(?: [^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*)?$/u.test(line) ) { // <CharacterDefinition>
				const props = {
						aliases: new Set
						, alsoKnownAs: new Set
						, block: currentBlock
						, combiningClass: 0
						, compatibilityMode: "https://vocab.KIBI.network/Kixt/#GENERIC"
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
					line = lines[++index] }
				match = line.match(/^ *: *(?:((?:0 ?)*1(?: ?[01])*|(?:0 ?)+) *\||(0*[1-9][0-9]{0,3}|0+) ) *([A-Z](?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])|-(?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])))*) *\[(CONTROL|TRANSMISSION|FORMAT|DATA|NONSPACING|SPACING|PRIVATEUSE|NONCHARACTER)\] *$/u) // <CharacterInfo>
				if ( !match ) throw new TypeError(`Character definition does not contain well-formed character info on line ${ index + 1} of input.`)
				props.codepoint = match[1] ? parseInt(match[1].replace(/ /gu, ""), 2) : parseInt(match[2], 16)
				if ( characters[props.codepoint] ) throw new TypeError(`Redefinition of codepoint ${ new Array(3 - Math.floor(props.codepoint ? Math.log2(props.codepoint) / 4 : 0)).fill(0).join("") + props.codepoint.toString(16).toUpperCase() } on line ${ index + 1} of input.`)
				props.compatibility = [ props.codepoint ]
				props.decomposition = [ props.codepoint ]
				props.name = match[3]
				if ( usedNames.has(match[3]) ) throw new TypeError(`Redefinition of name ${ match[3] } on line ${ index + 1 } of input.`)
				else usedNames.add(match[3])
				props.basicType = "https://vocab.KIBI.network/Kixt/#" + match[4]
				line = lines[++index]
				match = line.match(/^ *~ *(?:\[([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)\])? *((?:0*[1-9][0-9]{0,3}|0+)(?: +(?:0*[1-9][0-9]{0,3}|0+))*) *$/u) // <CompatibilityMapping>
				if ( match ) {
					props.compatibility = match[2].trim().split(/ +/gu).map(( value ) => parseInt(value, 16))
					if ( match[1] ) try { new URL(match[1]) } catch ( error ) { `The IRI in the compatibility mapping is not well-formed on line ${ index + 1 } of input.` }
					props.compatibilityMode = match[1] || "https://vocab.KIBI.network/Kixt/#GENERIC"
					if ( props.compatibility.length == 1 && props.compatibility[0] == props.codepoint && props.compatibilityMode != "https://vocab.KIBI.network/Kixt/#GENERIC" ) throw new TypeError(`A character has a compatibility mapping to itself but a non-GENERIC compatibility mode on line ${ index + 1 } of input.`)
					props.compatibility.forEach(( value ) => usedCodepoints.add(value))
					line = lines[++index] }
				match = line.match(/^ *(?:< *((?:0*[1-9][0-9]{0,3}|0+)(?: +(?:0*[1-9][0-9]{0,3}|0+))*)|<< *((?:0*[1-9][0-9]{0,3}|0+)(?: +(?:0*[1-9][0-9]{0,3}|0+))+)) *$/u) // <DecompositionMapping>
				if ( match ) {
					props.decomposition = (match[1] || match[2]).trim().split(/ +/gu).map(( value ) => parseInt(value, 16))
					props.decompositionPreferred = props.decomposition.length == 1 || !match[1]
					props.decomposition.forEach(( value ) => usedCodepoints.add(value))
					line = lines[++index] }
				match = line.match(/^ *! *(?:(DEPRECATED)(?: +(?:(PROPORTIONAL|FULLWIDTH)(?: +CONJOINS@([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*))?|CONJOINS@([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)(?:\|([0-9A-F]{1,4}))?|(EXTENDS|DIVIDER)(?:@([0-9A-F]{1,4}))?))?|(PROPORTIONAL|FULLWIDTH)(?: +CONJOINS@([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*))?|CONJOINS@([A-Za-z][0-9A-Za-z+\.-]*:(?:[0-9A-Za-z\x21\x23\x24\x26-\x2F\x3A\x3B\x3D\x3F\x40\x5B\x5D\x5F\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|%[0-9A-Za-z]{2})*)(?:\|([0-9A-F]{1,4}))?|(EXTENDS|DIVIDER)(?:@([0-9A-F]{1,4}))?) *$/u) // <AdditionalProperties>
				if ( match ) {
					props.deprecated = !!match[1]
					props.fullwidth = match[2] || match[8] ? (match[2] || match[8]) == "FULLWIDTH" : null
					props.segments = match[6] || match[12] ? (match[6] || match[12]) == "DIVIDER" : null
					if ( props.segments == null && props.script == "https://vocab.KIBI.network/Kixt/#INHERITED" ) throw new TypeError(`The INHERITED script was declared for a non-combining character on line ${ index + 1 } of input.`)
					props.combiningClass = parseInt(match[7] || match[13], 16) >>> 0
					props.conjoiningMode = match[3] || match[4] || match[9] || match[10] || null
					if ( props.conjoiningMode ) try { new URL(props.conjoiningMode) } catch ( error ) { throw new TypeError(`The IRI in the additional properties is not well-formed on line ${ index + 1 } of input.`) }
					if ( props.basicType != "https://vocab.KIBI.network/Kixt/#SPACING" && props.basicType != "https://vocab.KIBI.network/Kixt/#NONSPACING" && (props.fullwidth != null || props.segments != null || props.conjoiningMode != null) ) throw new TypeError(`An additional property other than DEPRECATED was provided for a non-graphic (spacing or nonspacing) character on line ${ index + 1 } of input.`)
					props.conjoiningClass = parseInt(match[5] || match[11], 16) >>> 0
					line = lines[++index] }
				while ( match = line.match(/^ *= *([A-Z](?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])|-(?:[0-9A-Z]| (?:[A-Z]|-[0-9A-Z])))*) *$/u) ) { // <Aliases>
					props.aliases.add(match[1])
					if ( usedNames.has(match[1]) ) throw new TypeError(`Redefinition of name ${ match[1] } on line ${ index + 1 } of input.`)
					else usedNames.add(match[1])
					line = lines[++index] }
				while ( match = line.match(/^ *- *([\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}](?: ?[\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}])*) *$/u) ) { // <OtherNames>
					props.alsoKnownAs.add(match[1])
					line = lines[++index] }
				while ( match = line.match(/^ *\* *([\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}](?: ?[\x21-\x7E\xA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}])*) *$/u) ) { // <Notes>
					props.notes.add(match[1])
					line = lines[++index] }
				while ( match = line.match(/^ *> *(0*[1-9][0-9]{0,3}|0+)(?: [^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*)?$/u) ) { // <References>
					props.references.add(parseInt(match[1], 16))
					line = lines[++index] }
				props.references.forEach(( value ) => usedCodepoints.add(value))
				while ( match = line.match(/^ *# *([0-9A-F]{8,}) *$/u) ) { // <Glyphs>
					let hex = match[1],
						sqrt = 0
					while ( !((sqrt = Math.floor(Math.sqrt(hex.length * 4))) * sqrt == hex.length * 4 || (sqrt = Math.floor(Math.sqrt(hex.length * 8))) * sqrt == hex.length * 8) || hex.length % 2 ) hex += "0"
					props.glyphs.forEach(( glyph ) => { if (glyph.length == hex.length) throw new TypeError(`Multiple glyphs of the same length are defined for a character on line ${ index + 1 } of input.`) })
					props.glyphs.add(hex)
					line = lines[++index] }
				characters[props.codepoint] = new Character(this, props)
				namedCharacters[props.name] = characters[props.codepoint]
				props.aliases.forEach(( alias ) => namedCharacters[alias] = characters[props.codepoint])
				index--
				continue }
			if ( /^(?: *| *\|[^\x00-\x1F\x7F-\x9F\uD800-\uDFFF\uFDD0-\uFDEF\uFFF0-\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}-\u{E0FFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]*)$/u.test(line) ) continue // <Comment> or <Blank>
			throw new TypeError(`Unrecognized syntax on line ${ index + 1 } of input.`) }
		usedCodepoints.forEach(( value ) => { if ( !characters[value] ) throw new TypeError(`A reference was made to codepoint ${ new Array(3 - Math.floor(value ? Math.log2(value) / 4 : 0)).fill(0).join("") + value.toString(16).toUpperCase() }, but it was never defined.`) })
		Object.defineProperties(this, {
			IRI: { enumerable: true, value: IRI }
			, characters: { enumerable: true, get: ( ) => characters.slice() }
			, namedCharacters: { enumerable: true, value: Object.freeze(namedCharacters) }
			, revision: { enumerable: true, value: revision }
			, version: { enumerable: true, value: version } }) } }
export class Glyph {
	constructor ( data ) {
		if ( data.length % 2 ) throw new TypeError("Data is not divisible into octets.")
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
