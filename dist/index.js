"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smh = exports.Failure = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["None"] = 0] = "None";
    ErrorCode[ErrorCode["Unterminated"] = 1] = "Unterminated";
    ErrorCode[ErrorCode["UnableToParse"] = 2] = "UnableToParse";
    ErrorCode[ErrorCode["TabNotAllowed"] = 3] = "TabNotAllowed";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
class Failure {
    constructor(errorcode) {
        this.errorcode = errorcode;
    }
    toString() {
        switch (this.errorcode) {
            case ErrorCode.None: return 'none';
            case ErrorCode.Unterminated: return 'unterminated construct';
            case ErrorCode.UnableToParse: return 'unable to fully parse';
            case ErrorCode.TabNotAllowed: return 'tabs are not allowed as indentation';
        }
    }
}
exports.Failure = Failure;
function smh(markup) {
    try {
        let parser = new Parser(markup);
        let document = parser.parse();
        return parser.didParseCompletely() ? document : new Failure(ErrorCode.UnableToParse);
    }
    catch (e) {
        if (e instanceof Failure) {
            return e;
        }
        else {
            throw e;
        }
    }
}
exports.smh = smh;
class Parser {
    constructor(markup) {
        this.index = 0;
        this.markup = markup;
    }
    parse(parentKind = null, preexistingIndentation = 0) {
        this.ignore('\n');
        this.forbid('\t', ErrorCode.TabNotAllowed);
        let level = this.ignore(' ') / 2 + preexistingIndentation;
        this.forbid('\t', ErrorCode.TabNotAllowed);
        if (this.peekCharacter() == '"') {
            return this.parseQuotedString();
        }
        if (this.peekCharacter() == '[') {
            return this.parseBracketArray();
        }
        if (this.peekCharacter() == '-' && this.peekCharacter(1) == ' ') {
            return this.parseBulletArray(level);
        }
        if (parentKind == 'bracket') {
            return this.parseUnquotedString(['\n', ',', ']']);
        }
        let start = this.index;
        let value = this.parseUnquotedString(['\n', ':']);
        if (this.peekCharacter() == ':') {
            this.index = start;
            return this.parseMap(parentKind == 'bullet' ? level + 1 : level);
        }
        return value;
    }
    didParseCompletely() {
        let character = this.peekCharacter();
        while (character != '') {
            if (!['\n', ' '].includes(character)) {
                return false;
            }
            this.index++;
            character = this.peekCharacter();
        }
        return true;
    }
    parseMap(level) {
        let key = this.parseUnquotedString(['\n', ':']);
        this.index++;
        let value = this.parse(null);
        let object = { [key]: value };
        while (this.peekCharacter() == '\n') {
            let start = this.index;
            this.ignore('\n');
            let indentation = this.ignore(' ') / 2;
            if (indentation != level) {
                this.index = start;
                break;
            }
            let key = this.parseUnquotedString(['\n', ':']);
            if (this.peekCharacter() != ':') {
                this.index = start;
                break;
            }
            this.index++;
            object[key] = this.parse('map');
        }
        return object;
    }
    parseBulletArray(level) {
        this.index++;
        this.ignore(' ');
        let content = [
            this.parse('bullet', level)
        ];
        this.ignore(' ');
        while (this.peekCharacter() == '\n') {
            let startOfLine = this.index;
            this.index++;
            let indentation = this.ignore(' ') / 2;
            if (indentation >= level && this.peekCharacter() == '-' && this.peekCharacter(1) == ' ') {
                this.index++;
                this.ignore(' ');
                level = indentation;
                content.push(this.parse('bullet', level));
            }
            else {
                this.index = startOfLine;
                break;
            }
            this.ignore(' ');
        }
        return content;
    }
    parseBracketArray() {
        let content = [];
        this.index++;
        while (this.index < this.markup.length) {
            this.ignore('\n');
            this.ignore(' ');
            if (this.peekCharacter() == ']') {
                this.index++;
                return content;
            }
            content.push(this.parse('bracket'));
            this.ignore('\n');
            if (this.peekCharacter() == ',') {
                this.index++;
            }
        }
        throw new Failure(ErrorCode.Unterminated);
    }
    parseQuotedString() {
        this.index++;
        let content = "";
        let character = this.peekCharacter();
        while (character != '' && character != '"') {
            if (character == '\\') {
                switch (this.peekCharacter(1)) {
                    case 'n':
                        content += '\n';
                        break;
                    case '"':
                        content += '"';
                        break;
                    case '\\':
                        content += '\\';
                        break;
                }
                this.index++;
            }
            else {
                content += character;
            }
            this.index++;
            character = this.peekCharacter();
        }
        if (character == '') {
            throw new Failure(ErrorCode.Unterminated);
        }
        this.index++;
        return content;
    }
    parseUnquotedString(terminators = ['\n']) {
        let content = "";
        let character = this.peekCharacter();
        while (character != '' && !terminators.includes(character)) {
            this.index++;
            content += character;
            character = this.peekCharacter();
        }
        return content;
    }
    peekCharacter(ahead = 0) {
        return this.index + ahead < this.markup.length ? this.markup.charAt(this.index + ahead) : "";
    }
    ignore(character) {
        let beginning = this.index;
        while (this.peekCharacter() == character) {
            this.index++;
        }
        return this.index - beginning;
    }
    forbid(character, errorcode) {
        if (this.peekCharacter() == character)
            throw new Failure(errorcode);
    }
}
//# sourceMappingURL=index.js.map