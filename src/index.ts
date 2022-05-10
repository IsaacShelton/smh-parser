
export type Dictionary = string | Dictionary[] | { [key: string]: Dictionary }

export enum ErrorCode {
    None,
    Unterminated,
    UnableToParse,
    TabNotAllowed,
}

export class Failure {
    public errorcode: ErrorCode

    constructor(errorcode: ErrorCode){
        this.errorcode = errorcode;
    }

    toString(): string {
        switch(this.errorcode){
        case ErrorCode.None: return 'none';
        case ErrorCode.Unterminated: return 'unterminated construct';
        case ErrorCode.UnableToParse: return 'unable to fully parse';
        case ErrorCode.TabNotAllowed: return 'tabs are not allowed as indentation';
        }
    }
}

export function smh(markup: string): Dictionary | Failure {
    try {
        let parser = new Parser(markup);
        let document = parser.parse();
        return parser.didParseCompletely() ? document : new Failure(ErrorCode.UnableToParse);
    } catch(e){
        if(e instanceof Failure){
            return e;
        } else {
            throw e;
        }
    }
}

class Parser {
    private index: number;
    private markup: string;

    constructor(markup: string){
        this.index = 0;
        this.markup = markup;
    }

    parse(parentKind: null | 'bracket' | 'bullet' | 'map' = null, preexistingIndentation: number = 0): Dictionary {
        this.ignore('\n');
        this.forbid('\t', ErrorCode.TabNotAllowed);

        let level = this.ignore(' ') / 2 + preexistingIndentation;

        this.forbid('\t', ErrorCode.TabNotAllowed);

        if(this.peekCharacter() == '"'){
            return this.parseQuotedString();
        }

        if(this.peekCharacter() == '['){
            return this.parseBracketArray();
        }

        if(this.peekCharacter() == '-' && this.peekCharacter(1) == ' '){
            return this.parseBulletArray(level);
        }

        if(parentKind == 'bracket'){
            return this.parseUnquotedString(['\n', ',', ']']);
        }

        let start = this.index;
        let value = this.parseUnquotedString(['\n', ':']);

        if(this.peekCharacter() == ':'){
            this.index = start;
            return this.parseMap(parentKind == 'bullet' ? level + 1 : level);
        }

        return value;
    }

    didParseCompletely(): boolean {
        let character: string = this.peekCharacter();

        while(character != ''){
            if(!['\n', ' '].includes(character)){
                return false;
            }

            this.index++;
            character = this.peekCharacter();
        }

        return true;
    }

    private parseMap(level: number): Dictionary {
        let key = this.parseUnquotedString(['\n', ':']);
        this.index++;

        let value = this.parse(null);

        let object = {[key]: value};

        while(this.peekCharacter() == '\n'){
            let start = this.index;

            this.ignore('\n');
            let indentation = this.ignore(' ') / 2;

            if(indentation != level){
                this.index = start;
                break;
            }

            let key = this.parseUnquotedString(['\n', ':']);

            if(this.peekCharacter() != ':'){
                this.index = start;
                break;
            }

            this.index++;

            object[key] = this.parse('map');
        }

        return object;
    }

    private parseBulletArray(level: number): Dictionary {
        this.index++;
        this.ignore(' ');
        
        let content: Dictionary[] = [
            this.parse('bullet', level)
        ];

        this.ignore(' ');

        while(this.peekCharacter() == '\n'){
            let startOfLine = this.index;
            this.index++;
            let indentation = this.ignore(' ') / 2;

            if(indentation >= level && this.peekCharacter() == '-' && this.peekCharacter(1) == ' '){
                this.index++;
                this.ignore(' ');

                level = indentation;

                content.push(this.parse('bullet', level));
            } else {
                this.index = startOfLine;
                break;
            }

            this.ignore(' ');
        }

        return content;
    }

    private parseBracketArray(): Dictionary[] {
        let content: Dictionary[] = [];
        this.index++;

        while(this.index < this.markup.length){
            this.ignore('\n');
            this.ignore(' ');

            if(this.peekCharacter() == ']'){
                this.index++;
                return content;
            }

            content.push(this.parse('bracket'));

            this.ignore('\n');

            if(this.peekCharacter() == ','){
                this.index++;
            }
        }

        throw new Failure(ErrorCode.Unterminated);
    }

    private parseQuotedString(): string {
        this.index++;

        let content: string = "";
        let character: string = this.peekCharacter();

        while(character != '' && character != '"'){
            if(character == '\\'){
                switch(this.peekCharacter(1)){
                case 'n':  content += '\n'; break;
                case '"':  content += '"';  break;
                case '\\': content += '\\'; break;
                }

                this.index++;
            } else {
                content += character;
            }

            this.index++;
            character = this.peekCharacter();
        }

        if(character == ''){
            throw new Failure(ErrorCode.Unterminated);
        }

        this.index++;
        return content;
    }

    private parseUnquotedString(terminators: string[] = ['\n']): string {
        let content: string = "";
        let character: string = this.peekCharacter();

        while(character != '' && !terminators.includes(character)){
            this.index++;
            content += character;
            character = this.peekCharacter();
        }

        return content;
    }

    private peekCharacter(ahead: number = 0): string {
        return this.index + ahead < this.markup.length ? this.markup.charAt(this.index + ahead) : "";
    }

    private ignore(character: string): number {
        let beginning = this.index;

        while(this.peekCharacter() == character){
            this.index++;
        }

        return this.index - beginning;
    }

    private forbid(character: string, errorcode: ErrorCode){
        if(this.peekCharacter() == character) throw new Failure(errorcode);
    }
}
