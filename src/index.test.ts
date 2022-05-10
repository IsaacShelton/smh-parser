
import { smh, Failure, ErrorCode } from './index';

test('string literal', () => {
    expect(smh('"This is a string"')).toEqual("This is a string");
});

test('string literal unquoted', () => {
    expect(smh('This is a string')).toEqual("This is a string");
});

test('string literal over newline', () => {
    expect(smh('"This is a very\nlong string that goes over\n multiple lines"')).toEqual("This is a very\nlong string that goes over\n multiple lines");
});

test('string literal escape newline', () => {
    expect(smh('"This is a string with a\\nnewline escape character"')).toEqual("This is a string with a\nnewline escape character");
});

test('string literal escape backslash', () => {
    expect(smh('"This is a string with an escaped \\\\ character"')).toEqual("This is a string with an escaped \\ character");
});

test('string literal escape backslash', () => {
    expect(smh('"This is a string with an escaped \\" character"')).toEqual("This is a string with an escaped \" character");
});

test('bracket array with unquoted strings', () => {
    expect(smh('[this, is, an, array]')).toEqual(["this", "is", "an", "array"]);
});

test('bracket array with quoted strings', () => {
    expect(smh('["this", "is", "an", "array"]')).toEqual(["this", "is", "an", "array"]);
});

test('bracket array with unquoted strings and newline whitespace', () => {
    expect(smh('[\n    this,\n    is,\n    an,\n    array\n]\n')).toEqual(["this", "is", "an", "array"]);
});

test('bracket array with quoted strings and newline whitespace', () => {
    expect(smh('["this",\n"is",\n"an",\n"array"\n]\n')).toEqual(["this", "is", "an", "array"]);
});

test('nested bracket array', () => {
    expect(smh('[[red, green, blue, orange, violet, yellow], [light, dark]]')).toEqual([["red", "green", "blue", "orange", "violet", "yellow"], ["light", "dark"]]);
});

test('nested bracket array and newline whitespace', () => {
    expect(smh('[\n [\n    red,\n    green,\n    blue,\n    orange,\n    violet,\n    yellow\n  ],\n  [\n    light,\n    dark]\n  ]\n')).toEqual([["red", "green", "blue", "orange", "violet", "yellow"], ["light", "dark"]]);
});

test('bullet array', () => {
    expect(smh('- Item 1\n- Item 2\n- Item 3\n- Item 4')).toEqual(["Item 1", "Item 2", "Item 3", "Item 4"]);
});

test('bullet array with extra whitespace', () => {
    expect(smh(' - Item 1\n -   Item 2\n  -     Item 3\n    - Item 4\n')).toEqual(["Item 1", "Item 2", "Item 3", "Item 4"]);
});

test('bracket array inside bullet array', () => {
    expect(smh(`
    - red
    - green
    - blue
    - orange
    - yellow
    - violet
    - [another, array, inside, of, it]
    - [and, even, another]
    `)).toEqual([
        "red",
        "green",
        "blue",
        "orange",
        "yellow",
        "violet",
        ["another", "array", "inside", "of", "it"],
        ["and", "even", "another"]
    ]);
});

test('simple object', () => {
    expect(smh('name: Isaac Shelton\nage: 150\nstatus: online')).toEqual({
        "name": "Isaac Shelton",
        "age": "150",
        "status": "online"
    });
});

test('bullet array of atom object', () => {
    expect(smh(`
    - name: Isaac
    `)).toEqual( [ {"name": "Isaac"} ] );
});

test('bullet array of multiple atom objects', () => {
    expect(smh(`
        - name: Isaac
        - name: John
        - name: Kate
        - name: Leo
    `)).toEqual([
        {"name": "Isaac"},
        {"name": "John"},
        {"name": "Kate"},
        {"name": "Leo"}
    ]);
});

test('bullet array of simple objects', () => {
    expect(smh(`
        - name: Isaac Shelton
          age: 100
          phone number: (123) 456-789
          email: isaacshelton@email.com
        - name: Isaac Shelton
          age: 100
          phone number: (123) 456-789
          email: isaacshelton@email.com
        - name: Joe Gow
          age: 758
          phone number: (321) 654-987
          email: joegow@email.com
    `)).toEqual([
        {"name": "Isaac Shelton", "age": "100", "phone number": "(123) 456-789", "email": "isaacshelton@email.com"},
        {"name": "Isaac Shelton", "age": "100", "phone number": "(123) 456-789", "email": "isaacshelton@email.com"},
        {"name": "Joe Gow", "age": "758", "phone number": "(321) 654-987", "email": "joegow@email.com"}
    ]);
});

test('simple object of bullet arrays', () => {
    expect(smh(`
        names:
          - Adam
          - Becky
          - Charlie
          - Dennis
        hair:
          - blond
          - brown
          - red
    `)).toEqual({
        "names": ["Adam", "Becky", "Charlie", "Dennis"],
        "hair": ["blond", "brown", "red"]
    });
});

test('simple object of bullet arrays without indent', () => {
    expect(smh(`
        names:
        - Adam
        - Becky
        - Charlie
        - Dennis
        hair:
        - blond
        - brown
        - red
    `)).toEqual({
        "names": ["Adam", "Becky", "Charlie", "Dennis"],
        "hair": ["blond", "brown", "red"]
    });
});

