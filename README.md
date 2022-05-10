# SMH SPEC v1.0

Simple Markup language for Humans and isaac



### Introduction

smh is a markup language that's designed to have the readability of yaml with the simplicity of json.



*"So simple, you can write your own parser"*



There are three types:

- String

  *The only escapes that are guaranteed to be recognized by the parser are `\"`,  `\\`, and `\n`* 

  *Literal newline characters are only included in strings when using double quotes*

  ```
  this is a string
  "this is a string"
  1.0.0
  3.14159
  123456789
  ```

- Array

  ```
  [this, is, an, array]
  
  - this
  - is
  - an
  - array
  ```

- Object

  ```
  author: Chinua Achebe
  country: Nigeria
  image link: images/things-fall-apart.jpg
  language: English
  link: https://en.wikipedia.org/wiki/Things_Fall_Apart
  pages: 209
  title: Things Fall Apart
  year: 1958
  ```






### Usage:

```
import { smh, Failure } from 'smh-parser';

let content = smh(`
  - this
  - is
  - an
  - array
`);

if(content instanceof Failure){
    console.log("ERROR - " + content.toString());
} else {
    console.log(content);
}
```





### Examples:

```
- name: Isaac Shelton
  age: 100
  phone number: (123) 456-789
  email: isaacshelton@email.com
- name: Joe Gow
  age: 758
  phone number: (321) 654-987
  email: jowgow@email.com
```

```
red: #FF0000
green: #00FF00
blue: #0000FF
cyan: #00FFFF
magenta: #FF00FF
yellow: #FFFF00
```

```
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
```

```
- id: 1
  first name: Tiffanie
  last name: Bonhan
  email: tbonha0@sohu.com
  ip address: 27.189.213.24
- id: 2
  first name: Marielle
  last name: Scala
  email: mscala1@tuttocitta.it
  ip address: 232.18.211.108
- id: 3
  first name: Wheeler
  last name: Douce
  email: wdouce2@xing.com
  ip address: 194.87.70.152
- id: 4
  first name: Benedicta
  last name: Pitcher
  email: bpitcher3@macromedia.com
  ip address: 121.106.70.157
- id: 5
  first name: Kasey
  last name: Gutherson
  email: kgutherson4@mail.ru
  ip address: 32.37.84.111
```

```
title: delectus aut autem
user id: fa98b8ec-09d1648a-8f69420b-4b9e8eac
draft: false
pages: 5
```





### Conventions

There are no `true`, `false`, or `null`, but your code may use strings to represent them.

When this is the case, it's convention to use:

- `true`/`"true"` for true
- `false`/`"false"` for false
- `null`/`"null"` for null





### Why not use X instead?

Why not just use YAML?

- YAML has a ton of unnecessary "features"
- Way more convoluted than it should be
- Virtually none of the parsers implement the entire spec
- Behaves in suprising, inconsistent, and unexpected ways

Why not just JSON?

- Not as human readable
- Lots of extra characters which make it harder to manipulate quickly

Why not just use TOML?

- It's not as flexible
- It's not as human readable

Why not just use XML?

- It's incredibly verbose and repeats itself
- Ugly and not very human readable

**Why SMH?**

- So simple, you can even write your own parser
- Human readable
- No ambiguity

