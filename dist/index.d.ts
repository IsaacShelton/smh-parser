export declare type Dictionary = string | Dictionary[] | {
    [key: string]: Dictionary;
};
export declare enum ErrorCode {
    None = 0,
    Unterminated = 1,
    UnableToParse = 2,
    TabNotAllowed = 3
}
export declare class Failure {
    errorcode: ErrorCode;
    constructor(errorcode: ErrorCode);
    toString(): string;
}
export declare function smh(markup: string): Dictionary | Failure;