test('simple object of bullet arrays with more indent', () => {
    expect(smh(`
        names:
            - Adam
            - Becky
            - Charlie
            - Dennis
        hair:
            - blond
            - brown
            - red
    `)).toEqual({
        "names": ["Adam", "Becky", "Charlie", "Dennis"],
        "hair": ["blond", "brown", "red"]
    });
});

test('simple object of bullet arrays with even more indent', () => {
    expect(smh(`
        names:
                - Adam
                - Becky
                - Charlie
                - Dennis
        hair:
                - blond
                - brown
                - red
    `)).toEqual({
        "names": ["Adam", "Becky", "Charlie", "Dennis"],
        "hair": ["blond", "brown", "red"]
    });
});

test('nested objects', () => {
    expect(smh(`
    id: 0001
    type: donut
    name: Cake
    ppu: 0.55
    image:
      url: images/0001.jpg
      width: 200
      height: 200
    thumbnail:
      url: images/thumbnails/0001.jpg
      width: 32
      height: 32
    `)).toEqual({
        "id": "0001",
        "type": "donut",
        "name": "Cake",
        "ppu": "0.55",
        "image": {
            "url": "images/0001.jpg",
            "width": "200",
            "height": "200"
        },
        "thumbnail": {
            "url": "images/thumbnails/0001.jpg",
            "width": "32",
            "height": "32"
        }
    });
});

test('nested bullet array in bullet array in object', () => {
    expect(smh(`
    joined:
    - 925152116.0410991
    - 497736212.27979374
    - 1422230080
    - 1590538804
    - - true
      - -1102818509
      - strike
      - -320025018.638896
      - morning
      - -448987145
    - true
    eaten: false
    various: mouse
    oil: 53841486.252361774
    store: iron
    running: -702611241`)).toEqual({
        "joined": [
            "925152116.0410991",
            "497736212.27979374",
            "1422230080",
            "1590538804",
            [
                "true",
                "-1102818509",
                "strike",
                "-320025018.638896",
                "morning",
                "-448987145"
            ],
            "true"
        ],
        "eaten": "false",
        "various": "mouse",
        "oil": "53841486.252361774",
        "store": "iron",
        "running": "-702611241"
    });
});

test('bullet array in object in bullet array', () => {
    expect(smh(`
    - film: whole
      importance: -1560843229
      fur:
          - gone
          - hope
          - add
          - false
          - true
          - null
      am: 622455639.9732909
      situation: 261399373.06596088
      plate: highway
    - -1534870088.9886203
    - true
    - habit
    - eight`)).toEqual([
        {
            "film": "whole",
            "importance": "-1560843229",
            "fur": ["gone", "hope", "add", "false", "true", "null"],
            "am": "622455639.9732909",
            "situation":  "261399373.06596088",
            "plate": "highway",
        },
        "-1534870088.9886203",
        "true",
        "habit",
        "eight"
    ]);
});

test('forbid tabs as indentation', () => {
    expect(smh(`
items:
\t- Item 1
\t- Item 2
    `)).toEqual(new Failure(ErrorCode.TabNotAllowed));
});

test('reject unterminated string', () => {
    expect(smh(`"`)).toEqual(new Failure(ErrorCode.Unterminated));
});

test('reject unterminated string over multiple lines', () => {
    expect(smh(`
    "

    `)).toEqual(new Failure(ErrorCode.Unterminated));
});

test('reject unterminated array', () => {
    expect(smh(`[`)).toEqual(new Failure(ErrorCode.Unterminated));
});

test('reject unterminated array over multiple lines', () => {
    expect(smh(`
    [
    
    `)).toEqual(new Failure(ErrorCode.Unterminated));
});

test('reject invalid markup - extra unquoted string', () => {
    expect(smh(`
    This line will be parsed!
    This line won't be, and will result in an error...
    `)).toEqual(new Failure(ErrorCode.UnableToParse));
});

test('reject invalid markup - extra data after element in bullet array', () => {
    expect(smh(`
    - "This string will be parsed!
    " BUT THIS EXTRA PART CANNOT BE PARSED AND WILL CAUSE AN ERROR
    `)).toEqual(new Failure(ErrorCode.UnableToParse));
});

test('self descriptive conclusion', () => {
    expect(smh(`
    smh:
      title: A simple markup language for humans
      acronym: Simple Markup language for Humans and isaac
      similar: [yaml, json]
      creator: Isaac Shelton
      versions:
        v1.0:
          date: May 10th 2022
          repo: github.com/IsaacShelton/smh-parser
      types:
        - string
        - array
        - object
      contributors:
        - name: Isaac Shelton
          role: Author
          since: 2022
    `)).toEqual({
        "smh": {
            "title": "A simple markup language for humans",
            "acronym": "Simple Markup language for Humans and isaac",
            "similar": ["yaml", "json"],
            "creator": "Isaac Shelton",
            "versions": {
                "v1.0": {
                    "date": "May 10th 2022",
                    "repo": "github.com/IsaacShelton/smh-parser"
                }
            },
            types: ["string", "array", "object"],
            "contributors": [
                {
                    "name": "Isaac Shelton",
                    "role": "Author",
                    "since": "2022"
                }
            ]
        }
    });
});
